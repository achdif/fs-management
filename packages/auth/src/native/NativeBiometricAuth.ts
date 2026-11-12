import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  isAvailable(): Promise<{available: boolean; type: 'faceid' | 'touchid' | 'none'}>;
  authenticate(reason: string): Promise<{success: boolean; error?: string}>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RTNBiometricAuth');
