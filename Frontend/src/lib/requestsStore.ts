import { create } from 'zustand';

export type RequestEventType = 'created' | 'sent' | 'accepted' | 'declined';

export interface RequestNotification {
  id: string;
  type: RequestEventType;
  title: string;
  message: string;
  timestamp: number;
}

interface RequestsState {
  unreadIncomingCount: number;
  notifications: RequestNotification[];
  // actions
  addIncoming: (opts: { requestId: string; fromName?: string }) => void;
  addSent: (opts: { requestId: string; toName?: string }) => void;
  markAccepted: (opts: { requestId: string }) => void;
  markDeclined: (opts: { requestId: string }) => void;
  markAllRead: () => void;
}

export const useRequestsStore = create<RequestsState>((set) => ({
  unreadIncomingCount: 0,
  notifications: [],
  addIncoming: ({ requestId, fromName }) =>
    set((s) => ({
      unreadIncomingCount: s.unreadIncomingCount + 1,
      notifications: [
        {
          id: `${requestId}:created`,
          type: 'created' as const,
          title: 'New Request',
          message: fromName ? `${fromName} sent you a request` : 'You have a new request',
          timestamp: Date.now(),
        },
        ...s.notifications,
      ].slice(0, 20),
    })),
  addSent: ({ requestId, toName }) =>
    set((s) => ({
      notifications: [
        {
          id: `${requestId}:sent`,
          type: 'sent' as const,
          title: 'Request Sent',
          message: toName ? `You sent a request to ${toName}` : 'Request sent',
          timestamp: Date.now(),
        },
        ...s.notifications,
      ].slice(0, 20),
    })),
  markAccepted: ({ requestId }) =>
    set((s) => ({
      notifications: [
        {
          id: `${requestId}:accepted`,
          type: 'accepted' as const,
          title: 'Request Accepted',
          message: 'Your request was accepted. You can start a session now.',
          timestamp: Date.now(),
        },
        ...s.notifications,
      ].slice(0, 20),
    })),
  markDeclined: ({ requestId }) =>
    set((s) => ({
      notifications: [
        {
          id: `${requestId}:declined`,
          type: 'declined' as const,
          title: 'Request Declined',
          message: 'Your request was declined.',
          timestamp: Date.now(),
        },
        ...s.notifications,
      ].slice(0, 20),
    })),
  markAllRead: () => set({ unreadIncomingCount: 0 }),
}));
