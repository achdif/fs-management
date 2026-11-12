import type { AuthStorage } from './types';
import { StorageKeys } from './keys';

export function createAuthStorage(storage: AuthStorage) {
  return {
    async getAccessToken() {
      return await storage.getItem(StorageKeys.AUTH_ACCESS_TOKEN);
    },

    async getRefreshToken() {
      return await storage.getItem(StorageKeys.AUTH_REFRESH_TOKEN);
    },

    async getExpiresAt() {
      const expiresAt = await storage.getItem(StorageKeys.AUTH_EXPIRES_AT);
      return expiresAt ? parseInt(expiresAt, 10) : null;
    },

    async setTokens(accessToken: string, refreshToken: string, expiresAt: number) {
      await Promise.all([
        storage.setItem(StorageKeys.AUTH_ACCESS_TOKEN, accessToken),
        storage.setItem(StorageKeys.AUTH_REFRESH_TOKEN, refreshToken),
        storage.setItem(StorageKeys.AUTH_EXPIRES_AT, expiresAt.toString()),
      ]);
    },

    async clearTokens() {
      await Promise.all([
        storage.removeItem(StorageKeys.AUTH_ACCESS_TOKEN),
        storage.removeItem(StorageKeys.AUTH_REFRESH_TOKEN),
        storage.removeItem(StorageKeys.AUTH_EXPIRES_AT),
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
