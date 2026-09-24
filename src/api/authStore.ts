import AsyncStorage from '@react-native-async-storage/async-storage';

let authenticatedUserId: string | null = null;
let authenticatedToken: string | null = null;
let authenticatedRole: 'user' | 'professional' | 'moderator' | 'admin' = 'user';

export const loadAuthSession = async (): Promise<boolean> => {
  try {
    const sessionStr = await AsyncStorage.getItem('@auth_session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      authenticatedUserId = session.userId;
      authenticatedToken = session.token;
      authenticatedRole = session.role || 'user';
      return true;
    }
  } catch (e) {
    console.warn('Failed to load auth session', e);
  }
  return false;
};

export const setAuthSession = (session: {
  userId: string;
  token: string;
  role?: 'user' | 'professional' | 'moderator' | 'admin';
}) => {
  authenticatedUserId = session.userId;
  authenticatedToken = session.token;
  authenticatedRole = session.role || 'user';
  AsyncStorage.setItem('@auth_session', JSON.stringify({
    userId: session.userId,
    token: session.token,
    role: session.role || 'user'
  })).catch(e => console.warn(e));
};

export const setAuthUserId = (userId: string | null) => {
  authenticatedUserId = userId;
  if (!userId) {
    authenticatedToken = null;
    authenticatedRole = 'user';
    AsyncStorage.removeItem('@auth_session').catch(e => console.warn(e));
  }
};

export const clearAuthSession = () => {
  authenticatedUserId = null;
  authenticatedToken = null;
  authenticatedRole = 'user';
  AsyncStorage.removeItem('@auth_session').catch(e => console.warn(e));
};

export const getAuthUserId = (): string | null => {
  return authenticatedUserId;
};

export const getAuthToken = (): string | null => authenticatedToken;

export const getAuthRole = (): 'user' | 'professional' | 'moderator' | 'admin' => authenticatedRole;
