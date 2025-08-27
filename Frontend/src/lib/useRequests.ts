import { useEffect, useMemo, useState } from 'react';
import { requestsAPI } from './api';
import { getSocket } from './socket';
import { useRequestsStore } from './requestsStore';

export type RequestItem = {
  _id?: string;
  id?: string;
  fromUser?: { _id?: string; name?: string };
  toUser?: { _id?: string; name?: string };
  createdAt?: string;
  message?: string;
  status?: 'pending' | 'accepted' | 'declined';
};

const getId = (r: RequestItem) => String(r._id ?? r.id);

export function useRequests() {
  const [incomingPending, setIncomingPending] = useState<RequestItem[]>([]);
  const [incomingHistory, setIncomingHistory] = useState<RequestItem[]>([]);
  const [sentPending, setSentPending] = useState<RequestItem[]>([]);
  const [sentHistory, setSentHistory] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(false);

  const addIncomingNotif = useRequestsStore((s) => s.addIncoming);
  const addSentNotif = useRequestsStore((s) => s.addSent);
  const markAcceptedNotif = useRequestsStore((s) => s.markAccepted);
  const markDeclinedNotif = useRequestsStore((s) => s.markDeclined);

  const refreshAll = async () => {
    setLoading(true);
    try {
      const [incPending, incAll, sentPendingRes, sentAll] = await Promise.all([
        requestsAPI.getIncoming('pending'),
        requestsAPI.getIncoming('all'),
        requestsAPI.getSent('pending'),
        requestsAPI.getSent('all'),
      ]);
      const incP = (incPending.data?.data ?? []) as RequestItem[];
      const incA = (incAll.data?.data ?? []) as RequestItem[];
      const sentP = (sentPendingRes.data?.data ?? []) as RequestItem[];
      const sentA = (sentAll.data?.data ?? []) as RequestItem[];

      setIncomingPending(incP);
      setIncomingHistory(incA.filter((r) => r.status && r.status !== 'pending'));
      setSentPending(sentP);
      setSentHistory(sentA.filter((r) => r.status && r.status !== 'pending'));
    } finally {
      setLoading(false);
    }
  };

  const accept = async (id: string) => {
    // optimistic: remove from incoming pending
    setIncomingPending((prev) => prev.filter((r) => getId(r) !== id));
    try {
      const res = await requestsAPI.accept(id);
      const updated: RequestItem | undefined = res.data?.data ?? undefined;
      if (updated) {
        setSentPending((prev) => prev.map((r) => (getId(r) === id ? { ...r, status: 'accepted' } : r)));
        setSentHistory((prev) => [{ ...updated, status: 'accepted' }, ...prev.filter((r) => getId(r) !== id)]);
      }
      markAcceptedNotif({ requestId: id });
    } catch (e) {
      // revert by refetching
      await refreshAll();
      throw e;
    }
  };

  const decline = async (id: string) => {
    // optimistic: remove from incoming pending
    setIncomingPending((prev) => prev.filter((r) => getId(r) !== id));
    try {
      const res = await requestsAPI.decline(id);
      const updated: RequestItem | undefined = res.data?.data ?? undefined;
      if (updated) {
        setSentPending((prev) => prev.map((r) => (getId(r) === id ? { ...r, status: 'declined' } : r)));
        setSentHistory((prev) => [{ ...updated, status: 'declined' }, ...prev.filter((r) => getId(r) !== id)]);
      }
      markDeclinedNotif({ requestId: id });
    } catch (e) {
      await refreshAll();
      throw e;
    }
  };

  const send = async (toUserId: string, message?: string) => {
    const res = await requestsAPI.create({ toUserId, message });
    const created: RequestItem = res.data?.data ?? res.data;
    if (created) {
      // optimistic: add to sent pending
      setSentPending((prev) => [created, ...prev.filter((r) => getId(r) !== getId(created))]);
    } else {
      await refreshAll();
    }
    return created;
  };

  // socket wiring
  useEffect(() => {
    const socket = getSocket();
    const onCreated = (payload: any) => {
      const req: RequestItem | undefined = payload?.request;
      if (!req) return;
      // request to me
      setIncomingPending((prev) => [req, ...prev.filter((r) => getId(r) !== getId(req))]);
      addIncomingNotif({ requestId: getId(req), fromName: req?.fromUser?.name });
    };
    const onSent = (payload: any) => {
      const req: RequestItem | undefined = payload?.request;
      if (!req) return;
      setSentPending((prev) => [req, ...prev.filter((r) => getId(r) !== getId(req))]);
      addSentNotif({ requestId: getId(req), toName: req?.toUser?.name });
    };
    const onAccepted = (payload: any) => {
      const req: RequestItem | undefined = payload?.request;
      if (!req) return;
      const id = getId(req);
      setIncomingPending((prev) => prev.filter((r) => getId(r) !== id));
      setSentPending((prev) => prev.filter((r) => getId(r) !== id));
      setIncomingHistory((prev) => [{ ...req, status: 'accepted' }, ...prev.filter((r) => getId(r) !== id)]);
      setSentHistory((prev) => [{ ...req, status: 'accepted' }, ...prev.filter((r) => getId(r) !== id)]);
      markAcceptedNotif({ requestId: id });
    };
    const onDeclined = (payload: any) => {
      const req: RequestItem | undefined = payload?.request;
      if (!req) return;
      const id = getId(req);
      setIncomingPending((prev) => prev.filter((r) => getId(r) !== id));
      setSentPending((prev) => prev.filter((r) => getId(r) !== id));
      setIncomingHistory((prev) => [{ ...req, status: 'declined' }, ...prev.filter((r) => getId(r) !== id)]);
      setSentHistory((prev) => [{ ...req, status: 'declined' }, ...prev.filter((r) => getId(r) !== id)]);
      markDeclinedNotif({ requestId: id });
    };

    socket.on('request:created', onCreated);
    socket.on('request:sent', onSent);
    socket.on('request:accepted', onAccepted);
    socket.on('request:declined', onDeclined);

    return () => {
      socket.off('request:created', onCreated);
      socket.off('request:sent', onSent);
      socket.off('request:accepted', onAccepted);
      socket.off('request:declined', onDeclined);
    };
  }, [addIncomingNotif, addSentNotif, markAcceptedNotif, markDeclinedNotif]);

  useEffect(() => {
    refreshAll();
  }, []);

  const counts = useMemo(() => ({
    incomingPending: incomingPending.length,
    incomingHistory: incomingHistory.length,
    sentPending: sentPending.length,
    sentHistory: sentHistory.length,
  }), [incomingPending.length, incomingHistory.length, sentPending.length, sentHistory.length]);

  return {
    loading,
    refreshAll,
    incomingPending,
    incomingHistory,
    sentPending,
    sentHistory,
    counts,
    accept,
    decline,
    send,
  };
}
