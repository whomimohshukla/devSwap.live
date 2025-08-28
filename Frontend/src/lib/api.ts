import axios from 'axios';

// Normalize base URL: if VITE_API_URL is provided without the "/api" prefix, append it.
const RAW_BASE_URL = import.meta.env.VITE_API_URL as string | undefined;
function ensureApiPrefix(url: string) {
  // If it already ends with /api or /api/, use as-is
  if (/\/api\/?$/.test(url)) return url.replace(/\/$/, '');
  // Otherwise, append /api
  return url.replace(/\/$/, '') + '/api';
}

export const API_BASE_URL = RAW_BASE_URL
  ? ensureApiPrefix(RAW_BASE_URL)
  : 'http://localhost:5000/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Redirect to login only when on protected routes; stay on public pages
      const path = window.location.pathname;
      const isAuthFlow = path.startsWith('/login') || path.startsWith('/register');
      const protectedPrefixes = ['/dashboard', '/matches', '/sessions', '/profile', '/settings'];
      const isProtected = protectedPrefixes.some((p) => path.startsWith(p));
      if (!isAuthFlow && isProtected) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    teachSkills: string[];
    learnSkills: string[];
    bio?: string;
  }) => api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) => 
    api.post('/auth/login', data),
  
  logout: () => api.post('/auth/logout'),
  
  getProfile: () => api.get('/auth/profile'),
  
  refreshToken: () => api.post('/auth/refresh'),
};

// Users API
export const usersAPI = {
  // If a search query is provided, hit /users/search; otherwise list online users
  getUsers: (params?: { q?: string } & Record<string, any>) => {
    if (params?.q && params.q.trim().length > 0) {
      return api.get(`/users/search`, { params: { q: params.q } });
    }
    return api.get('/users/online');
  },
  // Current authenticated user profile
  getMe: () => api.get('/users/me'),
  getUserById: (id: string) => api.get(`/users/${id}`),
  updateProfile: (data: any) => api.put('/users/me', data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/users/me/password', data),
  deleteAccount: () => api.delete('/users/me'),
  searchUsers: (query: string) => api.get(`/users/search?q=${query}`),
  getMatches: () => api.get('/users/matches'),
  getOnline: () => api.get('/users/online'),
  addSkill: (data: { skillName: string; skillType: 'teach' | 'learn'; level?: string }) =>
    api.post('/users/skills', data),
  removeSkill: (data: { skillName: string; skillType: 'teach' | 'learn' }) =>
    api.delete('/users/skills', { data }),
  updateSkillLevel: (data: { skillName: string; level: string }) =>
    api.put('/users/skills/level', data),
  updateOnlineStatus: (isOnline: boolean) =>
    api.put('/users/status/online', { isOnline }),
  updateLastSeen: () => api.put('/users/status/last-seen'),
  getStatsOverview: () => api.get('/users/stats/overview'),
  getActivity: () => api.get('/users/activity'),
};

// Sessions API
export const sessionsAPI = {
  // Backend does not expose POST /sessions. Use matching flow to create sessions.
  createSession: (_data: {
    partnerId: string;
    skillFromMe: string;
    skillFromPartner: string;
  }) => Promise.reject(new Error('Session creation is not supported by the backend. Use matching flow instead.')),
  
  getSessions: (params?: { status?: 'all' | 'active' | 'ended'; page?: number; limit?: number }) =>
    api.get('/sessions', { params }),
  getSessionById: (id: string) => api.get(`/sessions/${id}`),
  joinSession: (id: string) => api.post(`/sessions/${id}/join`),
  endSession: (id: string) => api.post(`/sessions/${id}/end`),
};

// Matching API
export const matchAPI = {
  // Join the matching queue
  findMatch: () => api.post('/match/join'),
  // Matches list is available via users API on the backend
  getMatches: () => api.get('/users/matches'),
  // Not supported by backend currently
  acceptMatch: (_matchId: string) => Promise.reject(new Error('Accepting a match is not supported by the backend yet.')),
  // Leaving matching queue maps to /match/leave
  rejectMatch: (_matchId: string) => api.post(`/match/leave`),
};

// AI API
export const aiAPI = {
  // Backend expects sessionId as a path param
  generateLessonPlan: (data: {
    sessionId: string;
    skill: string;
    level: string;
    duration?: number;
  }) => {
    const { sessionId, skill, level, duration } = data;
    return api.post(`/ai/lesson-plan/${sessionId}`, { skill, level, duration });
  },
  
  // Backend uses POST /ai/summary/:sessionId
  getSessionSummary: (sessionId: string) => 
    api.post(`/ai/summary/${sessionId}`),

  // Cached lesson plans
  getCachedPlans: () => api.get('/ai/cached-plans'),
};

// Requests API
export const requestsAPI = {
  getIncoming: (status: 'pending' | 'accepted' | 'declined' | 'all' = 'pending') =>
    api.get('/requests/incoming', { params: { status } }),
  getSent: (status: 'pending' | 'accepted' | 'declined' | 'all' = 'pending') =>
    api.get('/requests/sent', { params: { status } }),
  create: (data: { toUserId: string; message?: string }) => api.post('/requests', data),
  accept: (id: string) => api.post(`/requests/${id}/accept`),
  decline: (id: string) => api.post(`/requests/${id}/decline`),
};

export default api;

// Helper to start OAuth flow
export const startOAuth = (provider: 'google' | 'github') => {
  // Redirect to backend OAuth start endpoint
  window.location.href = `${API_BASE_URL}/auth/${provider}`;
};

// Health API helpers
export const healthAPI = {
  apiHealth: () => api.get('/health'), // backend mounts /api/health without auth
};
