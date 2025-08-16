import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Code2, TrendingUp, Users } from 'lucide-react';
import { SKILLS } from '../lib/auth';

const Skills: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Frontend',
    'Backend', 
    'Mobile',
    'DevOps',
    'Data Science',
    'Design',
    'Languages'
  ];

  const skillCategories = {
    Frontend: ['JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular'],
    Backend: ['Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot'],
    Mobile: ['iOS Development', 'Android Development', 'Flutter', 'React Native'],
    DevOps: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'DevOps'],
    'Data Science': ['Python', 'Machine Learning', 'Data Science'],
    Design: ['UI/UX Design'],
    Languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++'],
  };

  const getSkillsForCategory = (category: string) => {
    if (category === 'All') return SKILLS;
    return skillCategories[category as keyof typeof skillCategories] || [];
  };

  const filteredSkills = getSkillsForCategory(selectedCategory).filter(skill =>
    skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const popularSkills = [
    { name: 'React', learners: 1250, teachers: 890, trend: '+15%' },
    { name: 'Python', learners: 2100, teachers: 1450, trend: '+22%' },
    { name: 'TypeScript', learners: 980, teachers: 670, trend: '+18%' },
    { name: 'Node.js', learners: 1100, teachers: 780, trend: '+12%' },
    { name: 'AWS', learners: 1850, teachers: 920, trend: '+28%' },
    { name: 'Docker', learners: 1350, teachers: 650, trend: '+25%' },
  ];

  return (
    <div>
      <div>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Explore Skills
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover the technologies and frameworks you can learn or teach on DevSwap.live
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            
            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none cursor-pointer"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Popular Skills Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Trending Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularSkills.map((skill) => (
              <div
                key={skill.name}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-emerald-500/50 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                      <Code2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{skill.name}</h3>
                  </div>
                  <div className="flex items-center space-x-1 text-emerald-400 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>{skill.trend}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Learners</p>
                    <p className="text-white font-medium">{skill.learners.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Teachers</p>
                    <p className="text-white font-medium">{skill.teachers.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* All Skills Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {selectedCategory === 'All' ? 'All Skills' : `${selectedCategory} Skills`}
            </h2>
            <span className="text-gray-400">
              {filteredSkills.length} skills found
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredSkills.map((skill, index) => (
              <motion.div
                key={skill}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-emerald-500/50 hover:bg-gray-800 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-800 group-hover:bg-emerald-500/10 rounded-lg flex items-center justify-center transition-colors">
                    <Code2 className="w-5 h-5 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                      {skill}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Users className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">
                        {Math.floor(Math.random() * 500) + 100}+ learners
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {filteredSkills.length === 0 && (
            <div className="text-center py-12">
              <Code2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-400 mb-2">No skills found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center bg-gradient-to-r from-emerald-600/10 to-emerald-700/10 rounded-2xl p-8 border border-emerald-500/20"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Join our community of developers and start exchanging skills today. 
            Teach what you know, learn what you need.
          </p>
          <button className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors">
            Get Started
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Skills;
