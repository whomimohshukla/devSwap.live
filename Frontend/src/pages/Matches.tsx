import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MessageCircle, 
  Video, 
  Star, 
  Clock,
  MapPin,
  CheckCircle,
  X,
  Heart,
  Loader2
} from 'lucide-react';
import { usersAPI, matchAPI } from '../lib/api';
import { useLocation } from 'react-router-dom';
import { getSocket } from '../lib/socket';
import { useMatchStore } from '../lib/matchStore';

const Matches: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matches' | 'requests' | 'sent'>('matches');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const searching = useMatchStore((s) => s.searching);
  const setSearching = useMatchStore((s) => s.setSearching);
  const matchedPartner = useMatchStore((s) => s.matchedPartner);
  const setMatchedPartner = useMatchStore((s) => s.setMatchedPartner);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const location = useLocation();
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const requests: any[] = [];
  const sentRequests: any[] = [];
  // no auth store usage needed here currently

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await usersAPI.getMatches();
      const data = res.data?.data ?? res.data ?? [];
      setMatches(Array.isArray(data) ? data : (data.matches ?? []));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup socket ref on unmount
  useEffect(() => {
    return () => {
      socketRef.current = null;
    };
  }, []);

  // Requests are not yet backed by API in this UI; keep stubs to satisfy buttons if any remain
  const handleAcceptRequest = (_id: string | number) => {
    console.log('Accept request', _id);
  };
  const handleDeclineRequest = (_id: string | number) => {
    console.log('Decline request', _id);
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // Auto-start matching when coming from dashboard with ?search=1
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldSearch = params.get('search') === '1';
    if (shouldSearch) {
      handleJoinQueue(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const handleConnect = async (_matchId: string) => {
    // Placeholder: integrate chat/session start later
    console.log('Connecting with match:', _matchId);
  };

  // Setup socket listeners (once)
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    const onMatchFound = (payload: any) => {
      setSearching(false);
      setMatchedPartner({
        id: payload?.partner?.id || payload?.partnerId,
        name: payload?.partner?.name || payload?.name,
        avatarUrl: payload?.partner?.avatarUrl,
        skills: payload?.partner?.skills,
        timezone: payload?.partner?.timezone,
      });
      setToast({ type: 'success', msg: 'We found a match for you!' });
      setTimeout(() => setToast(null), 2500);
      fetchMatches();
    };
    const onQueueJoined = () => {
      // server acknowledged we are in queue
    };
    const onQueueLeft = () => {
      setSearching(false);
    };
    socket.on('match:found', onMatchFound);
    socket.on('match:queue:joined', onQueueJoined);
    socket.on('match:queue:left', onQueueLeft);
    return () => {
      socket.off('match:found', onMatchFound);
      socket.off('match:queue:joined', onQueueJoined);
      socket.off('match:queue:left', onQueueLeft);
    };
  }, [setMatchedPartner, setSearching]);

  const handleJoinQueue = async (fromAuto?: boolean) => {
    try {
      setError(null);
      setSearching(true);
      await matchAPI.findMatch();
      if (!fromAuto) {
        setToast({ type: 'success', msg: 'Searching for a matching partner…' });
        setTimeout(() => setToast(null), 2500);
      }
    } catch (e: any) {
      setSearching(false);
      setToast({ type: 'error', msg: e?.response?.data?.message || e?.message || 'Failed to join matching queue' });
      setTimeout(() => setToast(null), 3500);
    }
  };

  const handleLeaveQueue = async () => {
    try {
      await matchAPI.rejectMatch('');
    } finally {
      setSearching(false);
      setToast({ type: 'success', msg: 'Stopped searching.' });
      setTimeout(() => setToast(null), 2000);
    }
  };

  const normalizedMatches = useMemo(() => {
    return matches.map((m: any) => ({
      id: m._id ?? m.id,
      name: m.name ?? m.partnerName ?? m.user?.name ?? 'Developer',
      avatar: (m.name ?? m.partnerName ?? m.user?.name ?? 'D')
        .split(' ')
        .map((s: string) => s[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      location: m.location ?? '—',
      rating: m.rating ?? 5,
      sessionsCompleted: m.sessionsCompleted ?? m.stats?.sessionsCompleted ?? 0,
      teachSkills: m.teachSkills ?? m.skills?.teach ?? [],
      learnSkills: m.learnSkills ?? m.skills?.learn ?? [],
      bio: m.bio ?? '',
      matchScore: m.matchScore ?? m.score ?? 0,
      isOnline: m.isOnline ?? m.status?.online ?? false,
      lastSeen: m.lastSeen ?? m.status?.lastSeen ?? '—',
    }));
  }, [matches]);

  return (
    <div className="min-h-screen bg-black pt-24 pb-8">
      {/* Match Found Modal */}
      {matchedPartner && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Match Found</h3>
              <button onClick={() => setMatchedPartner(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-emerald-600/20 flex items-center justify-center text-white text-lg font-semibold">
                {matchedPartner.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-white font-medium">{matchedPartner.name || 'Partner'}</p>
                {matchedPartner.skills && matchedPartner.skills.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {matchedPartner.skills.slice(0,4).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-gray-300 mb-6">You’ve been matched! Start a session or chat to kick things off.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setMatchedPartner(null)}
                className="px-4 py-2 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700"
              >
                Later
              </button>
              <button
                onClick={() => { window.location.href = '/sessions'; }}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Start Session
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Sticky Searching Banner */}
      {searching && (
        <div className="fixed top-16 left-0 right-0 z-30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-4 py-3 flex items-center justify-between backdrop-blur">
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p className="text-sm">Searching for a matching partner… We’ll notify you here.</p>
              </div>
              <button onClick={handleLeaveQueue} className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast / Snackbar */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-30">
          <div className={`px-4 py-3 rounded-lg border shadow-lg ${toast.type === 'success' ? 'bg-emerald-600/90 border-emerald-400 text-white' : 'bg-red-600/90 border-red-400 text-white'}`}>
            {toast.msg}
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-200 bg-clip-text text-transparent">
            Find Learning Partners
          </h1>
          <p className="text-gray-300 max-w-2xl">
            Connect with developers who have complementary skills
          </p>
          {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
          <div className="mt-5 flex gap-3">
            <button onClick={() => handleJoinQueue()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_28px_rgba(0,239,104,0.25)] transition">
              <Users className="w-4 h-4" />
              Join Matching Queue
            </button>
            <button onClick={handleLeaveQueue} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 transition">
              <X className="w-4 h-4" />
              Leave Queue
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-[#0f1113] border border-gray-800 p-1 rounded-xl w-fit shadow-inner">
            {[
              { key: 'matches', label: 'Matches', count: normalizedMatches.length },
              { key: 'requests', label: 'Requests', count: requests.length },
              { key: 'sent', label: 'Sent', count: sentRequests.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-gray-700 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'matches' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {(loading || searching) && (
                <>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-gray-900 rounded-xl p-6 border border-gray-800 animate-pulse">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-800 rounded-full" />
                          <div>
                            <div className="h-4 w-40 bg-gray-800 rounded mb-2" />
                            <div className="h-3 w-24 bg-gray-800 rounded" />
                          </div>
                        </div>
                        <div className="h-4 w-14 bg-gray-800 rounded" />
                      </div>
                      <div className="h-3 w-full bg-gray-800 rounded mb-2" />
                      <div className="h-3 w-3/4 bg-gray-800 rounded mb-6" />
                      <div className="flex gap-2">
                        {Array.from({ length: 4 }).map((__, j) => (
                          <div key={j} className="h-6 w-20 bg-gray-800 rounded" />
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
              {!loading && normalizedMatches.length === 0 && (
                <div className="bg-[#0f1113] border border-gray-800 rounded-2xl p-10 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No matches yet</h3>
                  <p className="text-gray-400 mb-6">Join the queue and we’ll find the best partners for you.</p>
                  <button onClick={() => handleJoinQueue()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Users className="w-4 h-4" />
                    Join Matching Queue
                  </button>
                </div>
              )}
              {!loading && normalizedMatches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {match.avatar}
                        </div>
                        {match.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{match.name}</h3>
                        <div className="flex items-center space-x-2 text-gray-400 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{match.location}</span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-white text-sm">{match.rating}</span>
                          </div>
                          <span className="text-gray-400 text-sm">
                            {match.sessionsCompleted} sessions
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-brand)' }}></span>
                        <span className="text-[var(--color-brand)] font-medium">{match.matchScore}%</span>
                      </div>
                      <span className="text-gray-400 text-sm">
                        {match.isOnline ? 'Online now' : `Last seen ${match.lastSeen}`}
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    {match.bio}
                  </p>

                  {/* Skills */}
                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Can teach:</p>
                      <div className="flex flex-wrap gap-2">
                        {match.teachSkills.map((skill: string) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm border border-emerald-500/30"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Wants to learn:</p>
                      <div className="flex flex-wrap gap-2">
                        {match.learnSkills.map((skill: string) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm border border-blue-500/30"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleConnect(String(match.id))}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Connect</span>
                    </button>
                    <button className="px-4 py-2 border border-gray-600 hover:border-emerald-500 text-gray-300 hover:text-white rounded-lg transition-colors">
                      <Video className="w-4 h-4" />
                    </button>
                    <button className="px-4 py-2 border border-gray-600 hover:border-red-500 text-gray-300 hover:text-red-400 rounded-lg transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'requests' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {requests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gray-900 rounded-xl p-6 border border-gray-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {request.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-white font-semibold">{request.name}</h3>
                          <span className="text-gray-400 text-sm">wants to learn</span>
                          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-sm">
                            {request.skill}
                          </span>
                        </div>
                        <p className="text-gray-300 mb-3">{request.message}</p>
                        <div className="flex items-center space-x-2 text-gray-400 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{request.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(request.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'sent' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {sentRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gray-900 rounded-xl p-6 border border-gray-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {request.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-white font-semibold">{request.name}</h3>
                          <span className="text-gray-400 text-sm">•</span>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">
                            {request.skill}
                          </span>
                        </div>
                        <p className="text-gray-300 mb-3">{request.message}</p>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2 text-gray-400 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{request.time}</span>
                          </div>
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm">
                            {request.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Empty State */}
        {((activeTab === 'matches' && normalizedMatches.length === 0) ||
          (activeTab === 'requests' && requests.length === 0) ||
          (activeTab === 'sent' && sentRequests.length === 0)) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-12"
          >
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">
              {activeTab === 'matches' && 'No matches found'}
              {activeTab === 'requests' && 'No requests received'}
              {activeTab === 'sent' && 'No requests sent'}
            </h3>
            <p className="text-gray-500">
              {activeTab === 'matches' && 'Try updating your skills or preferences to find better matches'}
              {activeTab === 'requests' && 'When developers want to connect with you, they\'ll appear here'}
              {activeTab === 'sent' && 'Your connection requests will appear here'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Matches;
