import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
      window.location.href = '/login';
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
  getUsers: (params?: any) => api.get('/users', { params }),
  getUserById: (id: string) => api.get(`/users/${id}`),
  updateProfile: (data: any) => api.put('/users/profile', data),
  searchUsers: (query: string) => api.get(`/users/search?q=${query}`),
};

// Sessions API
export const sessionsAPI = {
  createSession: (data: {
    partnerId: string;
    skillFromMe: string;
    skillFromPartner: string;
  }) => api.post('/sessions', data),
  
  getSessions: () => api.get('/sessions'),
  getSessionById: (id: string) => api.get(`/sessions/${id}`),
  joinSession: (id: string) => api.post(`/sessions/${id}/join`),
  endSession: (id: string) => api.post(`/sessions/${id}/end`),
};

// Matching API
export const matchAPI = {
  findMatch: () => api.post('/match/find'),
  getMatches: () => api.get('/match'),
  acceptMatch: (matchId: string) => api.post(`/match/${matchId}/accept`),
  rejectMatch: (matchId: string) => api.post(`/match/${matchId}/reject`),
};

// AI API
export const aiAPI = {
  generateLessonPlan: (data: {
    skill: string;
    level: string;
    duration?: number;
  }) => api.post('/ai/lesson-plan', data),
  
  getSessionSummary: (sessionId: string) => 
    api.get(`/ai/session-summary/${sessionId}`),
};

export default api;

// Helper to start OAuth flow
export const startOAuth = (provider: 'google' | 'github') => {
  // Redirect to backend OAuth start endpoint
  window.location.href = `${API_BASE_URL}/auth/${provider}`;
};
