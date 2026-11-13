import {NativeSecureStorage} from '@fs-management/shared';
import type {AuthStorage} from '@fs-management/shared';

export const nativeAuthStorage: AuthStorage = {
  async getItem(key: string) {
    return NativeSecureStorage.getItem(key);
  },

  async setItem(key: string, value: string) {
    await NativeSecureStorage.setItem(key, value);
  },

  async removeItem(key: string) {
    await NativeSecureStorage.removeItem(key);
  },
};
