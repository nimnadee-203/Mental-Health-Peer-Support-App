export interface UserProfileStats {
  posts: number;
  supports: number;
  replies: number;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  bio: string;
  interests: string[];
  stats: UserProfileStats;
}

export interface UpdateProfilePayload {
  fullName?: string;
  bio?: string;
  interests?: string[];
}
