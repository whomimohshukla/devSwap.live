import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Play,
  Square,
  CheckCircle
} from 'lucide-react';
import { sessionsAPI, usersAPI, aiAPI } from '../lib/api';

type UserRef = { _id?: string; name?: string; avatar?: string };
type SessionItem = {
  _id?: string;
  id?: string;
  userA: UserRef;
  userB: UserRef;
  isActive: boolean;
  startedAt?: string;
  endedAt?: string;
  skillFromA?: string;
  skillFromB?: string;
};

const Sessions: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [activeSessions, setActiveSessions] = useState<SessionItem[]>([]);
  const [completedSessions, setCompletedSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [meId, setMeId] = useState<string | null>(null);
  // Expanded details toggles per session
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  // AI summaries per session
  const [summaries, setSummaries] = useState<Record<string, string | null>>({});
  const [summaryLoading, setSummaryLoading] = useState<Record<string, boolean>>({});
  const [summaryError, setSummaryError] = useState<Record<string, string | null>>({});
  // Cached lesson plans (fetched once) keyed by sessionId
  const [plansBySession, setPlansBySession] = useState<Record<string, any[]>>({});
  // Personal notes per session (local only)
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem('sessionNotes');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [meRes, allRes] = await Promise.all([
        usersAPI.getMe(),
        sessionsAPI.getSessions({ status: 'all', page: 1, limit: 50 }),
      ]);
      const me = meRes.data?.data ?? meRes.data ?? {};
      setMeId(me?._id || me?.id || null);
      const list = (allRes.data?.sessions ?? allRes.data?.data ?? allRes.data ?? []) as any[];
      const safeList = Array.isArray(list) ? list : [];
      const act = safeList.filter((s) => s?.isActive === true || (!s?.endedAt && s?.isActive !== false));
      const ended = safeList.filter((s) => s?.isActive === false || !!s?.endedAt);
      setActiveSessions(act);
      setCompletedSessions(ended);
      // Precompute expanded state as collapsed
      const exp: Record<string, boolean> = {};
      safeList.forEach((s: any) => {
        const id = String(s._id ?? s.id);
        if (id) exp[id] = false;
      });
      setExpanded(exp);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Load cached lesson plans once and index by sessionId
  useEffect(() => {
    (async () => {
      try {
        const res = await aiAPI.getCachedPlans();
        const list = res.data?.plans ?? res.data?.data ?? res.data ?? [];
        const map: Record<string, any[]> = {};
        (Array.isArray(list) ? list : []).forEach((p: any) => {
          const sid = String(p.sessionId ?? p.sessionID ?? p.session_id ?? '');
          if (!sid) return;
          if (!map[sid]) map[sid] = [];
          map[sid].push(p);
        });
        setPlansBySession(map);
      } catch {
        // ignore if unavailable
      }
    })();
  }, []);

  // Persist notes locally
  useEffect(() => {
    try { localStorage.setItem('sessionNotes', JSON.stringify(notes)); } catch {}
  }, [notes]);

  const partnerOf = (s: SessionItem): UserRef | undefined => {
    const my = meId;
    if (!my) return undefined;
    const aId = s.userA?._id || (s as any).userA?.id;
    return String(aId) === String(my) ? s.userB : s.userA;
  };

  const handleJoinSession = async (sessionId: string) => {
    try {
      await sessionsAPI.joinSession(String(sessionId));
      setToast({ type: 'success', msg: 'Joined session' });
      // Navigate to real-time room
      navigate(`/sessions/${sessionId}/room`);
    } catch (e: any) {
      setToast({ type: 'error', msg: e?.response?.data?.message || e?.message || 'Failed to join session' });
    } finally {
      setTimeout(() => setToast(null), 2000);
    }
  };

  const handleToggleExpand = (sessionId: string) => {
    setExpanded((prev) => ({ ...prev, [sessionId]: !prev[sessionId] }));
  };

  const handleGenerateSummary = async (sessionId: string) => {
    setSummaryLoading((p) => ({ ...p, [sessionId]: true }));
    setSummaryError((p) => ({ ...p, [sessionId]: null }));
    try {
      // Find session to compute duration
      const s = [...activeSessions, ...completedSessions].find((x) => String(x._id ?? x.id) === String(sessionId));
      const started = s?.startedAt ? new Date(String(s.startedAt)).getTime() : undefined;
      const ended = s?.endedAt ? new Date(String(s.endedAt)).getTime() : Date.now();
      const durationSec = started ? Math.max(0, Math.round((ended - started) / 1000)) : undefined;
      const sessionNotes = notes[String(sessionId)] || '';

      const res = await aiAPI.getSessionSummary(String(sessionId), { sessionNotes, duration: durationSec });
      const text = res.data?.summary ?? res.data?.data?.summary ?? res.data ?? '';
      setSummaries((p) => ({ ...p, [sessionId]: typeof text === 'string' ? text : JSON.stringify(text, null, 2) }));
      setToast({ type: 'success', msg: 'AI summary generated' });
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to generate summary';
      setSummaryError((p) => ({ ...p, [sessionId]: msg }));
      setToast({ type: 'error', msg });
    } finally {
      setSummaryLoading((p) => ({ ...p, [sessionId]: false }));
      setTimeout(() => setToast(null), 2000);
    }
  };

  const handleEndSession = async (sessionId: string) => {
    // optimistic: move from active to completed
    const s = activeSessions.find((x) => String(x._id ?? x.id) === String(sessionId));
    setActiveSessions((prev) => prev.filter((x) => String(x._id ?? x.id) !== String(sessionId)));
    if (s) setCompletedSessions((prev) => [{ ...s, isActive: false, endedAt: new Date().toISOString() }, ...prev]);
    try {
      await sessionsAPI.endSession(String(sessionId));
      setToast({ type: 'success', msg: 'Session ended' });
    } catch (e: any) {
      // revert
      await load();
      setToast({ type: 'error', msg: e?.response?.data?.message || e?.message || 'Failed to end session' });
    } finally {
      setTimeout(() => setToast(null), 2000);
    }
  };

  const counts = useMemo(() => ({
    active: activeSessions.length,
    completed: completedSessions.length,
  }), [activeSessions.length, completedSessions.length]);

  return (
    <div className="min-h-screen bg-black pt-24 pb-8">
      <div className="max-w-none w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Learning Sessions
            </h1>
            <p className="text-gray-400">
              Manage your skill exchange sessions
            </p>
          </div>
          {/* Scheduling UI not implemented in backend; hiding for now */}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-gray-900 p-1 rounded-lg w-fit">
            {[
              { key: 'active', label: 'Active', count: counts.active },
              { key: 'completed', label: 'Completed', count: counts.completed },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === (tab.key as any)
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
                <span className="ml-2 px-2 py-0.5 text-xs rounded bg-gray-800 text-gray-300">{tab.count}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* How sessions work & Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-[#0b0c0d] rounded-2xl border border-[#25282c] p-5">
              <h3 className="text-white font-semibold mb-2">How sessions work</h3>
              <ol className="list-decimal list-inside text-sm text-gray-300 space-y-1">
                <li>Accept a match request or create one from Matches</li>
                <li>Join the room for live voice/video and screen share</li>
                <li>Collaborate, teach, and learn in real time</li>
                <li>End the session — summaries and notes live here</li>
              </ol>
            </div>
            <div className="bg-[#0b0c0d] rounded-2xl border border-[#25282c] p-5">
              <h3 className="text-white font-semibold mb-2">What you can do</h3>
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                <li>1:1 voice/video, mute/camera toggle, push‑to‑talk</li>
                <li>Share your screen to demo or pair-program</li>
                <li>Use in‑room chat and see participants</li>
                <li>Save personal notes; generate AI summaries</li>
              </ul>
            </div>
            <div className="bg-[#0b0c0d] rounded-2xl border border-[#25282c] p-5">
              <h3 className="text-white font-semibold mb-2">Privacy & consent</h3>
              <p className="text-sm text-gray-300">Ask before recording or sharing content. Use respectful communication and protect sensitive information. You’re in control of your mic/camera and what you share.</p>
            </div>
            <div className="bg-[#0b0c0d] rounded-2xl border border-[#25282c] p-5 lg:col-span-3">
              <h3 className="text-white font-semibold mb-2">Using AI on your sessions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-black/40 border border-[#25282c] rounded-lg p-3">
                  <div className="text-gray-200 font-medium mb-1">1) Take quick notes</div>
                  <p className="text-gray-400">Jot down bullets during or after the call in "My Notes". Notes stay local to your browser.</p>
                </div>
                <div className="bg-black/40 border border-[#25282c] rounded-lg p-3">
                  <div className="text-gray-200 font-medium mb-1">2) Generate a summary</div>
                  <p className="text-gray-400">Click Generate in the AI Summary panel. We send your notes and session duration to the AI and show a concise recap.</p>
                </div>
                <div className="bg-black/40 border border-[#25282c] rounded-lg p-3">
                  <div className="text-gray-200 font-medium mb-1">Tips & troubleshooting</div>
                  <ul className="list-disc list-inside text-gray-400 space-y-1">
                    <li>Be specific in notes: goals, blockers, next steps.</li>
                    <li>If you see an OpenAI auth error, remove OPENAI_ORG/PROJECT from your .env.</li>
                    <li>Summaries are not auto-saved; copy important points.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'active' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {(loading && activeSessions.length === 0) && (
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 animate-pulse">
                  <div className="h-4 w-40 bg-gray-800 rounded mb-2" />
                  <div className="h-3 w-28 bg-gray-800 rounded mb-4" />
                  <div className="h-3 w-full bg-gray-800 rounded mb-2" />
                  <div className="h-3 w-3/4 bg-gray-800 rounded" />
                </div>
              )}
              {!loading && activeSessions.length === 0 && (
                <div className="lg:col-span-2 text-center text-gray-400">No active sessions</div>
              )}
              {activeSessions.map((session, index) => (
                <motion.div
                  key={session._id || session.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`${expanded[String(session._id || session.id)] ? 'lg:col-span-2' : ''} bg-[#0b0c0d] rounded-2xl p-6 border border-[#25282c] hover:border-[#2f343a] transition-colors`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br from-emerald-500/30 to-indigo-500/30 border border-[#25282c]">
                        {(partnerOf(session)?.name?.[0] || 'U').toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{partnerOf(session)?.name || 'Partner'}</h3>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Active
                          </span>
                        </div>
                        <p className="text-gray-400 mb-2">Skill swap session</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                          <Clock className="w-4 h-4" />
                          <span>Started {new Date(session.startedAt || Date.now()).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleJoinSession(String(session._id || session.id))} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center shadow-sm">
                        <Play className="w-4 h-4 mr-1" /> Join
                      </button>
                      <button onClick={() => handleEndSession(String(session._id || session.id))} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center shadow-sm">
                        <Square className="w-4 h-4 mr-1" /> End
                      </button>
                      <button onClick={() => handleToggleExpand(String(session._id || session.id))} className="px-3 py-1.5 border border-[#2f343a] hover:border-[#3a4047] text-gray-300 rounded-md">
                        {expanded[String(session._id || session.id)] ? 'Hide' : 'Details'}
                      </button>
                    </div>
                  </div>
                  {expanded[String(session._id || session.id)] && (
                    <div className="mt-4 space-y-4">
                      {/* AI Summary */}
                      <div className="bg-black/40 border border-[#25282c] rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-white">AI Summary</h4>
                          <button onClick={() => handleGenerateSummary(String(session._id || session.id))} className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded">
                            {summaryLoading[String(session._id || session.id)] ? 'Generating…' : 'Generate'}
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">Uses your notes and session duration to produce a concise recap. Your notes remain local.</p>
                        {summaryError[String(session._id || session.id)] && (
                          <div className="text-xs text-red-400 mb-2">{summaryError[String(session._id || session.id)]}</div>
                        )}
                        <pre className="bg-black/50 text-gray-200 text-xs p-3 rounded border border-[#25282c] whitespace-pre-wrap">
{summaries[String(session._id || session.id)] || 'No summary yet.'}
                        </pre>
                      </div>
                      {/* Lesson Plans */}
                      <div className="bg-black/40 border border-[#25282c] rounded-xl p-3">
                        <h4 className="text-sm font-semibold text-white mb-2">Lesson Plans</h4>
                        {Array.isArray(plansBySession[String(session._id || session.id)]) && plansBySession[String(session._id || session.id)].length > 0 ? (
                          <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
                            {plansBySession[String(session._id || session.id)].map((p: any, i: number) => (
                              <li key={i}>
                                <span className="font-medium">{p.skill || p.title || 'Plan'}</span>{' '}
                                <span className="text-gray-500">({new Date(p.createdAt || p.date || Date.now()).toLocaleString()})</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-xs text-gray-400">No cached lesson plans found.</div>
                        )}
                      </div>
                      {/* Personal Notes */}
                      <div className="bg-black/40 border border-[#25282c] rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-white">My Notes</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-[#2f343a]">Saved locally</span>
                        </div>
                        <textarea
                          className="w-full bg-black/50 text-gray-200 text-sm p-3 rounded border border-[#25282c] focus:outline-none focus:ring-1 focus:ring-emerald-600 min-h-[90px]"
                          placeholder="Write notes about this session..."
                          value={notes[String(session._id || session.id)] || ''}
                          onChange={(e) => setNotes((prev) => ({ ...prev, [String(session._id || session.id)]: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
          {activeTab === 'completed' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {(loading && completedSessions.length === 0) && (
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 animate-pulse">
                  <div className="h-4 w-40 bg-gray-800 rounded mb-2" />
                  <div className="h-3 w-28 bg-gray-800 rounded mb-4" />
                  <div className="h-3 w-full bg-gray-800 rounded mb-2" />
                  <div className="h-3 w-3/4 bg-gray-800 rounded" />
                </div>
              )}
              {!loading && completedSessions.length === 0 && (
                <div className="lg:col-span-2 text-center text-gray-400">No completed sessions</div>
              )}
              {completedSessions.map((session, index) => (
                <motion.div
                  key={session._id || session.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`${expanded[String(session._id || session.id)] ? 'lg:col-span-2' : ''} bg-[#0b0c0d] rounded-2xl p-6 border border-[#25282c] hover:border-[#2f343a] transition-colors`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br from-emerald-500/30 to-indigo-500/30 border border-[#25282c]">
                        {(partnerOf(session)?.name?.[0] || 'U').toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{partnerOf(session)?.name || 'Partner'}</h3>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Completed
                          </span>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-gray-400 mb-2">Skill swap session</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                          <span>{new Date(session.endedAt || session.startedAt || Date.now()).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleToggleExpand(String(session._id || session.id))} className="px-3 py-1.5 border border-[#2f343a] hover:border-[#3a4047] text-gray-300 rounded-md">
                        {expanded[String(session._id || session.id)] ? 'Hide' : 'Details'}
                      </button>
                    </div>
                  </div>
                  {expanded[String(session._id || session.id)] && (
                    <div className="mt-4 space-y-4">
                      {/* AI Summary */}
                      <div className="bg-black/40 border border-[#25282c] rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-white">AI Summary</h4>
                          <button onClick={() => handleGenerateSummary(String(session._id || session.id))} className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded">
                            {summaryLoading[String(session._id || session.id)] ? 'Generating…' : 'Generate'}
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">Uses your notes and session duration to produce a concise recap. Your notes remain local.</p>
                        {summaryError[String(session._id || session.id)] && (
                          <div className="text-xs text-red-400 mb-2">{summaryError[String(session._id || session.id)]}</div>
                        )}
                        <pre className="bg-black/50 text-gray-200 text-xs p-3 rounded border border-[#25282c] whitespace-pre-wrap">
{summaries[String(session._id || session.id)] || 'No summary yet.'}
                        </pre>
                      </div>
                      {/* Lesson Plans */}
                      <div className="bg-black/40 border border-[#25282c] rounded-xl p-3">
                        <h4 className="text-sm font-semibold text-white mb-2">Lesson Plans</h4>
                        {Array.isArray(plansBySession[String(session._id || session.id)]) && plansBySession[String(session._id || session.id)].length > 0 ? (
                          <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
                            {plansBySession[String(session._id || session.id)].map((p: any, i: number) => (
                              <li key={i}>
                                <span className="font-medium">{p.skill || p.title || 'Plan'}</span>{' '}
                                <span className="text-gray-500">({new Date(p.createdAt || p.date || Date.now()).toLocaleString()})</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-xs text-gray-400">No cached lesson plans found.</div>
                        )}
                      </div>
                      {/* Personal Notes */}
                      <div className="bg-black/40 border border-[#25282c] rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-white">My Notes</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-[#2f343a]">Saved locally</span>
                        </div>
                        <textarea
                          className="w-full bg-black/50 text-gray-200 text-sm p-3 rounded border border-[#25282c] focus:outline-none focus:ring-1 focus:ring-emerald-600 min-h-[90px]"
                          placeholder="Write notes about this session..."
                          value={notes[String(session._id || session.id)] || ''}
                          onChange={(e) => setNotes((prev) => ({ ...prev, [String(session._id || session.id)]: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="text-center py-4 text-red-400">
            {error}
          </motion.div>
        )}
        {toast && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-md text-white ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sessions;
