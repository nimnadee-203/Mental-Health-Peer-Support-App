import { Platform } from 'react-native';

/**
 * Global API Base Configuration:
 * - Android Emulator: 'http://10.0.2.2:3000/api'
 * - iOS Simulator / Physical Device / Web: 'http://localhost:3000/api'
 */
export const API_BASE = Platform.select({
  android: 'http://10.0.2.2:4000',
  default: 'http://localhost:4000',
});
