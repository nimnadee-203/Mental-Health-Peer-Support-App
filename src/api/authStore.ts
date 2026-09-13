let authenticatedUserId: string | null = null;
let authenticatedToken: string | null = null;
let authenticatedRole: 'user' | 'moderator' | 'admin' = 'user';

export const setAuthSession = (session: {
  userId: string;
  token: string;
  role?: 'user' | 'moderator' | 'admin';
}) => {
  authenticatedUserId = session.userId;
  authenticatedToken = session.token;
  authenticatedRole = session.role || 'user';
};

export const setAuthUserId = (userId: string | null) => {
  authenticatedUserId = userId;
  if (!userId) {
    authenticatedToken = null;
    authenticatedRole = 'user';
  }
};

export const clearAuthSession = () => {
  authenticatedUserId = null;
  authenticatedToken = null;
  authenticatedRole = 'user';
};

export const getAuthUserId = (): string | null => {
  return authenticatedUserId;
};

export const getAuthToken = (): string | null => authenticatedToken;

export const getAuthRole = (): 'user' | 'moderator' | 'admin' => authenticatedRole;
