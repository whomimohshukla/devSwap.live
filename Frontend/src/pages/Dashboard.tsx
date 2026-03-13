import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Clock,
  Star,
  Code2,
  Calendar,
  Award,
  Activity,
  Trophy,
  Target,
  Sparkles,
  ListChecks,
  ArrowRight
 } from 'lucide-react';
import { usersAPI, sessionsAPI, matchAPI } from '../lib/api';
import { useAuthStore } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../lib/socket';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<any | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [findingMatch, setFindingMatch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, sessionsRes, activityRes] = await Promise.all([
          usersAPI.getStatsOverview(),
          sessionsAPI.getSessions(),
          usersAPI.getActivity(),
        ]);
        if (!mounted) return;
        setStatsData(statsRes.data?.data ?? statsRes.data ?? null);
        const list = sessionsRes.data?.data ?? sessionsRes.data ?? [];
        setSessions(Array.isArray(list) ? list : (list.sessions ?? []));
        const activityPayload = activityRes.data?.data ?? activityRes.data ?? [];
        // Backend may return either an array of activity items OR an object
        // with recentSessions/activity. Normalize to an array for the feed.
        if (Array.isArray(activityPayload)) {
          setActivity(activityPayload);
        } else {
          const recentSessions =
            activityPayload?.recentSessions ??
            activityPayload?.sessions ??
            activityPayload?.items ??
            [];
          const normalized = (Array.isArray(recentSessions) ? recentSessions : []).map((s: any) => {
            const startedAt = s.startedAt ?? s.startTime ?? s.createdAt;
            const endedAt = s.endedAt ?? s.endTime ?? s.updatedAt;
            const when = endedAt ?? startedAt ?? Date.now();
            const skill = s.skill ?? s.topic ?? s.skillFromA ?? s.skillFromB;
            return {
              type: 'session',
              action: (s.isActive === false || s.endedAt) ? 'Session completed' : 'Session started',
              skill,
              createdAt: when,
              time: when,
              user: activityPayload?.user,
            };
          });
          setActivity(normalized);
        }
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? 'Failed to load dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Realtime updates via Socket.io
  useEffect(() => {
    const socket = getSocket();

    // Stats updated (e.g., after session completes)
    const onStatsUpdate = (data: any) => {
      setStatsData((prev: any) => ({ ...(prev || {}), ...(data || {}) }));
    };

    // Session lifecycle updates
    const onSessionCreated = (s: any) => {
      setSessions((prev) => [s, ...prev]);
    };
    const onSessionUpdated = (s: any) => {
      setSessions((prev) => prev.map((it: any) => (it._id === s._id || it.id === s.id ? { ...it, ...s } : it)));
    };
    const onSessionDeleted = (s: any) => {
      setSessions((prev) => prev.filter((it: any) => (it._id ?? it.id) !== (s._id ?? s.id)));
    };

    // Activity feed updates
    const onActivity = (a: any) => {
      setActivity((prev) => [a, ...prev].slice(0, 50));
    };

    // Matching flow updates
    const onMatchFound = (payload: any) => {
      // Stop spinner and redirect to matches (or room if provided)
      setFindingMatch(false);
      const roomSessionId = payload?.sessionId || payload?.session_id;
      if (roomSessionId) {
        navigate(`/sessions/${roomSessionId}/room`);
      } else {
        navigate('/matches?search=1');
      }
    };
    const onMatchError = (_payload: any) => {
      setFindingMatch(false);
    };

    socket.on('stats:update', onStatsUpdate);
    socket.on('session:created', onSessionCreated);
    socket.on('session:updated', onSessionUpdated);
    socket.on('session:deleted', onSessionDeleted);
    socket.on('activity:new', onActivity);
    socket.on('match:found', onMatchFound);
    socket.on('match:error', onMatchError);

    return () => {
      socket.off('stats:update', onStatsUpdate);
      socket.off('session:created', onSessionCreated);
      socket.off('session:updated', onSessionUpdated);
      socket.off('session:deleted', onSessionDeleted);
      socket.off('activity:new', onActivity);
      socket.off('match:found', onMatchFound);
      socket.off('match:error', onMatchError);
    };
  }, [navigate]);

  const stats = useMemo(() => {
    const completed = statsData?.sessionsCompleted ?? statsData?.sessions_completed ?? 0;
    const taught = statsData?.skillsTaught ?? statsData?.skills_taught ?? (user?.teachSkills?.length || 0);
    const learned = statsData?.skillsLearned ?? statsData?.skills_learned ?? (user?.learnSkills?.length || 0);
    const hours = statsData?.hoursExchanged ?? statsData?.hours_exchanged ?? 0;
    return [
      { label: 'Sessions Completed', value: String(completed), icon: BookOpen },
      { label: 'Skills Taught', value: String(taught), icon: Code2 },
      { label: 'Skills Learned', value: String(learned), icon: TrendingUp },
      { label: 'Hours Exchanged', value: String(hours), icon: Clock },
    ];
  }, [statsData, user]);

  const badges = useMemo(() => {
    const completed = Number(statsData?.sessionsCompleted ?? statsData?.sessions_completed ?? 0);
    const hours = Number(statsData?.hoursExchanged ?? statsData?.hours_exchanged ?? 0);
    const taught = Number(statsData?.skillsTaught ?? statsData?.skills_taught ?? 0);
    const items: { icon: any; label: string; desc: string }[] = [];
    if (completed >= 1) items.push({ icon: Trophy, label: 'First Swap', desc: 'Completed your first session' });
    if (completed >= 10) items.push({ icon: Award, label: 'Top Swapper', desc: '10+ sessions completed' });
    if (hours >= 20) items.push({ icon: Clock, label: 'Time Investor', desc: '20+ hours exchanged' });
    if (taught >= 1) items.push({ icon: Code2, label: 'Mentor', desc: 'Shared your skills' });
    return items.slice(0, 6);
  }, [statsData]);

  const skillProgress = useMemo(() => {
    const teach = (user?.teachSkills ?? []).slice(0, 6).map((s: any) => ({
      kind: 'teach',
      name: s.name ?? s,
      level: s.level ?? 3,
    }));
    const learn = (user?.learnSkills ?? []).slice(0, 6).map((s: any) => ({
      kind: 'learn',
      name: s.name ?? s,
      level: s.level ?? 2,
    }));
    return [...teach, ...learn].slice(0, 8);
  }, [user]);

  const handleGetMatched = async () => {
    try {
      setError(null);
      setFindingMatch(true);
      await matchAPI.findMatch();
      navigate('/matches?search=1');
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to start matching');
      setFindingMatch(false);
    }
  };

  const handleCancelMatching = async () => {
    try {
      await matchAPI.rejectMatch('');
    } finally {
      setFindingMatch(false);
    }
  };

  const recentSessions = useMemo(() => {
    const completed = sessions.filter((s) => {
      if ((s.status ?? s.state) === 'completed') return true;
      if (s.isActive === false) return true;
      if (s.endedAt) return true;
      return false;
    });
    // Sort by endedAt/endTime/updatedAt desc
    completed.sort((a, b) =>
      new Date(b.endedAt ?? b.endTime ?? b.updatedAt ?? 0).getTime() -
      new Date(a.endedAt ?? a.endTime ?? a.updatedAt ?? 0).getTime()
    );
    return completed.slice(0, 5).map((s: any) => ({
      id: s._id ?? s.id,
      partner: s.partnerName ?? s.partner?.name ?? 'Partner',
      skill: s.skill ?? s.topic ?? s.skillFromA ?? s.skillFromB ?? 'Skill',
      type: s.role === 'learner' || s.type === 'learned' ? 'learned' : 'taught',
      date: new Date(s.endedAt ?? s.endTime ?? s.updatedAt ?? Date.now()).toLocaleString(),
      rating: s.rating ?? 5,
    }));
  }, [sessions]);

  const upcomingSessions = useMemo(() => {
    const upcoming = sessions.filter((s) => (s.status ?? s.state) === 'upcoming' || (s.status ?? s.state) === 'scheduled');
    upcoming.sort((a, b) => new Date(a.startTime ?? a.scheduledAt ?? 0).getTime() - new Date(b.startTime ?? b.scheduledAt ?? 0).getTime());
    return upcoming.slice(0, 5).map((s: any) => ({
      id: s._id ?? s.id,
      partner: s.partnerName ?? s.partner?.name ?? 'Partner',
      skill: s.skill ?? s.topic ?? s.skillFromA ?? s.skillFromB ?? 'Skill',
      type: s.role === 'learner' ? 'learning' : 'teaching',
      time: new Date(s.startTime ?? s.scheduledAt ?? Date.now()).toLocaleString(),
    }));
  }, [sessions]);

  return (
    <div className='relative min-h-screen bg-[#0b0c0d] pt-24 pb-16'>
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]' />
      </div>
      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='mb-10'
        >
          <h1 className='text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2'>
            Welcome back, {user?.name}
          </h1>
          <p className='text-white/60'>Track sessions, matching, and skill progress in one place.</p>
          {error && (
            <p className='text-red-400 mt-3 text-sm'>{error}</p>
          )}
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className='rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.06] hover:border-[#00ef68]/30 hover:ring-1 hover:ring-[#00ef68]/30 hover:shadow-[0_10px_40px_rgba(0,239,104,0.10)]'
            >
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-white/60 text-sm'>{stat.label}</p>
                  <p className='text-2xl font-bold text-white mt-1'>
                    {loading ? '—' : stat.value}
                  </p>
                </div>
                <div className='p-3 rounded-2xl bg-[#00ef68]/10 border border-[#00ef68]/20 text-[#00ef68]'>
                  <stat.icon className='w-6 h-6' />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Recent Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='rounded-3xl border border-white/10 bg-white/[0.04] p-6'
          >
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-semibold text-white tracking-tight'>Recent Sessions</h2>
              <Activity className='w-5 h-5 text-white/40' />
            </div>
            
            <div className='space-y-3'>
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className='flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00ef68]/30 hover:ring-1 hover:ring-[#00ef68]/30'
                >
                  <div className='flex items-center space-x-4'>
                    <div className='w-10 h-10 bg-[#00ef68]/10 border border-[#00ef68]/20 rounded-full flex items-center justify-center'>
                      <span className='text-sm font-semibold text-[#00ef68]'>
                        {session.partner.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className='text-white font-medium'>{session.partner}</p>
                      <p className='text-white/60 text-sm'>
                        {session.type === 'learned' ? 'Learned' : 'Taught'} {session.skill}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='flex items-center justify-end space-x-1 mb-1'>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < session.rating
                              ? 'text-[#00ef68] fill-current'
                              : 'text-white/30'
                          }`}
                        />
                      ))}
                    </div>
                    <p className='text-white/50 text-sm'>{session.date}</p>
                  </div>
                </div>
              ))}
              {!loading && recentSessions.length === 0 && (
                <div className='rounded-2xl border border-white/10 bg-black/30 p-5'>
                  <p className='text-white/70 text-sm'>No session history yet.</p>
                  <p className='mt-1 text-white/50 text-sm'>Join the matching queue to get paired, then accept a request to start a session.</p>
                  <div className='mt-4 flex flex-wrap items-center gap-3'>
                    <button
                      onClick={handleGetMatched}
                      disabled={findingMatch}
                      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00ef68]/40 ${findingMatch ? 'bg-[#00ef68]/60 text-[#0b0c0d]/80 cursor-not-allowed' : 'bg-[#00ef68] text-[#0b0c0d] hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(0,239,104,0.25)]'}`}
                    >
                      {findingMatch ? 'Joining queue…' : 'Join matching queue'}
                      <ArrowRight className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => navigate('/sessions')}
                      className='inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00ef68]/30 hover:ring-1 hover:ring-[#00ef68]/20'
                    >
                      Open sessions
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Upcoming Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className='rounded-3xl border border-white/10 bg-white/[0.04] p-6'
          >
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-semibold text-white tracking-tight'>Upcoming Sessions</h2>
              <Calendar className='w-5 h-5 text-white/40' />
            </div>
            
            <div className='space-y-3'>
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className='flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00ef68]/30 hover:ring-1 hover:ring-[#00ef68]/30'
                >
                  <div className='flex items-center space-x-4'>
                    <div className='w-10 h-10 bg-[#00ef68]/10 border border-[#00ef68]/20 rounded-full flex items-center justify-center'>
                      <span className='text-sm font-semibold text-[#00ef68]'>
                        {session.partner.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className='text-white font-medium'>{session.partner}</p>
                      <p className='text-white/60 text-sm'>
                        {session.type === 'learning' ? 'Learning' : 'Teaching'} {session.skill}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-white/70 text-sm font-medium'>{session.time}</p>
                  </div>
                </div>
              ))}
              {!loading && upcomingSessions.length === 0 && (
                <div className='rounded-2xl border border-white/10 bg-black/30 p-5'>
                  <p className='text-white/70 text-sm'>No scheduled sessions.</p>
                  <p className='mt-1 text-white/50 text-sm'>When a request is accepted, your active session will appear in Sessions.</p>
                </div>
              )}
              <button
                onClick={() => navigate('/sessions')}
                className='w-full rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 text-white/70 transition-all duration-300 hover:border-[#00ef68]/40 hover:text-[#00ef68]'
              >
                + Schedule New Session
              </button>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className='mt-10'
        >
          <h2 className='text-xl font-semibold text-white tracking-tight mb-6'>Quick Actions</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <button onClick={handleGetMatched} className='group rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.06] hover:border-[#00ef68]/30 hover:ring-1 hover:ring-[#00ef68]/30 hover:shadow-[0_10px_40px_rgba(0,239,104,0.10)]'>
              <div className='flex items-center space-x-4'>
                <div className='p-3 bg-[#00ef68]/10 border border-[#00ef68]/20 rounded-2xl group-hover:bg-[#00ef68]/15 transition-colors'>
                  <Users className='w-6 h-6 text-[#00ef68]' />
                </div>
                <div>
                  <h3 className='text-white font-semibold'>Find New Matches</h3>
                  <p className='text-white/60 text-sm'>Discover learning partners</p>
                </div>
              </div>
            </button>

            <button onClick={() => navigate('/skills')} className='group rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.06] hover:border-[#00ef68]/30 hover:ring-1 hover:ring-[#00ef68]/30 hover:shadow-[0_10px_40px_rgba(0,239,104,0.10)]'>
              <div className='flex items-center space-x-4'>
                <div className='p-3 bg-[#00ef68]/10 border border-[#00ef68]/20 rounded-2xl group-hover:bg-[#00ef68]/15 transition-colors'>
                  <BookOpen className='w-6 h-6 text-[#00ef68]' />
                </div>
                <div>
                  <h3 className='text-white font-semibold'>Browse Skills</h3>
                  <p className='text-white/60 text-sm'>Explore new technologies</p>
                </div>
              </div>
            </button>

            <button onClick={() => navigate('/profile')} className='group rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.06] hover:border-[#00ef68]/30 hover:ring-1 hover:ring-[#00ef68]/30 hover:shadow-[0_10px_40px_rgba(0,239,104,0.10)]'>
              <div className='flex items-center space-x-4'>
                <div className='p-3 bg-[#00ef68]/10 border border-[#00ef68]/20 rounded-2xl group-hover:bg-[#00ef68]/15 transition-colors'>
                  <Award className='w-6 h-6 text-[#00ef68]' />
                </div>
                <div>
                  <h3 className='text-white font-semibold'>View Profile</h3>
                  <p className='text-white/60 text-sm'>Manage skills and settings</p>
                </div>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Achievements & Skill Progress */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8'>
          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className='rounded-3xl border border-white/10 bg-white/[0.04] p-6'
          >
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-white tracking-tight'>Achievements</h3>
              <Sparkles className='w-5 h-5 text-[#00ef68]' />
            </div>
            {badges.length === 0 ? (
              <p className='text-white/60 text-sm'>Start a session to earn your first badge.</p>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {badges.map((b, i) => (
                  <div key={i} className='flex items-center gap-3 p-3 bg-black/30 rounded-2xl border border-white/10'>
                    <div className='p-2 rounded-xl bg-[#00ef68]/10 border border-[#00ef68]/20 text-[#00ef68]'>
                      <b.icon className='w-5 h-5' />
                    </div>
                    <div>
                      <p className='text-white text-sm font-medium'>{b.label}</p>
                      <p className='text-white/60 text-xs'>{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Skill Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className='rounded-3xl border border-white/10 bg-white/[0.04] p-6 lg:col-span-2'
          >
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-white tracking-tight'>Skill Progress</h3>
              <ListChecks className='w-5 h-5 text-[#00ef68]' />
            </div>
            {skillProgress.length === 0 ? (
              <p className='text-white/60 text-sm'>Add skills on your profile to track progress.</p>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {skillProgress.map((s, i) => (
                  <div key={i} className='p-4 bg-black/30 rounded-2xl border border-white/10'>
                    <div className='flex items-center justify-between mb-2'>
                      <p className='text-white font-medium text-sm'>{s.name}</p>
                      <span className='text-xs px-2 py-0.5 rounded-full border border-white/10 text-white/70'>
                        {s.kind === 'teach' ? 'Teach' : 'Learn'}
                      </span>
                    </div>
                    <div className='h-2 w-full bg-white/10 rounded'>
                      <div className='h-2 rounded bg-[#00ef68]' style={{ width: `${Math.min(100, s.level * 20)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Activity Feed & Tips */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8'>
          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className='rounded-3xl border border-white/10 bg-white/[0.04] p-6 lg:col-span-2'
          >
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-white tracking-tight'>Recent Activity</h3>
              <Activity className='w-5 h-5 text-[#00ef68]' />
            </div>
            <div className='space-y-3'>
              {activity.slice(0, 8).map((a: any, i: number) => (
                <div key={i} className='flex items-center justify-between p-3 bg-black/30 rounded-2xl border border-white/10'>
                  <div className='flex items-center gap-3'>
                    <div className='w-8 h-8 rounded-full bg-[#00ef68]/10 border border-[#00ef68]/20 text-[#00ef68] flex items-center justify-center text-xs font-bold'>
                      {(a.user?.name ?? user?.name ?? 'U').toString().charAt(0)}
                    </div>
                    <div>
                      <p className='text-white text-sm'>
                        {a.action ?? a.type ?? 'Activity'}
                        {a.skill ? ` • ${a.skill}` : ''}
                      </p>
                      <p className='text-white/60 text-xs'>
                        {new Date(a.createdAt ?? a.time ?? Date.now()).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {a.meta?.points ? (
                    <span className='text-[#00ef68] text-xs font-semibold'>+{a.meta.points} pts</span>
                  ) : null}
                </div>
              ))}
              {!loading && activity.length === 0 && (
                <p className='text-white/60 text-sm'>No activity yet. Start by finding a match.</p>
              )}
            </div>
          </motion.div>

          {/* Tips / Getting Started */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className='rounded-3xl border border-white/10 bg-white/[0.04] p-6'
          >
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-white tracking-tight'>Tips</h3>
              <Target className='w-5 h-5 text-[#00ef68]' />
            </div>
            <ul className='space-y-3 text-white/70 text-sm'>
              <li className='flex items-start gap-2'><span className='mt-1 block w-1.5 h-1.5 rounded-full bg-[#00ef68]' /> Add both teach and learn skills to improve matches.</li>
              <li className='flex items-start gap-2'><span className='mt-1 block w-1.5 h-1.5 rounded-full bg-[#00ef68]' /> Set your availability in Settings for better scheduling.</li>
              <li className='flex items-start gap-2'><span className='mt-1 block w-1.5 h-1.5 rounded-full bg-[#00ef68]' /> Use the session notes to track progress and goals.</li>
            </ul>
            <div className='mt-4 flex items-center gap-3'>
              <button
                onClick={handleGetMatched}
                disabled={findingMatch}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00ef68]/40 ${findingMatch ? 'bg-[#00ef68]/60 text-[#0b0c0d]/80 cursor-not-allowed' : 'bg-[#00ef68] text-[#0b0c0d] hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(0,239,104,0.25)]'}`}
              >
                {findingMatch ? 'Finding match…' : 'Get Matched'}
                <ArrowRight className='w-4 h-4' />
              </button>
              {findingMatch && (
                <button
                  onClick={handleCancelMatching}
                  className='px-3 py-2 rounded-2xl border border-white/10 bg-white/[0.04] text-white/70 hover:border-[#00ef68]/30 hover:ring-1 hover:ring-[#00ef68]/20'
                >
                  Cancel
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
