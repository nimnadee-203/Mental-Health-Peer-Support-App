export type VisibilityOption = 'Everyone' | 'Group Members' | 'Only Me';
export type MessagingOption = 'Everyone' | 'Group Members' | 'Nobody';

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

