import type { AuthTokens } from '../storage/types';

export interface ApiClientConfig {
  baseUrl: string;
}

export type { AuthTokens };

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
  }

  setToken(token: string | null) {
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

  async signin(payload: { email: string; password: string }) {
    return this.request<{ success: boolean; tokens: AuthTokens; user: any }>('/api/v1/auth/signin', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async signup(payload: { email: string; password: string; fullName?: string; phone?: string }) {
    return this.request<{ success: boolean; email: string; user: any }>('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async verifyOtp(payload: { email: string; otp: string }) {
    return this.request<{ success: boolean; message: string }>('/api/v1/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async forgotPassword(email: string) {
    return this.request<{ success: boolean; message: string }>('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request<{ success: boolean; message: string }>('/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<{ success: boolean; message: string }>('/api/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async refresh() {
    return this.request<{ success: boolean; accessToken: string }>('/api/v1/auth/refresh', {
      method: 'POST',
    });
  }

  async signout() {
    return this.request<{ success: boolean; message: string }>('/api/v1/auth/signout', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.request<{ user: any }>('/api/v1/auth/me', {
      method: 'GET',
    });
  }
}

let apiInstance: ApiClient | null = null;

export function getApiClient(config?: ApiClientConfig): ApiClient {
  if (!apiInstance && config) {
    apiInstance = new ApiClient(config);
  }
  if (!apiInstance) {
    throw new Error('ApiClient not initialized. Call getApiClient with config first.');
  }
  return apiInstance;
}

export function resetApiClient() {
  apiInstance = null;
}
