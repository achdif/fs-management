import { API_BASE_URL, AUTH_MODE } from '../config';
import type {
  FollowUpActivity,
  FollowUpHistoryResponse,
  FollowUpPayload,
  PreBookDetail,
  PreBookListResponse,
  PreBookOpportunity,
} from '../types/prebook';

export interface PreBookApiClientConfig {
  baseUrl: string;
  /**
   * 'bearer' (default): kirim Authorization: Bearer <token> — mobile.
   * 'cookie': andalkan HttpOnly cookie dari backend — web. Token tidak
   * pernah masuk JS; setToken() menjadi no-op.
   */
  authMode?: 'bearer' | 'cookie';
}

export class PreBookApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private authMode: 'bearer' | 'cookie';

  constructor(config: PreBookApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.authMode = config.authMode ?? 'bearer';
  }

  setToken(token: string | null) {
    if (this.authMode === 'cookie') return;
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      ...(this.authMode === 'cookie' ? { credentials: 'include' as const } : {}),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.error?.message || 'Request failed';
      const errorCode = data?.error?.code;
      const error: any = new Error(errorMsg);
      error.code = errorCode;
      error.status = response.status;
      throw error;
    }

    return data;
  }

  async listPreBooks(params: { status?: string; limit?: number; offset?: number } = {}) {
    const qs = new URLSearchParams();
    if (params.status && params.status !== 'all') qs.set('status', params.status);
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.offset) qs.set('offset', String(params.offset));
    const query = qs.toString();
    return this.request<PreBookListResponse>(
      `/api/v1/pre-books${query ? `?${query}` : ''}`,
      { method: 'GET' },
    );
  }

  async getPreBook(id: string) {
    return this.request<{ pre_book: PreBookDetail }>(`/api/v1/pre-books/${id}`, {
      method: 'GET',
    });
  }

  async getFollowUpHistory(preBookId: string) {
    return this.request<FollowUpHistoryResponse>(
      `/api/v1/pre-books/${preBookId}/follow-ups`,
      { method: 'GET' },
    );
  }

  async createPreBook(customerId: string) {
    return this.request<{ pre_book: PreBookOpportunity }>('/api/v1/pre-books', {
      method: 'POST',
      body: JSON.stringify({ customer_id: customerId }),
    });
  }

  async createFollowUp(preBookId: string, payload: FollowUpPayload) {
    return this.request<{ follow_up: FollowUpActivity }>(
      `/api/v1/pre-books/${preBookId}/follow-ups`,
      { method: 'POST', body: JSON.stringify(payload) },
    );
  }

  async updateFollowUp(id: string, payload: FollowUpPayload) {
    return this.request<{ follow_up: FollowUpActivity }>(`/api/v1/follow-ups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }
}

let apiInstance: PreBookApiClient | null = null;

export function getPreBookApiClient(config?: Partial<PreBookApiClientConfig>): PreBookApiClient {
  if (!apiInstance) {
    apiInstance = new PreBookApiClient({
      baseUrl: API_BASE_URL,
      authMode: AUTH_MODE,
      ...config,
    });
  }
  return apiInstance;
}

export function resetPreBookApiClient() {
  apiInstance = null;
}
