import type { AuthStorage } from './types';

const KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  EXPIRES_AT: 'auth_expires_at',
} as const;

export function createAuthStorage(storage: AuthStorage) {
  return {
    async getAccessToken() {
      return await storage.getItem(KEYS.ACCESS_TOKEN);
    },
    
    async getRefreshToken() {
      return await storage.getItem(KEYS.REFRESH_TOKEN);
    },
    
    async getExpiresAt() {
      const expiresAt = await storage.getItem(KEYS.EXPIRES_AT);
      return expiresAt ? parseInt(expiresAt, 10) : null;
    },
    
    async setTokens(accessToken: string, refreshToken: string, expiresAt: number) {
      await Promise.all([
        storage.setItem(KEYS.ACCESS_TOKEN, accessToken),
        storage.setItem(KEYS.REFRESH_TOKEN, refreshToken),
        storage.setItem(KEYS.EXPIRES_AT, expiresAt.toString()),
      ]);
    },
    
    async clearTokens() {
      await Promise.all([
        storage.removeItem(KEYS.ACCESS_TOKEN),
        storage.removeItem(KEYS.REFRESH_TOKEN),
        storage.removeItem(KEYS.EXPIRES_AT),
      ]);
    },
    
    async isTokenExpired() {
      const expiresAt = await this.getExpiresAt();
      if (!expiresAt) return true;
      return Date.now() >= expiresAt;
    },
  };
}

export type AuthStorageService = ReturnType<typeof createAuthStorage>;
