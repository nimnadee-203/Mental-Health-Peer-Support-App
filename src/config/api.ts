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

/** Full API prefix — append /resource directly, e.g. `${API_BASE}/conversations` */
export const API_BASE = `${BASE_URL}/api`;

/** Alias used by community & resource helpers (same endpoint, different semantic name) */
export const COMMUNITY_API_BASE = API_BASE;