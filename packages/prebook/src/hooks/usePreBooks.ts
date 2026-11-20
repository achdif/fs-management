import { useCallback, useEffect, useState } from 'react';
import { usePreBookStore } from '../store/prebookStore';
import { getPreBookApiClient } from '../services/api.client';
import NativeNetworkMonitor from '@fs-management/shared/src/native/NativeNetworkMonitor';
import type {
  FollowUpActivity,
  FollowUpPayload,
  PreBookDetail,
  PreBookOpportunity,
  PreBookStatusFilter,
} from '../types/prebook';

const isNetworkFailure = async (err: unknown): Promise<boolean> => {
  // Server merespons dengan HTTP error (punya status) = bukan network error,
  // walaupun pesannya mengandung kata "connection"/"fetch".
  if (err && typeof err === 'object' && typeof (err as any).status === 'number') {
    return false;
  }
  const message = err instanceof Error ? err.message : '';
  const looksLikeNetwork = message.includes('network') ||
    message.includes('ENOTFOUND') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ETIMEDOUT') ||
    message.includes('fetch failed') ||
    message.includes('Network request failed') ||
    (err instanceof Error && err.name === 'NetworkError');
  if (!looksLikeNetwork) {
    return false;
  }
  // Fetch gagal: bedakan device offline vs backend/server down.
  try {
    const status = await NativeNetworkMonitor.getCurrentStatus();
    return !status.isConnected;
  } catch {
    return true;
  }
};

const handleError = async (
  err: unknown,
  fallback: string,
  source: string,
  setError: (e: string | null, c?: string | null, n?: boolean, s?: string | null) => void,
  setRetryAction: (a: (() => void) | null) => void,
  retry: () => void,
): Promise<string> => {
  const message = err instanceof Error ? err.message : fallback;
  const isNet = await isNetworkFailure(err);
  const code = (err as any)?.code || (isNet ? 'EM_0812' : 'ED_0002');
  setError(message, code, isNet, source);
  setRetryAction(() => retry);
  return message;
};

export function usePreBookList() {
  const {
    items, total, statusFilter, isLoading, error, errorCode, errorSource, isNetworkError,
    setItems, setStatusFilter: setFilter, setLoading, setError, setRetryAction, clearError,
  } = usePreBookStore();

  const fetchList = useCallback(async (status: PreBookStatusFilter = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const api = getPreBookApiClient();
      const res = await api.listPreBooks({ status, limit: 50 });
      setItems(res.items, res.total);
      return res.items;
    } catch (err: any) {
      await handleError(err, 'Failed to load opportunities', 'list', setError, setRetryAction, () => { void fetchList(status); });
      return null;
    } finally {
      setLoading(false);
    }
  }, [setItems, setLoading, setError, setRetryAction]);

  const refresh = useCallback(() => fetchList(statusFilter), [fetchList, statusFilter]);

  const setStatusFilter = useCallback((filter: PreBookStatusFilter) => {
    setFilter(filter);
    void fetchList(filter);
  }, [setFilter, fetchList]);

  useEffect(() => {
    void fetchList(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retryLastAction = useCallback(() => {
    const action = usePreBookStore.getState().retryAction;
    if (action) action();
  }, []);

  return {
    items, total, statusFilter, isLoading, error, errorCode, errorSource, isNetworkError,
    refresh, setStatusFilter, clearError, retryLastAction,
  };
}

export function usePreBookDetail(id: string) {
  const detail = usePreBookStore((s) => s.details[id]);
  const { isLoading, error, errorCode, errorSource, isNetworkError } = usePreBookStore();
  const { setDetail, setLoading, setError, setRetryAction, clearError } = usePreBookStore();

  const fetchDetail = useCallback(async (): Promise<PreBookDetail | null> => {
    setLoading(true);
    setError(null);
    try {
      const api = getPreBookApiClient();
      const res = await api.getPreBook(id);
      setDetail(id, res.pre_book);
      return res.pre_book;
    } catch (err: any) {
      await handleError(err, 'Failed to load opportunity', 'detail', setError, setRetryAction, () => { void fetchDetail(); });
      return null;
    } finally {
      setLoading(false);
    }
  }, [id, setDetail, setLoading, setError, setRetryAction]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  const retryLastAction = useCallback(() => {
    const action = usePreBookStore.getState().retryAction;
    if (action) action();
  }, []);

  return {
    detail, isLoading, error, errorCode, errorSource, isNetworkError,
    refresh: fetchDetail, clearError, retryLastAction,
  };
}

export function useFollowUpHistory(preBookId: string) {
  const [followUps, setFollowUps] = useState<FollowUpActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setErrorState(null);
    try {
      const api = getPreBookApiClient();
      const res = await api.getFollowUpHistory(preBookId);
      setFollowUps(res.follow_ups);
      return res.follow_ups;
    } catch (err: any) {
      setErrorState(err instanceof Error ? err.message : 'Failed to load history');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [preBookId]);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  return { followUps, isLoading, error, refresh: fetchHistory };
}

export function useCreatePreBook() {
  const { setLoading, setError, setRetryAction } = usePreBookStore();

  const createPreBook = useCallback(async (customerId: string): Promise<PreBookOpportunity | null> => {
    setLoading(true);
    setError(null);
    try {
      const api = getPreBookApiClient();
      const res = await api.createPreBook(customerId);
      return res.pre_book;
    } catch (err: any) {
      await handleError(err, 'Failed to create opportunity', 'create', setError, setRetryAction, () => { void createPreBook(customerId); });
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setRetryAction]);

  const { isLoading, error, errorCode, errorSource, isNetworkError } = usePreBookStore();
  const retryLastAction = useCallback(() => {
    const action = usePreBookStore.getState().retryAction;
    if (action) action();
  }, []);

  return { createPreBook, isLoading, error, errorCode, errorSource, isNetworkError, retryLastAction };
}

export function useCreateFollowUp(preBookId: string) {
  const { setLoading, setError, setRetryAction } = usePreBookStore();

  const createFollowUp = useCallback(async (payload: FollowUpPayload): Promise<FollowUpActivity | null> => {
    setLoading(true);
    setError(null);
    try {
      const api = getPreBookApiClient();
      const res = await api.createFollowUp(preBookId, payload);
      return res.follow_up;
    } catch (err: any) {
      await handleError(err, 'Failed to schedule follow-up', 'followUp', setError, setRetryAction, () => { void createFollowUp(payload); });
      return null;
    } finally {
      setLoading(false);
    }
  }, [preBookId, setLoading, setError, setRetryAction]);

  const { isLoading, error, errorCode, errorSource, isNetworkError } = usePreBookStore();
  const retryLastAction = useCallback(() => {
    const action = usePreBookStore.getState().retryAction;
    if (action) action();
  }, []);

  return { createFollowUp, isLoading, error, errorCode, errorSource, isNetworkError, retryLastAction };
}

export function useUpdateFollowUp() {
  const { setLoading, setError, setRetryAction } = usePreBookStore();

  const updateFollowUp = useCallback(async (id: string, payload: FollowUpPayload): Promise<FollowUpActivity | null> => {
    setLoading(true);
    setError(null);
    try {
      const api = getPreBookApiClient();
      const res = await api.updateFollowUp(id, payload);
      return res.follow_up;
    } catch (err: any) {
      await handleError(err, 'Failed to update follow-up', 'followUp', setError, setRetryAction, () => { void updateFollowUp(id, payload); });
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setRetryAction]);

  const { isLoading, error, errorCode, errorSource, isNetworkError } = usePreBookStore();
  const retryLastAction = useCallback(() => {
    const action = usePreBookStore.getState().retryAction;
    if (action) action();
  }, []);

  return { updateFollowUp, isLoading, error, errorCode, errorSource, isNetworkError, retryLastAction };
}
