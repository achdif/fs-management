export * from './services/api.client';
export * from './types/auth';
export * from './store/authStore';
export * from './hooks/useAuth';
export * from './utils/errorCodes';

// Storage & native infra generik di-re-export dari shared (backward compat).
export {
  createAuthStorage,
  createLocalStorageAuthStorage,
  StorageKeys,
} from '@fs-management/shared';
export type {
  AuthStorage,
  AuthStorageService,
  StorageKey,
} from '@fs-management/shared';
