import { NativeModules, Platform } from 'react-native';

const scriptUrl = NativeModules.SourceCode?.scriptURL as string | undefined;
const expoHost = scriptUrl?.match(/^[a-z]+:\/\/([^/:]+)/i)?.[1];

// When ADB reverse is active (adb reverse tcp:4000 tcp:4000),
// localhost forwards port 4000 & 3000 over USB to the development machine.
const LOCAL_API_HOST =
  Platform.OS === 'android'
    ? 'localhost'
    : expoHost || 'localhost';

// Authentication and profile API (server/).
export const API_BASE = `http://${LOCAL_API_HOST}:4000`;
export const AUTH_BASE = API_BASE;

// Community, posts, comments, and moderation API (backend/).
export const COMMUNITY_API_BASE = `http://${LOCAL_API_HOST}:3000/api`;