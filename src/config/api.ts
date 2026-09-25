import { Platform } from 'react-native';

export const API_BASE = Platform.select({
  android: 'http://localhost:4000',
  default: 'http://localhost:4000',
});

export const COMMUNITY_API_BASE = Platform.select({
  android: 'http://localhost:3000/api',
  default: 'http://localhost:3000/api',
});