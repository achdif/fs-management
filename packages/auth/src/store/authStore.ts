import { create } from 'zustand';
import type { AuthState, User } from '../types/auth';

interface AuthStore extends AuthState {
  retryAction: (() => void) | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null, errorCode?: string | null, isNetworkError?: boolean, errorSource?: string | null) => void;
  setRetryAction: (action: (() => void) | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  errorCode: null,
  errorSource: null,
  isNetworkError: false,
  retryAction: null,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error, errorCode, isNetworkError, errorSource) => set({ error, errorCode, isNetworkError: isNetworkError || false, errorSource: error ? errorSource ?? null : null, ...(error ? {} : { retryAction: null }) }),
  
  setRetryAction: (retryAction) => set({ retryAction }),
  
  logout: () => set({ user: null, isAuthenticated: false, error: null, errorCode: null, errorSource: null, isNetworkError: false, retryAction: null }),
}));
