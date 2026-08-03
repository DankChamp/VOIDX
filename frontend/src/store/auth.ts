import { create } from 'zustand';
import { api } from '../api/client';

interface User {
  id: number;
  username: string;
  role: string;
  chat_allowed: boolean;
  created_at: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.login(username, password);
      localStorage.setItem('token', res.access_token);
      set({ user: res.user, loading: false, error: null });
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, loading: false, error: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const user = await api.getMe();
      set({ user, loading: false });
    } catch (e: any) {
      if (e.message?.includes('401') || e.message?.includes('Invalid') || e.message?.includes('Unauthorized')) {
        localStorage.removeItem('token');
        set({ user: null, loading: false });
      } else {
        set({ loading: false });
      }
    }
  },
}));
