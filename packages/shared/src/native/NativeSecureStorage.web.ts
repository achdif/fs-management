// Web stub — implementasi AuthStorage-compatible di atas localStorage.
// Catatan: untuk data sensitif di web gunakan HttpOnly cookie (cookieAuth mode),
// bukan storage JS.

type WebStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
};

const store = (): WebStorage | null =>
  (globalThis as {localStorage?: WebStorage}).localStorage ?? null;

export default {
  async setItem(key: string, value: string): Promise<boolean> {
    store()?.setItem(key, value);
    return true;
  },
  async getItem(key: string): Promise<string | null> {
    return store()?.getItem(key) ?? null;
  },
  async removeItem(key: string): Promise<boolean> {
    store()?.removeItem(key);
    return true;
  },
  async clear(): Promise<boolean> {
    store()?.clear();
    return true;
  },
};
