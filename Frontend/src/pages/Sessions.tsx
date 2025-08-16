import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  Calendar, 
  Clock, 
  Play,
  Square,
  MessageCircle,
  Share2,
  Settings,
  Star,
  BookOpen,
  CheckCircle
} from 'lucide-react';

const Sessions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'completed'>('active');

  const activeSessions = [
    {
      id: 1,
      partner: 'Sarah Chen',
      avatar: 'SC',
      skill: 'React Hooks',
      type: 'learning',
      startTime: '2:30 PM',
      duration: '45 min',
      status: 'live',
    },
  ];

  const upcomingSessions = [
    {
      id: 1,
      partner: 'Marcus Johnson',
      avatar: 'MJ',
      skill: 'Python FastAPI',
      type: 'teaching',
      date: 'Today',
      time: '4:00 PM',
      duration: '60 min',
    },
    {
      id: 2,
      partner: 'Elena Rodriguez',
      avatar: 'ER',
      skill: 'Vue.js Components',
      type: 'learning',
      date: 'Tomorrow',
      time: '10:00 AM',
      duration: '90 min',
    },
    {
      id: 3,
      partner: 'Alex Kim',
      avatar: 'AK',
      skill: 'Docker Containers',
      type: 'learning',
      date: 'Dec 20',
      time: '3:00 PM',
      duration: '60 min',
    },
  ];

  const completedSessions = [
    {
      id: 1,
      partner: 'David Park',
      avatar: 'DP',
      skill: 'TypeScript Generics',
      type: 'taught',
      date: 'Dec 15',
      duration: '75 min',
      rating: 5,
      feedback: 'Excellent session! David explained complex concepts very clearly.',
    },
    {
      id: 2,
      partner: 'Lisa Wang',
      avatar: 'LW',
      skill: 'GraphQL Queries',
      type: 'learned',
      date: 'Dec 14',
      duration: '60 min',
      rating: 5,
      feedback: 'Great learning experience. Lisa was very patient and knowledgeable.',
    },
    {
      id: 3,
      partner: 'James Wilson',
      avatar: 'JW',
      skill: 'AWS Lambda',
      type: 'learned',
      date: 'Dec 12',
      duration: '90 min',
      rating: 4,
      feedback: 'Good session, learned a lot about serverless architecture.',
    },
  ];

  const handleJoinSession = (sessionId: number) => {
    console.log('Joining session:', sessionId);
  };

  const handleScheduleSession = () => {
    console.log('Opening schedule modal');
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <button
            onClick={handleScheduleSession}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
          >
            <Calendar className="w-5 h-5" />
            <span>Schedule Session</span>
          </button>
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
              { key: 'active', label: 'Active', count: activeSessions.length },
              { key: 'upcoming', label: 'Upcoming', count: upcomingSessions.length },
              { key: 'completed', label: 'Completed', count: completedSessions.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:text-white'
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
          {activeTab === 'active' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {activeSessions.length > 0 ? (
                <div className="space-y-4">
                  {activeSessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="bg-gray-900 rounded-xl p-6 border border-emerald-500/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {session.avatar}
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-white">{session.partner}</h3>
                            <p className="text-gray-400">
                              {session.type === 'learning' ? 'Learning' : 'Teaching'} {session.skill}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center space-x-1 text-emerald-400">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium">LIVE</span>
                              </div>
                              <span className="text-gray-400 text-sm">
                                Started at {session.startTime} • {session.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                            <Video className="w-5 h-5" />
                          </button>
                          <button className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <MessageCircle className="w-5 h-5" />
                          </button>
                          <button className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Share2 className="w-5 h-5" />
                          </button>
                          <button className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                            <Square className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-400 mb-2">No active sessions</h3>
                  <p className="text-gray-500">Your live sessions will appear here</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'upcoming' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {upcomingSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {session.avatar}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{session.partner}</h3>
                        <p className="text-gray-400 text-sm">
                          {session.type === 'learning' ? 'Learning' : 'Teaching'} {session.skill}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      session.type === 'learning' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {session.type === 'learning' ? 'Learning' : 'Teaching'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Calendar className="w-4 h-4" />
                      <span>{session.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span>{session.time} • {session.duration}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleJoinSession(session.id)}
                      className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Join Session</span>
                    </button>
                    <button className="px-4 py-2 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-lg transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'completed' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {completedSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gray-900 rounded-xl p-6 border border-gray-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {session.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{session.partner}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session.type === 'learned' 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {session.type === 'learned' ? 'Learned' : 'Taught'}
                          </span>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-gray-400 mb-2">{session.skill}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                          <span>{session.date}</span>
                          <span>•</span>
                          <span>{session.duration}</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < session.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                          <span className="text-gray-400 text-sm ml-2">({session.rating}/5)</span>
                        </div>
                        <p className="text-gray-300 text-sm italic">"{session.feedback}"</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Empty States */}
        {((activeTab === 'upcoming' && upcomingSessions.length === 0) ||
          (activeTab === 'completed' && completedSessions.length === 0)) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-12"
          >
            {activeTab === 'upcoming' && (
              <>
                <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">No upcoming sessions</h3>
                <p className="text-gray-500 mb-6">Schedule your first learning session</p>
                <button
                  onClick={handleScheduleSession}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Schedule Session
                </button>
              </>
            )}
            {activeTab === 'completed' && (
              <>
                <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">No completed sessions</h3>
                <p className="text-gray-500">Your session history will appear here</p>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Sessions;
