import { Platform } from 'react-native';

export const API_BASE = Platform.select({
  android: 'http://localhost:4000',
  default: 'http://localhost:4000',
});