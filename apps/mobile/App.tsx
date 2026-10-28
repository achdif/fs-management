import 'react-native-get-random-values';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { getApiClient } from '@fs-management/auth';
import { AppNavigator } from './src/navigation/AppNavigator';

// Deteksi target URL otomatis:
// 1. Jika ada ENV EXPO_PUBLIC_API_URL
// 2. Jika di Expo Go / Device Fisik: Otomatis ambil Host IP laptop dari expoConfig (misal: 10.4.76.88:8080)
// 3. Jika Android Emulator: 10.0.2.2:8080
// 4. Default iOS Simulator: localhost:8080
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Ambil hostUri dari Expo (contoh: "10.4.76.88:8081" -> "10.4.76.88")
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    return `http://${hostIp}:8080`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080';
  }

  return 'http://localhost:8080';
};

// Inisialisasi ApiClient ke backend Rust
getApiClient({
  baseUrl: getBaseUrl(),
});

export default function App() {
  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}
