let authenticatedUserId: string | null = null;

export const setAuthUserId = (userId: string | null) => {
  authenticatedUserId = userId;
};

export const getAuthUserId = (): string | null => {
  return authenticatedUserId;
};
