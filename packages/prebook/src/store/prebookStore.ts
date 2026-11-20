import { create } from 'zustand';
import type { PreBookDetail, PreBookOpportunity, PreBookState, PreBookStatusFilter } from '../types/prebook';

interface PreBookStore extends PreBookState {
  setItems: (items: PreBookOpportunity[], total: number) => void;
  setStatusFilter: (filter: PreBookStatusFilter) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null, errorCode?: string | null, isNetworkError?: boolean, errorSource?: string | null) => void;
  setDetail: (id: string, detail: PreBookDetail) => void;
  removeDetail: (id: string) => void;
  setRetryAction: (action: (() => void) | null) => void;
  clearError: () => void;
}

export const usePreBookStore = create<PreBookStore>((set) => ({
  items: [],
  total: 0,
  statusFilter: 'all',
  isLoading: false,
  error: null,
  errorCode: null,
  errorSource: null,
  isNetworkError: false,
  details: {},
  retryAction: null,

  setItems: (items, total) => set({ items, total }),

  setStatusFilter: (statusFilter) => set({ statusFilter }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error, errorCode, isNetworkError, errorSource) => set({
    error,
    errorCode,
    isNetworkError: isNetworkError || false,
    errorSource: error ? errorSource ?? null : null,
    ...(error ? {} : { retryAction: null }),
  }),

  setDetail: (id, detail) => set((state) => ({ details: { ...state.details, [id]: detail } })),

  removeDetail: (id) => set((state) => {
    const details = { ...state.details };
    delete details[id];
    return { details };
  }),

  setRetryAction: (retryAction) => set({ retryAction }),

  clearError: () => set({ error: null, errorCode: null, errorSource: null, isNetworkError: false, retryAction: null }),
}));
