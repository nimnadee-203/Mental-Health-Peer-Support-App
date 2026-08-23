import React, { useMemo, useState } from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import BottomNavigation from './src/components/BottomNavigation';

import HomeScreen from './src/screens/HomeScreen';
import ResourcesScreen from './src/screens/ResourcesScreen';
import ResourceArticleScreen from './src/screens/ResourceArticleScreen';
import ActivitiesScreen from './src/screens/ActivitiesScreen';
import CreateResourceScreen from './src/screens/CreateResourceScreen';

import { ResourceArticle } from './src/types/ResourceArticle';

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

// ─── Types ────────────────────────────────────────────────────────────────────

type ResourcesScreenProps = {
  onOpenArticle: (article: ResourceArticle) => void;

  onOpenActivity: (
    activity?:
      | 'breathing'
      | 'mindfulness'
      | 'journaling'
      | 'digitalDetox'
      | 'healthyRoutine'
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

const COMMUNITIES: Community[] = [
  {
    _id: 'academic_stress',
    name: 'Managing Academic Stress',
    category: 'Academic Pressure',
    emoji: '📚',
    bgColor: '#FFF3E0',
    description:
      'Share experiences and discover ways to manage academic pressure together.',
    memberCount: 128,
    memberAvatarColors: [
      '#FFB3BA',
      '#FFDFBA',
      '#FFFFBA',
    ],
    isJoined: false,
  },

  {
    _id: 'calm_minds',
    name: 'Calm Minds Community',
    category: 'Stress & Anxiety',
    emoji: '🧘',
    bgColor: '#E8F5E9',
    description:
      'A safe community to share feelings, coping strategies, and everyday experiences.',
    memberCount: 94,
    memberAvatarColors: [
      '#C8EDD5',
      '#C5DFF8',
      '#D4C9F5',
    ],
    isJoined: false,
  },

  {
    _id: 'mindfulness',
    name: 'Mindfulness & Self-Care',
    category: 'Self-Care',
    emoji: '🌿',
    bgColor: '#F3E5F5',
    description:
      'Discover simple self-care habits and mindfulness practices together with others.',
    memberCount: 76,
    memberAvatarColors: [
      '#D4C9F5',
      '#C5DFF8',
      '#FFB3BA',
    ],
    isJoined: false,
  },

  {
    _id: 'not_alone',
    name: 'You Are Not Alone',
    category: 'Depression Support',
    emoji: '💙',
    bgColor: '#E3F2FD',
    description:
      'A welcoming space for people to connect, listen, and support one another.',
    memberCount: 203,
    memberAvatarColors: [
      '#C5DFF8',
      '#D4C9F5',
      '#C8EDD5',
    ],
    isJoined: false,
  },
];

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  // ── Tab Navigation ─────────────────────────────────────────────────────────

  const [activeTab, setActiveTab] = useState<
    'Home' | 'Resources' | 'Groups' | 'Messages' | 'Profile'
  >('Home');

  // ── Resources Navigation ───────────────────────────────────────────────────

  const [isArticleOpen, setIsArticleOpen] =
    useState(false);

  const [selectedArticle, setSelectedArticle] =
    useState<ResourceArticle | null>(null);

  const [savedResources, setSavedResources] =
    useState<string[]>([]);

  const [isActivityOpen, setIsActivityOpen] =
    useState(false);

  const [selectedActivity, setSelectedActivity] =
    useState<
      | 'breathing'
      | 'mindfulness'
      | 'journaling'
      | 'digitalDetox'
      | 'healthyRoutine'
    >('breathing');

  const [isEmergencyOpen, setIsEmergencyOpen] =
    useState(false);

  // NEW: Create Resource navigation

  const [isCreateResourceOpen, setIsCreateResourceOpen] =
    useState(false);

  // ── Groups Navigation ──────────────────────────────────────────────────────

  const [groupsView, setGroupsView] =
    useState<GroupsView>('home');

  const [selectedCommunity, setSelectedCommunity] =
    useState<Community | null>(null);

  const [selectedPost, setSelectedPost] =
    useState<Post | null>(null);

  const [joinedGroupIds, setJoinedGroupIds] =
    useState<string[]>([]);

  // ── Tab change ──────────────────────────────────────────────────────────────

  const changeTab = (
    tab:
      | 'Home'
      | 'Resources'
      | 'Groups'
      | 'Messages'
      | 'Profile'
  ) => {
    setActiveTab(tab);

    setIsArticleOpen(false);
    setIsActivityOpen(false);
    setIsEmergencyOpen(false);

    // NEW: close Create Resource when changing tabs
    setIsCreateResourceOpen(false);

    // Reset groups sub-navigation
    // when switching back to Groups tab
    if (tab === 'Groups') {
      setGroupsView('home');
    }
  };

  // ── Resources handlers ─────────────────────────────────────────────────────

  const handleOpenArticle = (
    article: ResourceArticle,
  ) => {
    setSelectedArticle(article);

    setSavedResources(current =>
      current.includes(article.id)
        ? current
        : [...current, article.id],
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
    if (activity) {
      setSelectedActivity(activity);
    }

    setIsActivityOpen(true);
  };

  const handleOpenEmergencySupport = () => {
    setIsEmergencyOpen(true);
  };

  const handleBackFromEmergency = () => {
    setIsEmergencyOpen(false);
  };

  // ── Create Resource handlers ────────────────────────────────────────────────

  const handleOpenCreateResource = () => {
    setIsCreateResourceOpen(true);
  };

  const handleBackFromCreateResource = () => {
    setIsCreateResourceOpen(false);
    setActiveTab('Resources');
  };

  // ── Groups handlers ─────────────────────────────────────────────────────────

  const handleGroupPress = (
    community: Community,
  ) => {
    setSelectedCommunity(community);
    setGroupsView('detail');
  };

  const handleJoinGroup = (
    communityId: string,
  ) => {
    setJoinedGroupIds(prev =>
      prev.includes(communityId)
        ? prev
        : [...prev, communityId],
    );
  };

  const handleEnterCommunity = (
    community: Community,
  ) => {
    setSelectedCommunity(community);
    setGroupsView('discussion');
  };

  const handlePostPress = (post: Post) => {
    setSelectedPost(post);
    setGroupsView('postDetail');
  };

  const handleCreatePost = (
    community: Community,
  ) => {
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

  // ── Whether bottom nav should be hidden ─────────────────────────────────────

  const isGroupDeepView =
    activeTab === 'Groups' &&
    (groupsView === 'discussion' ||
      groupsView === 'postDetail' ||
      groupsView === 'createPost');

  const hideBottomNav =
    isArticleOpen ||
    isActivityOpen ||
    isEmergencyOpen ||
    isCreateResourceOpen ||
    isGroupDeepView;

  // ── Screen renderer ─────────────────────────────────────────────────────────

  const screen = useMemo(() => {
    // ── Resources: Article open ───────────────────────────────────────────────

    if (
      isArticleOpen &&
      selectedArticle
    ) {
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

    // ── Resources: Activity open ─────────────────────────────────────────────

    if (isActivityOpen) {
      return (
        <ActivitiesScreen
          activity={selectedActivity}
          onSelectActivity={
            setSelectedActivity
          }
          onBack={() => {
            setIsActivityOpen(false);
            setActiveTab('Resources');
          }}
        />
      );
    }

    // ── Resources: Emergency Support ─────────────────────────────────────────

    if (isEmergencyOpen) {
      return (
        <EmergencySupportScreen
          onBack={handleBackFromEmergency}
        />
      );
    }

    // ── Resources: Create Resource ───────────────────────────────────────────

    if (isCreateResourceOpen) {
      return (
        <CreateResourceScreen
          onBack={
            handleBackFromCreateResource
          }
        />
      );
    }

    // ── Groups sub-navigation ────────────────────────────────────────────────

    if (activeTab === 'Groups') {
      // Group Detail
      if (
        groupsView === 'detail' &&
        selectedCommunity
      ) {
        return (
          <GroupDetailScreen
            community={selectedCommunity}
            isJoined={joinedGroupIds.includes(
              selectedCommunity._id,
            )}
            onBack={handleBackToHome}
            onJoin={handleJoinGroup}
            onEnter={handleEnterCommunity}
          />
        );
      }

      // Group Discussion
      if (
        groupsView === 'discussion' &&
        selectedCommunity
      ) {
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
      if (
        groupsView === 'postDetail' &&
        selectedPost
      ) {
        return (
          <PostDetailScreen
            post={selectedPost}
            onBack={
              handleBackToDiscussion
            }
            onOpenEmergencySupport={handleOpenEmergencySupport}
          />
        );
      }

      // Create Post
      if (
        groupsView === 'createPost' &&
        selectedCommunity
      ) {
        return (
          <CreatePostScreen
            community={selectedCommunity}
            onBack={
              handleBackToDiscussion
            }
            onPostCreated={
              handleBackToDiscussion
            }
          />
        );
      }

      // Create Group
      if (
        groupsView === 'createGroup'
      ) {
        return (
          <CreateGroupScreen
            onBack={handleBackToHome}
          />
        );
      }

      // Groups Home
      return (
        <GroupsHomeScreen
          communities={COMMUNITIES}
          joinedIds={joinedGroupIds}
          onGroupPress={handleGroupPress}
          onCreateGroup={() =>
            setGroupsView('createGroup')
          }
        />
      );
    }

    // ── Main tabs ─────────────────────────────────────────────────────────────

    switch (activeTab) {
      // ───────────────────────────────────────────────────────────────────────
      // Resources
      // ───────────────────────────────────────────────────────────────────────

      case 'Resources':
        return (
          <ResourcesScreen
            savedResources={savedResources}
            onOpenArticle={
              handleOpenArticle
            }
            onOpenActivity={
              handleOpenActivity
            }
            onOpenEmergencySupport={
              handleOpenEmergencySupport
            }
            onOpenCreateResource={
              handleOpenCreateResource
            }
          />
        );

      // ───────────────────────────────────────────────────────────────────────
      // Messages
      // ───────────────────────────────────────────────────────────────────────

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
              barStyle={
                isDarkMode
                  ? 'light-content'
                  : 'dark-content'
              }
            />
          </View>
        );

      // ───────────────────────────────────────────────────────────────────────
      // Profile
      // ───────────────────────────────────────────────────────────────────────

      case 'Profile':
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
              barStyle={
                isDarkMode
                  ? 'light-content'
                  : 'dark-content'
              }
            />
          </View>
        );

      // ───────────────────────────────────────────────────────────────────────
      // Home
      // ───────────────────────────────────────────────────────────────────────

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
  ]);

  // ── App UI ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={
          isDarkMode
            ? 'light-content'
            : 'dark-content'
        }
      />

      {screen}

      {!hideBottomNav && (
        <BottomNavigation
          activeTab={activeTab}
          onChangeTab={changeTab}
        />
      )}
    </SafeAreaProvider>
  );
}

export default App;