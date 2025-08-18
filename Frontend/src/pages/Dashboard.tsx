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
  Activity
 } from 'lucide-react';
import { usersAPI, sessionsAPI } from '../lib/api';
import { useAuthStore } from '../lib/auth';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<any | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, sessionsRes] = await Promise.all([
          usersAPI.getStatsOverview(),
          sessionsAPI.getSessions(),
        ]);
        if (!mounted) return;
        setStatsData(statsRes.data?.data ?? statsRes.data ?? null);
        const list = sessionsRes.data?.data ?? sessionsRes.data ?? [];
        setSessions(Array.isArray(list) ? list : (list.sessions ?? []));
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

  const stats = useMemo(() => {
    const completed = statsData?.sessionsCompleted ?? statsData?.sessions_completed ?? 0;
    const taught = statsData?.skillsTaught ?? statsData?.skills_taught ?? (user?.teachSkills?.length || 0);
    const learned = statsData?.skillsLearned ?? statsData?.skills_learned ?? (user?.learnSkills?.length || 0);
    const hours = statsData?.hoursExchanged ?? statsData?.hours_exchanged ?? 0;
    return [
      { label: 'Sessions Completed', value: String(completed), icon: BookOpen, color: 'text-emerald-400' },
      { label: 'Skills Taught', value: String(taught), icon: Code2, color: 'text-blue-400' },
      { label: 'Skills Learned', value: String(learned), icon: TrendingUp, color: 'text-purple-400' },
      { label: 'Hours Exchanged', value: String(hours), icon: Clock, color: 'text-orange-400' },
    ];
  }, [statsData, user]);

  const recentSessions = useMemo(() => {
    const completed = sessions.filter(s => (s.status ?? s.state) === 'completed');
    // Sort by endTime/updatedAt desc
    completed.sort((a, b) => new Date(b.endTime ?? b.updatedAt ?? 0).getTime() - new Date(a.endTime ?? a.updatedAt ?? 0).getTime());
    return completed.slice(0, 5).map((s: any) => ({
      id: s._id ?? s.id,
      partner: s.partnerName ?? s.partner?.name ?? 'Partner',
      skill: s.skill ?? s.topic ?? 'Skill',
      type: s.role === 'learner' || s.type === 'learned' ? 'learned' : 'taught',
      date: new Date(s.endTime ?? s.updatedAt ?? Date.now()).toLocaleString(),
      rating: s.rating ?? 5,
    }));
  }, [sessions]);

  const upcomingSessions = useMemo(() => {
    const upcoming = sessions.filter(s => (s.status ?? s.state) === 'upcoming' || (s.status ?? s.state) === 'scheduled');
    upcoming.sort((a, b) => new Date(a.startTime ?? a.scheduledAt ?? 0).getTime() - new Date(b.startTime ?? b.scheduledAt ?? 0).getTime());
    return upcoming.slice(0, 5).map((s: any) => ({
      id: s._id ?? s.id,
      partner: s.partnerName ?? s.partner?.name ?? 'Partner',
      skill: s.skill ?? s.topic ?? 'Skill',
      type: s.role === 'learner' ? 'learning' : 'teaching',
      time: new Date(s.startTime ?? s.scheduledAt ?? Date.now()).toLocaleString(),
    }));
  }, [sessions]);

  return (
    <div className="min-h-screen bg-black pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-400">
            Here's what's happening with your skill exchange journey
          </p>
          {error && (
            <p className="text-red-400 mt-2 text-sm">{error}</p>
          )}
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{loading ? '—' : stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-800 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Sessions</h2>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {session.partner.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{session.partner}</p>
                      <p className="text-gray-400 text-sm">
                        {session.type === 'learned' ? 'Learned' : 'Taught'} {session.skill}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < session.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-400 text-sm">{session.date}</p>
                  </div>
                </div>
              ))}
              {!loading && recentSessions.length === 0 && (
                <p className="text-gray-500 text-sm">No recent sessions.</p>
              )}
            </div>
          </motion.div>

          {/* Upcoming Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Upcoming Sessions</h2>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {session.partner.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{session.partner}</p>
                      <p className="text-gray-400 text-sm">
                        {session.type === 'learning' ? 'Learning' : 'Teaching'} {session.skill}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 text-sm font-medium">{session.time}</p>
                  </div>
                </div>
              ))}
              {!loading && upcomingSessions.length === 0 && (
                <p className="text-gray-500 text-sm">No upcoming sessions.</p>
              )}
              <button className="w-full p-4 border-2 border-dashed border-gray-700 rounded-lg text-gray-400 hover:border-emerald-500 hover:text-emerald-400 transition-colors">
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
          className="mt-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button className="group p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-emerald-500 transition-all duration-300 text-left">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Find New Matches</h3>
                  <p className="text-gray-400 text-sm">Discover learning partners</p>
                </div>
              </div>
            </button>

            <button className="group p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-blue-500 transition-all duration-300 text-left">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Browse Skills</h3>
                  <p className="text-gray-400 text-sm">Explore new technologies</p>
                </div>
              </div>
            </button>

            <button className="group p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-purple-500 transition-all duration-300 text-left">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                  <Award className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">View Achievements</h3>
                  <p className="text-gray-400 text-sm">Track your progress</p>
                </div>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
