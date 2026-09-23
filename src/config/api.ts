import { Platform } from 'react-native';

/**
 * Base URL for the backend REST API.
 * - Android emulator: localhost resolves to the emulator itself, not the host machine.
 *   Use 10.0.2.2 to reach the host.
 * - iOS simulator & web: localhost works fine.
 */
const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000',
  default:  'http://localhost:3000',
})!;

/**
 * Base URL for the auth server (login / signup / profile).
 * Runs on port 4000 with no /api prefix.
 */
export const AUTH_BASE = Platform.select({
  android: 'http://10.0.2.2:4000',
  default:  'http://localhost:4000',
})!;

/** Full API prefix — append /resource directly, e.g. `${API_BASE}/conversations` */
export const API_BASE = `${BASE_URL}/api`;

/** Alias used by community & resource helpers (same endpoint, different semantic name) */
export const COMMUNITY_API_BASE = API_BASE;