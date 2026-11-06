import type {TurboModule} from 'react-native/Libraries/TurboModule/RCTExport';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  getCurrentStatus(): Promise<{isConnected: boolean; type: string}>;
  startListening(): void;
  stopListening(): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RTNNetworkMonitor');
