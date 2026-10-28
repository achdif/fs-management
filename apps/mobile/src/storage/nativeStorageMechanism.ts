import * as SecureStore from 'expo-secure-store';
import type { AuthStorage } from '@fs-management/auth/src/storage/types';

export function nativeStorageMechanism(): AuthStorage {
  return {
    async getItem(key: string) {
      return await SecureStore.getItemAsync(key);
    },
    
    async setItem(key: string, value: string) {
      await SecureStore.setItemAsync(key, value);
    },
    
    async removeItem(key: string) {
      await SecureStore.deleteItemAsync(key);
    },
  };
}
