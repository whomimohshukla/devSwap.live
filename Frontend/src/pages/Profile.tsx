import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  Mail, 
  MapPin, 
  Calendar,
  Edit3,
  Save,
  X,
  Plus,
  Star,
  Award,
  TrendingUp,
  
  BookOpen,
  Code2,
  Camera
 } from 'lucide-react';
import { useAuthStore, SKILLS } from '../lib/auth';
import { usersAPI } from '../lib/api';

interface ProfileForm {
  name: string;
  bio: string;
  location: string;
}

const Profile: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTeachSkills, setSelectedTeachSkills] = useState<string[]>(user?.teachSkills || []);
  const [selectedLearnSkills, setSelectedLearnSkills] = useState<string[]>(user?.learnSkills || []);
  const [skillSearchTerm, setSkillSearchTerm] = useState('');
  const [activeSkillType, setActiveSkillType] = useState<'teach' | 'learn' | null>(null);
  const [statsData, setStatsData] = useState<any | null>(null);
  const [activity, setActivity] = useState<Array<{ type: 'session' | 'skill' | 'rating'; description: string; time: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      location: '', // Add location to user model if needed
    },
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, activityRes] = await Promise.all([
          usersAPI.getStatsOverview(),
          usersAPI.getActivity(),
        ]);
        if (!mounted) return;
        setStatsData(statsRes.data?.data ?? statsRes.data ?? null);
        const raw = activityRes.data?.data ?? activityRes.data ?? [];
        const list = Array.isArray(raw) ? raw : (raw.activity ?? []);
        // Normalize activity items to the UI shape
        const normalized = list.map((a: any) => ({
          type: (a.type === 'session' || a.kind === 'session') ? 'session' : (a.type === 'skill' ? 'skill' : 'rating'),
          description: a.description ?? a.message ?? 'Activity',
          time: a.time ?? a.createdAt ? new Date(a.time ?? a.createdAt).toLocaleString() : '',
        }));
        setActivity(normalized.slice(0, 20));
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? 'Failed to load profile data');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const stats = [
    { label: 'Sessions Completed', value: String(statsData?.sessionsCompleted ?? statsData?.sessions_completed ?? 0), icon: BookOpen, color: 'text-emerald-400' },
    { label: 'Skills Taught', value: String(statsData?.skillsTaught ?? statsData?.skills_taught ?? (user?.teachSkills?.length || 0)), icon: Code2, color: 'text-blue-400' },
    { label: 'Skills Learned', value: String(statsData?.skillsLearned ?? statsData?.skills_learned ?? (user?.learnSkills?.length || 0)), icon: TrendingUp, color: 'text-purple-400' },
    { label: 'Rating', value: String(statsData?.rating ?? statsData?.avgRating ?? '—'), icon: Star, color: 'text-yellow-400' },
  ];

  const achievements = [
    { name: 'First Session', description: 'Completed your first learning session', earned: true },
    { name: 'Mentor', description: 'Taught 10+ sessions', earned: true },
    { name: 'Learner', description: 'Learned 5+ new skills', earned: true },
    { name: 'Community Helper', description: 'Helped 50+ developers', earned: false },
  ];

  const recentActivity = activity;

  const filteredSkills = SKILLS.filter(skill =>
    skill.toLowerCase().includes(skillSearchTerm.toLowerCase())
  );

  const addSkill = async (skill: string, type: 'teach' | 'learn') => {
    try {
      if (type === 'teach' && selectedTeachSkills.includes(skill)) return;
      if (type === 'learn' && selectedLearnSkills.includes(skill)) return;
      await usersAPI.addSkill({ skillName: skill, skillType: type });
      // Update local state and auth store
      if (type === 'teach') {
        const updatedTeach = [...selectedTeachSkills, skill];
        setSelectedTeachSkills(updatedTeach);
        updateUser({ ...(user as any), teachSkills: updatedTeach });
      } else {
        const updatedLearn = [...selectedLearnSkills, skill];
        setSelectedLearnSkills(updatedLearn);
        updateUser({ ...(user as any), learnSkills: updatedLearn });
      }
    } catch (e) {
      console.error('Failed to add skill', e);
    } finally {
      setSkillSearchTerm('');
      setActiveSkillType(null);
    }
  };

  const removeSkill = async (skill: string, type: 'teach' | 'learn') => {
    try {
      await usersAPI.removeSkill({ skillName: skill, skillType: type });
      if (type === 'teach') {
        const updatedTeach = selectedTeachSkills.filter(s => s !== skill);
        setSelectedTeachSkills(updatedTeach);
        updateUser({ ...(user as any), teachSkills: updatedTeach });
      } else {
        const updatedLearn = selectedLearnSkills.filter(s => s !== skill);
        setSelectedLearnSkills(updatedLearn);
        updateUser({ ...(user as any), learnSkills: updatedLearn });
      }
    } catch (e) {
      console.error('Failed to remove skill', e);
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    try {
      const payload: any = {
        name: data.name,
        bio: data.bio,
        teachSkills: selectedTeachSkills,
        learnSkills: selectedLearnSkills,
      };
      const res = await usersAPI.updateProfile(payload);
      const updated = res.data?.data ?? res.data?.user ?? payload;
      updateUser({ ...(user as any), ...updated });
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
    setSelectedTeachSkills(user?.teachSkills || []);
    setSelectedLearnSkills(user?.learnSkills || []);
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
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Profile</h1>
            <div className="flex items-center gap-3">
              {loading && (
                <span className="text-gray-400 text-sm">Loading…</span>
              )}
              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/settings"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm border border-gray-700"
              >
                Settings
              </Link>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSubmit(onSubmit)}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800"
            >
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      {...register('name', { required: 'Name is required' })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                    {errors.name && (
                      <p className="text-red-400 text-sm">{errors.name.message}</p>
                    )}
                  </div>
                ) : (
                  <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <MapPin className="w-4 h-4" />
                  {isEditing ? (
                    <input
                      {...register('location')}
                      className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                      placeholder="Your location"
                    />
                  ) : (
                    <span className="text-sm">San Francisco, CA</span>
                  )}
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Joined December 2024</span>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
              <div className="space-y-4">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-gray-800 ${stat.color}`}>
                        <stat.icon className="w-4 h-4" />
                      </div>
                      <span className="text-gray-300 text-sm">{stat.label}</span>
                    </div>
                    <span className="text-white font-semibold">{stat.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      achievement.earned ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-gray-800'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      achievement.earned ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-500'
                    }`}>
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${
                        achievement.earned ? 'text-white' : 'text-gray-400'
                      }`}>
                        {achievement.name}
                      </p>
                      <p className="text-xs text-gray-500">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800"
            >
              <h3 className="text-lg font-semibold text-white mb-4">About</h3>
              {isEditing ? (
                <textarea
                  {...register('bio')}
                  rows={4}
                  className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                />
              ) : (
                <p className="text-gray-300 leading-relaxed">
                  {user?.bio || 'No bio available. Click edit to add your bio.'}
                </p>
              )}
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800"
            >
              <h3 className="text-lg font-semibold text-white mb-6">Skills</h3>
              
              <div className="space-y-6">
                {/* Skills I Can Teach */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-300">I Can Teach</h4>
                    {isEditing && (
                      <button
                        onClick={() => setActiveSkillType('teach')}
                        className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center space-x-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Skill</span>
                      </button>
                    )}
                  </div>
                  
                  {isEditing && activeSkillType === 'teach' && (
                    <div className="relative mb-3">
                      <input
                        type="text"
                        value={skillSearchTerm}
                        onChange={(e) => setSkillSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Search skills..."
                      />
                      
                      {skillSearchTerm && (
                        <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredSkills.map((skill) => (
                            <button
                              key={skill}
                              onClick={() => addSkill(skill, 'teach')}
                              className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors"
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {selectedTeachSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm border border-emerald-500/30"
                      >
                        {skill}
                        {isEditing && (
                          <button
                            onClick={() => removeSkill(skill, 'teach')}
                            className="ml-2 hover:text-emerald-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills I Want to Learn */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-300">I Want to Learn</h4>
                    {isEditing && (
                      <button
                        onClick={() => setActiveSkillType('learn')}
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Skill</span>
                      </button>
                    )}
                  </div>
                  
                  {isEditing && activeSkillType === 'learn' && (
                    <div className="relative mb-3">
                      <input
                        type="text"
                        value={skillSearchTerm}
                        onChange={(e) => setSkillSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Search skills..."
                      />
                      
                      {skillSearchTerm && (
                        <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredSkills.map((skill) => (
                            <button
                              key={skill}
                              onClick={() => addSkill(skill, 'learn')}
                              className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors"
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {selectedLearnSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm border border-blue-500/30"
                      >
                        {skill}
                        {isEditing && (
                          <button
                            onClick={() => removeSkill(skill, 'learn')}
                            className="ml-2 hover:text-blue-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg mt-1 ${
                      activity.type === 'session' ? 'bg-emerald-500/20 text-emerald-400' :
                      activity.type === 'skill' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {activity.type === 'session' && <BookOpen className="w-4 h-4" />}
                      {activity.type === 'skill' && <Code2 className="w-4 h-4" />}
                      {activity.type === 'rating' && <Star className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-300 text-sm">{activity.description}</p>
                      <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
