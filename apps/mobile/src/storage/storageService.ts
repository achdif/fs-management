import { createAuthStorage } from '@fs-management/auth';
import { nativeStorageMechanism } from './nativeStorageMechanism';

export const storageService = createAuthStorage(nativeStorageMechanism());
