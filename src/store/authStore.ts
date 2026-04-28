import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'FARMER' | 'EXPERT' | 'ADMIN';
  isVerifiedExpert?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAccessToken: (token) => set({ accessToken: token }),
      login: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
      logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : sessionStorage)),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
