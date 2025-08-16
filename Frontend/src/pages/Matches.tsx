import React, { useState } from 'react';
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
  
} from 'lucide-react';

const Matches: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matches' | 'requests' | 'sent'>('matches');

  const matches = [
    {
      id: 1,
      name: 'Sarah Chen',
      avatar: 'SC',
      location: 'San Francisco, CA',
      rating: 4.9,
      sessionsCompleted: 45,
      teachSkills: ['React', 'TypeScript', 'Node.js'],
      learnSkills: ['Python', 'Machine Learning', 'AWS'],
      bio: 'Senior Frontend Developer at Google. Passionate about modern web technologies and helping others learn.',
      matchScore: 95,
      isOnline: true,
      lastSeen: 'now',
    },
    {
      id: 2,
      name: 'Marcus Johnson',
      avatar: 'MJ',
      location: 'New York, NY',
      rating: 4.8,
      sessionsCompleted: 32,
      teachSkills: ['Python', 'Django', 'PostgreSQL'],
      learnSkills: ['React', 'GraphQL', 'Docker'],
      bio: 'Full-stack developer with 8 years of experience. Love teaching backend development.',
      matchScore: 88,
      isOnline: false,
      lastSeen: '2 hours ago',
    },
    {
      id: 3,
      name: 'Elena Rodriguez',
      avatar: 'ER',
      location: 'Madrid, Spain',
      rating: 4.9,
      sessionsCompleted: 67,
      teachSkills: ['Vue.js', 'JavaScript', 'CSS'],
      learnSkills: ['React Native', 'Flutter', 'Swift'],
      bio: 'Frontend specialist and UI/UX enthusiast. Always excited to share knowledge about modern web development.',
      matchScore: 92,
      isOnline: true,
      lastSeen: 'now',
    },
  ];

  const requests = [
    {
      id: 1,
      name: 'Alex Kim',
      avatar: 'AK',
      skill: 'Docker Containers',
      message: 'Hi! I saw you teach Docker and I\'d love to learn from you. I can teach you React in exchange.',
      time: '2 hours ago',
      type: 'received',
    },
    {
      id: 2,
      name: 'Lisa Wang',
      avatar: 'LW',
      skill: 'GraphQL',
      message: 'Would love to exchange GraphQL knowledge for Python skills!',
      time: '5 hours ago',
      type: 'received',
    },
  ];

  const sentRequests = [
    {
      id: 1,
      name: 'David Park',
      avatar: 'DP',
      skill: 'Kubernetes',
      message: 'Hi David! I\'d like to learn Kubernetes from you. I can teach React/TypeScript in return.',
      time: '1 day ago',
      status: 'pending',
    },
  ];

  const handleConnect = (matchId: number) => {
    console.log('Connecting with match:', matchId);
  };

  const handleAcceptRequest = (requestId: number) => {
    console.log('Accepting request:', requestId);
  };

  const handleDeclineRequest = (requestId: number) => {
    console.log('Declining request:', requestId);
  };

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
            Find Learning Partners
          </h1>
          <p className="text-gray-400">
            Connect with developers who have complementary skills
          </p>
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
              { key: 'matches', label: 'Matches', count: matches.length },
              { key: 'requests', label: 'Requests', count: requests.length },
              { key: 'sent', label: 'Sent', count: sentRequests.length },
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
          {activeTab === 'matches' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {matches.map((match, index) => (
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
                        {match.teachSkills.map((skill) => (
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
                        {match.learnSkills.map((skill) => (
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
                      onClick={() => handleConnect(match.id)}
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
        {((activeTab === 'matches' && matches.length === 0) ||
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
