import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from './api';
import { usersAPI } from './api';
import { getSocket } from './socket';

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
  // Skill helpers
  addSkillToProfile: (skillName: string, skillType: 'teach' | 'learn', level?: string) => Promise<void>;
  removeSkillFromProfile: (skillName: string, skillType: 'teach' | 'learn') => Promise<void>;
  changeSkillLevel: (skillName: string, level: string) => Promise<void>;
}

// Consent-aware storage wrapper for Zustand persist
const consentedStorage = {
  getItem: (name: string): string | null => {
    try {
      const consent = localStorage.getItem('cookieConsent');
      if (consent !== 'accepted') return null;
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      const consent = localStorage.getItem('cookieConsent');
      if (consent !== 'accepted') return; // do not persist without consent
      localStorage.setItem(name, value);
    } catch {
      // no-op
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch {
      // no-op
    }
  },
};

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
            if (localStorage.getItem('cookieConsent') === 'accepted') {
              localStorage.setItem('authToken', token);
            }
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
              if (localStorage.getItem('cookieConsent') === 'accepted') {
                localStorage.setItem('authToken', token);
              }
            }
          } else {
            if (localStorage.getItem('cookieConsent') === 'accepted') {
              localStorage.setItem('authToken', token);
            }
          }

          // Fetch profile after registration/login to get safeProfile
          let user: any = null;
          try {
            const profileRes = await authAPI.getProfile();
            user = profileRes.data?.user ?? profileRes.data?.data ?? profileRes.data?.data?.user;
          } catch (e: any) {
            // If fetching profile fails (e.g., 401 due to cookie not set), try explicit login then retry profile
            const loginRes = await authAPI.login({ email: payload.email, password: payload.password });
            const retryToken = loginRes.data?.token ?? loginRes.data?.data?.token ?? null;
            if (retryToken) {
              if (localStorage.getItem('cookieConsent') === 'accepted') {
                localStorage.setItem('authToken', retryToken);
              }
              token = retryToken;
            }
            const profileRes2 = await authAPI.getProfile();
            user = profileRes2.data?.user ?? profileRes2.data?.data ?? profileRes2.data?.data?.user;
          }

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
        // Try to notify backend to update online status; ignore failures
        try {
          authAPI.logout();
        } catch (_e) {
          // no-op
        }
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
        const storedToken = localStorage.getItem('cookieConsent') === 'accepted'
          ? localStorage.getItem('authToken')
          : null;
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

      // --- Skill mutation helpers (optimistic) ---
      addSkillToProfile: async (skillName: string, skillType: 'teach' | 'learn', level?: string) => {
        const current = (useAuthStore.getState().user || null) as User | null;
        try {
          // Optimistic update
          if (current) {
            const next: User = { ...current } as User;
            if (skillType === 'teach') {
              next.teachSkills = Array.from(new Set([...(current.teachSkills || []), skillName]));
            } else {
              next.learnSkills = Array.from(new Set([...(current.learnSkills || []), skillName]));
            }
            if (level) {
              const sl = Array.isArray(current.skillLevels) ? [...current.skillLevels] : [];
              const idx = sl.findIndex((x) => x.skillName === skillName);
              if (idx >= 0) sl[idx] = { ...sl[idx], level };
              else sl.push({ skillName, level });
              (next as any).skillLevels = sl as any;
            }
            set({ user: next });
          }
          await usersAPI.addSkill({ skillName, skillType, level });
          // After server ack, refresh profile to be certain
          const profileRes = await authAPI.getProfile();
          const user = (profileRes.data as any)?.user ?? (profileRes.data as any)?.data ?? (profileRes.data as any)?.data?.user;
          set({ user });
        } catch (e) {
          // On failure, refetch to rollback
          try {
            const profileRes = await authAPI.getProfile();
            const user = (profileRes.data as any)?.user ?? (profileRes.data as any)?.data ?? (profileRes.data as any)?.data?.user;
            set({ user });
          } catch {
            // ignore
          }
          throw e;
        }
      },

      removeSkillFromProfile: async (skillName: string, skillType: 'teach' | 'learn') => {
        const current = (useAuthStore.getState().user || null) as User | null;
        try {
          // Optimistic update
          if (current) {
            const next: User = { ...current } as User;
            if (skillType === 'teach') {
              next.teachSkills = (current.teachSkills || []).filter((s) => s !== skillName);
            } else {
              next.learnSkills = (current.learnSkills || []).filter((s) => s !== skillName);
            }
            set({ user: next });
          }
          await usersAPI.removeSkill({ skillName, skillType });
          const profileRes = await authAPI.getProfile();
          const user = (profileRes.data as any)?.user ?? (profileRes.data as any)?.data ?? (profileRes.data as any)?.data?.user;
          set({ user });
        } catch (e) {
          try {
            const profileRes = await authAPI.getProfile();
            const user = (profileRes.data as any)?.user ?? (profileRes.data as any)?.data ?? (profileRes.data as any)?.data?.user;
            set({ user });
          } catch {}
          throw e;
        }
      },

      changeSkillLevel: async (skillName: string, level: string) => {
        const current = (useAuthStore.getState().user || null) as User | null;
        try {
          // Optimistic update
          if (current) {
            const next: User = { ...current } as User;
            const sl = Array.isArray(current.skillLevels) ? [...current.skillLevels] : [];
            const idx = sl.findIndex((x) => x.skillName === skillName);
            if (idx >= 0) sl[idx] = { ...sl[idx], level };
            else sl.push({ skillName, level });
            (next as any).skillLevels = sl as any;
            set({ user: next });
          }
          await usersAPI.updateSkillLevel({ skillName, level });
          const profileRes = await authAPI.getProfile();
          const user = (profileRes.data as any)?.user ?? (profileRes.data as any)?.data ?? (profileRes.data as any)?.data?.user;
          set({ user });
        } catch (e) {
          try {
            const profileRes = await authAPI.getProfile();
            const user = (profileRes.data as any)?.user ?? (profileRes.data as any)?.data ?? (profileRes.data as any)?.data?.user;
            set({ user });
          } catch {}
          throw e;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: consentedStorage as any,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize real-time auth/user updates once per app lifecycle
let __authRealtimeInited = false;
export function initAuthRealtime() {
  if (__authRealtimeInited) return;
  __authRealtimeInited = true;
  const socket = getSocket();

  const onUserUpdate = (payload: any) => {
    const current = (useAuthStore.getState().user || null) as User | null;
    const updated = payload?.user ?? payload;
    if (!current || !updated) return;
    if (updated._id && current._id !== updated._id) return; // ignore other users
    const next: User = { ...current, ...updated } as User;
    useAuthStore.getState().updateUser(next);
  };

  const onSkillsUpdate = (payload: any) => {
    const current = (useAuthStore.getState().user || null) as User | null;
    if (!current) return;
    const { teachSkills, learnSkills, skillLevels } = payload || {};
    const next: User = { ...current } as User;
    if (Array.isArray(teachSkills)) next.teachSkills = teachSkills as string[];
    if (Array.isArray(learnSkills)) next.learnSkills = learnSkills as string[];
    if (Array.isArray(skillLevels)) (next as any).skillLevels = skillLevels as any;
    useAuthStore.getState().updateUser(next);
  };

  socket.on('user:update', onUserUpdate);
  socket.on('profile:update', onUserUpdate);
  socket.on('skills:update', onSkillsUpdate);
}

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
