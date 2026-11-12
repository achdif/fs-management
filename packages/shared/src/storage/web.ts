import type { AuthStorage } from './types';

type WebStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const getStore = (): WebStorage | null =>
  (globalThis as {localStorage?: WebStorage}).localStorage ?? null;

/**
 * Implementasi AuthStorage di atas localStorage — untuk web (non-cookie data)
 * dan testing. Token web sebaiknya tetap di HttpOnly cookie (cookieAuth mode),
 * storage ini hanya untuk data non-sensitif.
 */
export function createLocalStorageAuthStorage(): AuthStorage {
  return {
    async getItem(key: string) {
      return getStore()?.getItem(key) ?? null;
    },

    async setItem(key: string, value: string) {
      getStore()?.setItem(key, value);
    },

    async removeItem(key: string) {
      getStore()?.removeItem(key);
    },
  };
}
