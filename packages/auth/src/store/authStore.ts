import { create } from 'zustand';
import type { AuthState, User } from '../types/auth';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null, errorCode?: string, isNetworkError?: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  errorCode: null,
  isNetworkError: false,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error, errorCode, isNetworkError) => set({ error, errorCode, isNetworkError: isNetworkError || false }),
  
  logout: () => set({ user: null, isAuthenticated: false, error: null, errorCode: null, isNetworkError: false }),
}));
