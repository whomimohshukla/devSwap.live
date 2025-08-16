import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  teachSkills: string[];
  learnSkills: string[];
  skillLevels?: Array<{
    skillName: string;
    level: string;
  }>;
  isOnline?: boolean;
  lastSeen?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    teachSkills: string[];
    learnSkills: string[];
    bio?: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const normalizedEmail = email.trim().toLowerCase();
          const response = await authAPI.login({ email: normalizedEmail, password });
          const token = response.data?.token ?? response.data?.data?.token ?? null;

          if (token) {
            localStorage.setItem('authToken', token);
          }

          // Always fetch fresh profile (works for cookie-only or token flows)
          const profileRes = await authAPI.getProfile();
          const user = profileRes.data?.user ?? profileRes.data?.data ?? profileRes.data?.data?.user;

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const payload = {
            ...data,
            email: data.email.trim().toLowerCase(),
          };

          const response = await authAPI.register(payload);
          let token = response.data?.token ?? response.data?.data?.token ?? null;

          // If backend didn't return a token, perform a login with provided creds to obtain token/cookie
          if (!token) {
            const loginRes = await authAPI.login({ email: payload.email, password: payload.password });
            token = loginRes.data?.token ?? loginRes.data?.data?.token ?? null;
            if (token) {
              localStorage.setItem('authToken', token);
            }
          } else {
            localStorage.setItem('authToken', token);
          }

          // Fetch profile after registration/login to get safeProfile
          const profileRes = await authAPI.getProfile();
          const user = profileRes.data?.user ?? profileRes.data?.data ?? profileRes.data?.data?.user;

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (user: User) => {
        set({ user });
      },

      checkAuth: async () => {
        const storedToken = localStorage.getItem('authToken');
        try {
          const response = await authAPI.getProfile();
          const user = response.data?.user ?? response.data?.data ?? response.data?.data?.user;
          set({
            user,
            token: storedToken ?? null,
            isAuthenticated: true,
          });
        } catch (error) {
          // On failure, clear token and auth state
          localStorage.removeItem('authToken');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Skills data matching server
export const SKILLS = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'React',
  'Vue.js',
  'Angular',
  'Node.js',
  'Express.js',
  'Django',
  'Flask',
  'Spring Boot',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'Git',
  'DevOps',
  'Machine Learning',
  'Data Science',
  'UI/UX Design',
  'Mobile Development',
  'iOS Development',
  'Android Development',
  'Flutter',
  'React Native',
  'GraphQL',
  'REST APIs',
  'Microservices',
  'System Design',
  'Algorithms',
  'Data Structures',
  'Cybersecurity',
  'Blockchain',
  'Web3',
];

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
