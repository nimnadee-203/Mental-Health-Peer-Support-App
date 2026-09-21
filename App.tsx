import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import BottomNavigation from './src/components/BottomNavigation';

import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import ModeratorDashboardScreen from './src/screens/ModeratorDashboardScreen';

import ResourcesScreen from './src/screens/ResourcesScreen';
import ResourceArticleScreen from './src/screens/ResourceArticleScreen';
import ActivitiesScreen from './src/screens/ActivitiesScreen';
import CreateResourceScreen from './src/screens/CreateResourceScreen';

import { ResourceArticle, resourceArticles } from './src/types/ResourceArticle';

import GroupsHomeScreen from './src/screens/Groups/GroupsHomeScreen';
import GroupDetailScreen from './src/screens/Groups/GroupDetailScreen';
import GroupDiscussionScreen, {
  Community,
  Post,
} from './src/screens/GroupDiscussionScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';
import CreateGroupScreen from './src/screens/Groups/CreateGroupScreen';

import EmergencySupportScreen from './src/screens/EmergencySupportScreen';
import { API_BASE, COMMUNITY_API_BASE } from './src/config/api';
import { getAuthRole, getAuthUserId, setAuthUserId } from './src/api/authStore';
import {
  createResource as createResourceRequest,
  getResources,
} from './src/api/resourcesApi';
import { updateUserProfile } from './src/api/profileApi';

// ─── Types ────────────────────────────────────────────────────────────────────

type AppScreen =
  | 'splash'
  | 'welcome'
  | 'auth'
  | 'onboarding'
  | 'home'
  | 'profile'
  | 'moderation';

type ResourcesScreenProps = {
  onOpenArticle: (article: ResourceArticle) => void;

  onOpenActivity: (
    activity?:
      | 'breathing'
      | 'mindfulness'
      | 'journaling'
      | 'digitalDetox'
      | 'healthyRoutine',
  ) => void;

  onOpenEmergencySupport: () => void;

  onOpenCreateResource: () => void;

  savedResources?: string[];
};

type GroupsView =
  | 'home'
  | 'detail'
  | 'discussion'
  | 'postDetail'
  | 'createPost'
  | 'createGroup';

// ─── Community Data ───────────────────────────────────────────────────────────

const INITIAL_COMMUNITIES: Community[] = [
  {
    _id: '1',
    name: 'Student Stress Support',
    category: 'Academic Pressure',
    topics: ['Stress', 'Academic pressure'],
    emoji: '📚',
    bgColor: '#EFF6FF',
    description:
      'Manage exam pressure, deadlines, and study burnout with peer advice.',
    guidelines: 'Share strategies constructively.',
    memberCount: 1540,
    memberAvatarColors: ['#3B82F6', '#60A5FA', '#93C5FD'],
    isJoined: false,
  },
  {
    _id: '2',
    name: 'Anxiety Support Circle',
    category: 'Stress & Anxiety',
    topics: ['Anxiety', 'Stress'],
    emoji: '🌿',
    bgColor: '#E6F4EA',
    description:
      'A safe space to share anxiety coping strategies and ground yourself.',
    guidelines: 'Be kind, respectful, and supportive.',
    memberCount: 1420,
    memberAvatarColors: ['#34D399', '#60A5FA', '#F472B6'],
    isJoined: false,
  },
  {
    _id: '3',
    name: 'Relationship Support',
    category: 'Relationships',
    topics: ['Relationships', 'Relationship problems'],
    emoji: '🤝',
    bgColor: '#FCE7F3',
    description:
      'Discuss family dynamics, friendships, and relationship boundaries.',
    guidelines: 'Respect privacy and offer empathy.',
    memberCount: 960,
    memberAvatarColors: ['#EC4899', '#F472B6', '#FBCFE8'],
    isJoined: false,
  },
  {
    _id: '4',
    name: 'Grief Support Group',
    category: 'Grief',
    topics: ['Grief', 'Loss'],
    emoji: '🕯️',
    bgColor: '#F3F4F6',
    description:
      'Compassionate listening and peer comfort for navigating loss.',
    guidelines: 'Gentle, compassionate space.',
    memberCount: 680,
    memberAvatarColors: ['#6B7280', '#9CA3AF', '#D1D5DB'],
    isJoined: false,
  },
  {
    _id: '5',
    name: 'Self-Confidence Group',
    category: 'Self-Care',
    topics: ['Self-confidence', 'General wellbeing'],
    emoji: '✨',
    bgColor: '#FEF3C7',
    description:
      'Building self-worth, overcoming imposter syndrome, and personal growth.',
    guidelines: 'Encouraging and uplifting discussions.',
    memberCount: 1210,
    memberAvatarColors: ['#F59E0B', '#FBBF24', '#FDE68A'],
    isJoined: false,
  },
  {
    _id: '6',
    name: 'Daily Mindfulness & Healing',
    category: 'Mindfulness',
    topics: ['Mindfulness', 'General wellbeing'],
    emoji: '🧘',
    bgColor: '#E8F0FE',
    description:
      'Practice meditation, breathing exercises, and present-moment awareness.',
    guidelines: 'Share your journey openly.',
    memberCount: 890,
    memberAvatarColors: ['#818CF8', '#FBBF24', '#34D399'],
    isJoined: false,
  },
  {
    _id: '7',
    name: 'Depression Recovery Peers',
    category: 'Depression',
    topics: ['Depression', 'Self-Care', 'Loneliness'],
    emoji: '☀️',
    bgColor: '#FEF3C7',
    description:
      'Supporting each other through low moments with hope and small wins.',
    guidelines: 'No medical advice; offer peer empathy.',
    memberCount: 1105,
    memberAvatarColors: ['#F87171', '#60A5FA', '#A78BFA'],
    isJoined: false,
  },
];

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const [activeScreen, setActiveScreen] = useState<AppScreen>('splash');

  // ── Tab Navigation ─────────────────────────────────────────────────────────

  const [activeTab, setActiveTab] = useState<
    'Home' | 'Resources' | 'Groups' | 'Messages' | 'Activities' | 'Profile'
  >('Home');

  // ── Resources Navigation ───────────────────────────────────────────────────

  const [isArticleOpen, setIsArticleOpen] = useState(false);

  const [selectedArticle, setSelectedArticle] =
    useState<ResourceArticle | null>(null);

  const [savedResources, setSavedResources] = useState<string[]>([]);

  const [createdResources, setCreatedResources] = useState<ResourceArticle[]>(
    [],
  );

  const allResources = useMemo(
    () => [...createdResources, ...resourceArticles],
    [createdResources],
  );

  const [isActivityOpen, setIsActivityOpen] = useState(false);

  const [selectedActivity, setSelectedActivity] = useState<
    | 'breathing'
    | 'mindfulness'
    | 'journaling'
    | 'digitalDetox'
    | 'healthyRoutine'
    | undefined
  >(undefined);

  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  // ── Create Resource Navigation ─────────────────────────────────────────────

  const [isCreateResourceOpen, setIsCreateResourceOpen] = useState(false);

  // ── Groups Navigation ──────────────────────────────────────────────────────

  const [groupsView, setGroupsView] = useState<GroupsView>('home');

  const [communities, setCommunities] =
    useState<Community[]>(INITIAL_COMMUNITIES);

  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null,
  );

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>([]);

  // ── Fetch Communities ──────────────────────────────────────────────────────

  useEffect(() => {
    fetchCommunities();
  }, []);

  useEffect(() => {
    let isMounted = true;

    getResources()
      .then(resources => {
        if (isMounted) {
          setCreatedResources(resources);
        }
      })
      .catch(error => {
        console.warn('Failed to fetch saved resources:', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await fetch(`${COMMUNITY_API_BASE}/communities`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      if (!text || text.trim().length === 0) {
        throw new Error('Empty response body');
      }

      const data = JSON.parse(text);
      if (Array.isArray(data) && data.length > 0) {
        setCommunities(data);
      } else {
        setCommunities(INITIAL_COMMUNITIES);
      }
    } catch (error) {
      setCommunities(INITIAL_COMMUNITIES);
    }
  };

  // ── Tab Change ─────────────────────────────────────────────────────────────

  const changeTab = (
    tab: 'Home' | 'Resources' | 'Groups' | 'Messages' | 'Activities' | 'Profile',
  ) => {
    setActiveTab(tab);

    // Close resource-related screens
    setIsArticleOpen(false);
    setIsActivityOpen(tab === 'Activities');
    setSelectedActivity(undefined);
    setIsEmergencyOpen(false);
    setIsCreateResourceOpen(false);

    // Reset groups sub-navigation
    if (tab === 'Groups') {
      setGroupsView('home');
    }
  };

  // ── Resources Handlers ─────────────────────────────────────────────────────

  const handleOpenArticle = (article: ResourceArticle) => {
    setSelectedArticle(article);

    setSavedResources(current =>
      current.includes(article.id) ? current : [...current, article.id],
    );

    setIsArticleOpen(true);
  };

  const handleOpenActivity = (
    activity?:
      | 'breathing'
      | 'mindfulness'
      | 'journaling'
      | 'digitalDetox'
      | 'healthyRoutine',
  ) => {
    setSelectedActivity(activity);

    setIsActivityOpen(true);
  };

  const handleOpenEmergencySupport = () => {
    setIsEmergencyOpen(true);
  };

  const handleBackFromEmergency = () => {
    setIsEmergencyOpen(false);
  };

  // ── Create Resource Handlers ───────────────────────────────────────────────

  const handleOpenCreateResource = () => {
    setIsCreateResourceOpen(true);
  };

  const handleBackFromCreateResource = () => {
    setIsCreateResourceOpen(false);
    setActiveTab('Resources');
  };

  const handleCreateResource = async (resource: ResourceArticle) => {
    const savedResource = await createResourceRequest(resource);

    setCreatedResources(current => [savedResource, ...current]);
  };

  // ── Groups Handlers ─────────────────────────────────────────────────────────

  const handleGroupPress = (community: Community) => {
    setSelectedCommunity(community);
    setGroupsView('detail');
  };

  const handleJoinGroup = (communityId: string) => {
    setJoinedGroupIds(prev =>
      prev.includes(communityId) ? prev : [...prev, communityId],
    );
  };

  const handleEnterCommunity = (community: Community) => {
    setSelectedCommunity(community);
    setGroupsView('discussion');
  };

  const handlePostPress = (post: Post) => {
    setSelectedPost(post);
    setGroupsView('postDetail');
  };

  const handleCreatePost = (community: Community) => {
    setSelectedCommunity(community);
    setGroupsView('createPost');
  };

  const handleBackToDiscussion = () => {
    setGroupsView('discussion');
  };

  const handleBackToDetail = () => {
    setGroupsView('detail');
  };

  const handleBackToHome = () => {
    setGroupsView('home');
  };

  // ── Whether Bottom Navigation Should Be Hidden ──────────────────────────────

  const isGroupDeepView =
    activeTab === 'Groups' &&
    (groupsView === 'discussion' ||
      groupsView === 'postDetail' ||
      groupsView === 'createPost');

  const hideBottomNav =
    isArticleOpen ||
    (isActivityOpen && !!selectedActivity) ||
    isEmergencyOpen ||
    isCreateResourceOpen ||
    isGroupDeepView;

  // ── Screen Renderer ─────────────────────────────────────────────────────────

  const screen = useMemo(() => {
    // ── Resources: Article ───────────────────────────────────────────────────

    if (isArticleOpen && selectedArticle) {
      return (
        <ResourceArticleScreen
          article={selectedArticle}
          onBack={() => {
            setIsArticleOpen(false);
            setSelectedArticle(null);
            setActiveTab('Resources');
          }}
        />
      );
    }

    // ── Resources: Activity ──────────────────────────────────────────────────

    if (isActivityOpen) {
      return (
        <ActivitiesScreen
          activity={selectedActivity}
          onSelectActivity={setSelectedActivity}
          onBack={() => {
            setIsActivityOpen(false);
            setActiveTab('Resources');
          }}
        />
      );
    }

    // ── Resources: Emergency Support ─────────────────────────────────────────

    if (isEmergencyOpen) {
      return <EmergencySupportScreen onBack={handleBackFromEmergency} />;
    }

    // ── Resources: Create Resource ───────────────────────────────────────────

    if (isCreateResourceOpen) {
      return (
        <CreateResourceScreen
          onBack={handleBackFromCreateResource}
          onCreateResource={handleCreateResource}
        />
      );
    }

    // ── Groups Sub-Navigation ────────────────────────────────────────────────

    if (activeTab === 'Groups') {
      // Group Detail
      if (groupsView === 'detail' && selectedCommunity) {
        return (
          <GroupDetailScreen
            community={selectedCommunity}
            isJoined={joinedGroupIds.includes(selectedCommunity._id)}
            onBack={handleBackToHome}
            onJoin={handleJoinGroup}
            onEnter={handleEnterCommunity}
          />
        );
      }

      // Group Discussion
      if (groupsView === 'discussion' && selectedCommunity) {
        return (
          <GroupDiscussionScreen
            community={selectedCommunity}
            onBack={handleBackToDetail}
            onCreatePost={handleCreatePost}
            onPostPress={handlePostPress}
            onOpenEmergencySupport={handleOpenEmergencySupport}
          />
        );
      }

      // Post Detail
      if (groupsView === 'postDetail' && selectedPost) {
        return (
          <PostDetailScreen
            post={selectedPost}
            onBack={handleBackToDiscussion}
            onOpenEmergencySupport={handleOpenEmergencySupport}
          />
        );
      }

      // Create Post
      if (groupsView === 'createPost' && selectedCommunity) {
        return (
          <CreatePostScreen
            community={selectedCommunity}
            onBack={handleBackToDiscussion}
            onPostCreated={handleBackToDiscussion}
          />
        );
      }

      if (groupsView === 'createGroup') {
        return (
          <CreateGroupScreen
            onBack={async () => {
              await fetchCommunities();
              setGroupsView('home');
            }}
          />
        );
      }

      // Default: Groups home
      return (
        <GroupsHomeScreen
          communities={communities}
          joinedIds={joinedGroupIds}
          onGroupPress={handleGroupPress}
          onCreateGroup={() => setGroupsView('createGroup')}
        />
      );
    }

    // ── Main Tabs ─────────────────────────────────────────────────────────────

    switch (activeTab) {
      // ── Resources ──────────────────────────────────────────────────────────

      case 'Resources':
        return (
          <ResourcesScreen
            savedResources={savedResources}
            resources={allResources}
            onOpenArticle={handleOpenArticle}
            onOpenActivity={handleOpenActivity}
            onOpenEmergencySupport={handleOpenEmergencySupport}
            onOpenCreateResource={handleOpenCreateResource}
          />
        );

      // ── Messages ────────────────────────────────────────────────────────────

      case 'Messages':
        return (
          <View
            style={{
              flex: 1,
              backgroundColor: '#F2F5F7',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            />
          </View>
        );

      // ── Activities ─────────────────────────────────────────────────────────

      case 'Activities':
        return null;

      // ── Profile ────────────────────────────────────────────────────────────

      case 'Profile':
        return (
          <ProfileScreen
            onBack={() => changeTab('Home')}
            onNavigateToAuth={() => setActiveScreen('auth')}
            onOpenModeration={
              getAuthRole() === 'moderator' ? () => setActiveScreen('moderation') : undefined
            }
            onLogout={() => {
              setAuthUserId(null);
              setActiveScreen('auth');
              setActiveTab('Home');
            }}
          />
        );

      // ── Home ────────────────────────────────────────────────────────────────

      case 'Home':
      default:
        return <HomeScreen />;
    }
  }, [
    activeTab,
    isDarkMode,

    // Resources
    isArticleOpen,
    selectedArticle,
    savedResources,
    isActivityOpen,
    selectedActivity,
    isEmergencyOpen,
    isCreateResourceOpen,

    // Groups
    groupsView,
    selectedCommunity,
    selectedPost,
    joinedGroupIds,
    communities,
  ]);

  const handleSplashFinish = useCallback(() => {
    setActiveScreen('welcome');
  }, []);

  // ── App UI ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {activeScreen === 'splash' ? (
        <SplashScreen onFinish={handleSplashFinish} />
      ) : activeScreen === 'welcome' ? (
        <WelcomeScreen onGetStarted={() => setActiveScreen('auth')} />
      ) : activeScreen === 'auth' ? (
        <AuthScreen
          onAuthenticated={isSignup =>
            setActiveScreen(isSignup ? 'onboarding' : 'home')
          }
        />
      ) : activeScreen === 'moderation' ? (
        <ModeratorDashboardScreen
          role="moderator"
          onBack={() => setActiveScreen('home')}
        />
      ) : activeScreen === 'onboarding' ? (
        <OnboardingScreen
          onComplete={async data => {
            const currentUserId = getAuthUserId();

            if (currentUserId && data?.selectedInterests?.length) {
              try {
                await updateUserProfile(currentUserId, {
                  interests: data.selectedInterests,
                });
              } catch (e) {
                // Silently handle offline/guest error
              }
            }

            setActiveScreen('home');
          }}
          onSkip={() => setActiveScreen('home')}
        />
      ) : (
        <>
          {screen}

          <Pressable
            accessibilityLabel="Open profile"
            accessibilityRole="button"
            onPress={() => changeTab('Profile')}
            style={styles.profileShortcut}
          >
            <Text style={styles.profileShortcutText}>P</Text>
          </Pressable>

          {!hideBottomNav && (
            <BottomNavigation activeTab={activeTab} onChangeTab={changeTab} />
          )}
        </>
      )}
    </SafeAreaProvider>
  );
}

export default App;

const styles = StyleSheet.create({
  profileShortcut: {
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    borderColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 2,
    elevation: 5,
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    right: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    top: 12,
    width: 44,
    zIndex: 20,
  },
  profileShortcutText: {
    color: '#276A5A',
    fontSize: 17,
    fontWeight: '900',
  },
});
