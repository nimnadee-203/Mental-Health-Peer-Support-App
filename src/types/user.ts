export type VisibilityOption = 'Everyone' | 'Group Members' | 'Only Me';
export type MessagingOption = 'Everyone' | 'Group Members' | 'Nobody';

export type UserRole =
  | 'community_member'
  | 'peer_volunteer'
  | 'moderator'
  | 'admin'
  | 'user';

export interface PrivacySettings {
  profileVisibility: VisibilityOption;
  anonymousSharing: boolean;
  whoCanMessageMe: MessagingOption;
  showInterestsOnProfile: boolean;
}

export interface UserProfileStats {
  posts: number;
  supports: number;
  replies: number;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role?: UserRole;
  bio: string;
  interests: string[];
  stats: UserProfileStats;
  privacySettings?: PrivacySettings;
}

export interface UpdateProfilePayload {
  fullName?: string;
  bio?: string;
  interests?: string[];
  privacySettings?: PrivacySettings;
}
