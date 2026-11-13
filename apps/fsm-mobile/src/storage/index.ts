import {createAuthStorage} from '@fs-management/auth';
import {nativeAuthStorage} from './authStorage';

export const authStorageService = createAuthStorage(nativeAuthStorage);
