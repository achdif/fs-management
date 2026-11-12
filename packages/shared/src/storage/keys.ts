/**
 * Registry key storage terpusat — nama key diseragamkan antar platform
 * (web localStorage & RN secure storage memakai key yang sama persis).
 * Prefix `fs.` mencegah tabrakan dengan key lain di storage backend.
 * Key non-auth (settings, preferences, cache) didaftarkan di sini juga.
 */
export const StorageKeys = {
  AUTH_ACCESS_TOKEN: 'fs.auth.access_token',
  AUTH_REFRESH_TOKEN: 'fs.auth.refresh_token',
  AUTH_EXPIRES_AT: 'fs.auth.expires_at',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];
