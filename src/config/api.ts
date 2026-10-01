import { NativeModules, Platform } from 'react-native';

const ANDROID_PHONE_API_HOST = '10.45.81.184';

const isAndroidEmulator =
  Platform.OS === 'android' &&
  (/generic|emulator|sdk/i.test(Platform.constants.Fingerprint ?? '') ||
    /emulator|sdk/i.test(Platform.constants.Model ?? ''));

const FALLBACK_API_HOST =
  Platform.OS === 'android'
    ? isAndroidEmulator
      ? // Android emulators use 10.0.2.2 to reach the development machine.
      '10.0.2.2'
      : // Physical devices must use the development machine's LAN address.
      ANDROID_PHONE_API_HOST
    : 'localhost';

  const scriptUrl = NativeModules.SourceCode?.scriptURL as string | undefined;
  const expoHost = scriptUrl?.match(/^[a-z]+:\/\/([^/:]+)/i)?.[1];
  const LOCAL_API_HOST = expoHost || FALLBACK_API_HOST;

// Authentication and profile API (server/).
export const API_BASE = `http://${LOCAL_API_HOST}:4000`;
  export const AUTH_BASE = API_BASE;

// Community, posts, comments, and moderation API (backend/).
export const COMMUNITY_API_BASE = `http://${LOCAL_API_HOST}:3000/api`;
