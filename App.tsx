import React, { useMemo, useState } from 'react';
import {
  StatusBar,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import BottomNavigation from './src/components/BottomNavigation';
import HomeScreen from './src/screens/HomeScreen';
import ResourceArticleScreen from './src/screens/ResourceArticleScreen';
import ActivitiesScreen from './src/screens/ActivitiesScreen';
import EmergencySupportScreen from './src/screens/EmergencySupportScreen';

import { ResourceArticle } from './src/types/ResourceArticle';

import GroupsHomeScreen from './src/screens/Groups/GroupsHomeScreen';
import CreateGroupScreen from './src/screens/Groups/CreateGroupScreen';
import GroupDetailsScreen from './src/screens/Groups/GroupDetailsScreen';

import GroupDiscussionScreen, {
  Community,
  Post,
} from './src/screens/GroupDiscussionScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';

type ActivityType =
  | 'breathing'
  | 'mindfulness'
  | 'journaling';

type ResourcesScreenProps = {
  onOpenArticle: (article: ResourceArticle) => void;

  onOpenActivity: (
    activity: ActivityType
  ) => void;

  onOpenEmergencySupport: () => void;

  savedResources?: string[];
};

const ResourcesScreen =
  require('./src/screens/ResourcesScreen')
    .default as React.ComponentType<ResourcesScreenProps>;

type Group = {
  groupName: string;
  category: string;
  description: string;
  guidelines: string;
  emoji: string;
};

/*
 * Mock Community for Group Discussion
 */
const MOCK_COMMUNITY: Community = {
  _id: 'mock_mindfulness',
  name: 'Mindfulness & Healthy Habits',
  category: 'Mindfulness',
  themeColor: '#D4C9F5',
  memberCount: 154,
  guidelines: [
    'Be kind and respectful.',
    'All posts here are anonymous.',
    'This is peer support — not professional advice.',
  ],
  isJoined: true,
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  /*
   * Group Discussion navigation
   *
   * null = normal application navigation
   */
  const [currentScreen, setCurrentScreen] = useState<
    'discussion' | 'create' | 'postDetail' | null
  >(null);

  const [selectedPost, setSelectedPost] =
    useState<Post | null>(null);

  const navigateToDiscussion = () => {
    setCurrentScreen('discussion');
  };

  const navigateToCreate = () => {
    setCurrentScreen('create');
  };

  const navigateToPostDetail = (post: Post) => {
    setSelectedPost(post);
    setCurrentScreen('postDetail');
  };

  /*
   * Main application navigation
   */
  const [activeTab, setActiveTab] = useState<
    'Home' | 'Resources' | 'Groups' | 'Messages' | 'Profile'
  >('Home');

  const [isArticleOpen, setIsArticleOpen] =
    useState(false);

  const [selectedArticle, setSelectedArticle] =
    useState<ResourceArticle | null>(null);

  const [savedResources, setSavedResources] =
    useState<string[]>([]);

  const [isActivityOpen, setIsActivityOpen] =
    useState(false);

  const [isEmergencyOpen, setIsEmergencyOpen] =
    useState(false);

  const [isCreateGroupOpen, setIsCreateGroupOpen] =
    useState(false);

  const [selectedGroup, setSelectedGroup] =
    useState<Group | null>(null);

  const [joinedGroups, setJoinedGroups] =
    useState<Group[]>([]);

  const [selectedActivity, setSelectedActivity] =
    useState<ActivityType>('breathing');

  const changeTab = (
    tab:
      | 'Home'
      | 'Resources'
      | 'Groups'
      | 'Messages'
      | 'Profile'
  ) => {
    setActiveTab(tab);

    /*
     * Close every secondary screen when changing tabs
     */
    setCurrentScreen(null);
    setSelectedPost(null);

    setIsArticleOpen(false);
    setIsActivityOpen(false);
    setIsEmergencyOpen(false);
    setIsCreateGroupOpen(false);

    setSelectedArticle(null);
    setSelectedGroup(null);
  };

  const handleOpenArticle = (
    article: ResourceArticle
  ) => {
    setSelectedArticle(article);

    setSavedResources(current => {
      if (current.includes(article.id)) {
        return current;
      }

      return [...current, article.id];
    });

    setIsArticleOpen(true);
  };

  const handleOpenActivity = (
    activity: ActivityType
  ) => {
    setSelectedActivity(activity);
    setIsActivityOpen(true);
  };

  const handleOpenEmergency = () => {
    setIsEmergencyOpen(true);
  };

  const handleBackFromEmergency = () => {
    setIsEmergencyOpen(false);
    setActiveTab('Resources');
  };

  const screen = useMemo(() => {
    /*
     * ==========================================
     * GROUP DISCUSSION SCREENS
     * ==========================================
     */

    if (currentScreen === 'discussion') {
      return (
        <GroupDiscussionScreen
          community={MOCK_COMMUNITY}
          onBack={() => {
            setCurrentScreen(null);
            setActiveTab('Groups');
          }}
          onCreatePost={navigateToCreate}
          onPostPress={navigateToPostDetail}
        />
      );
    }

    if (currentScreen === 'create') {
      return (
        <CreatePostScreen
          community={MOCK_COMMUNITY}
          onBack={navigateToDiscussion}
          onPostCreated={navigateToDiscussion}
        />
      );
    }

    if (
      currentScreen === 'postDetail' &&
      selectedPost
    ) {
      return (
        <PostDetailScreen
          post={selectedPost}
          onBack={navigateToDiscussion}
        />
      );
    }

    /*
     * ==========================================
     * EMERGENCY SUPPORT
     * ==========================================
     */

    if (isEmergencyOpen) {
      return (
        <EmergencySupportScreen
          onBack={handleBackFromEmergency}
        />
      );
    }

    /*
     * ==========================================
     * RESOURCE ARTICLE
     * ==========================================
     */

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

    /*
     * ==========================================
     * ACTIVITIES
     * ==========================================
     */

    if (isActivityOpen) {
      return (
        <ActivitiesScreen
          activity={selectedActivity}
          onSelectActivity={activity => {
            setSelectedActivity(activity);
          }}
          onBack={() => {
            setIsActivityOpen(false);
            setActiveTab('Resources');
          }}
        />
      );
    }

    /*
     * ==========================================
     * GROUP DETAILS
     * ==========================================
     */

    if (selectedGroup) {
      return (
        <GroupDetailsScreen
          groupName={selectedGroup.groupName}
          category={selectedGroup.category}
          description={selectedGroup.description}
          guidelines={selectedGroup.guidelines}
          emoji={selectedGroup.emoji}
          onJoin={() => {
            setJoinedGroups(current => {
              const alreadyJoined =
                current.some(
                  group =>
                    group.groupName ===
                    selectedGroup.groupName
                );

              if (alreadyJoined) {
                return current;
              }

              return [
                ...current,
                selectedGroup,
              ];
            });
          }}
          onBack={() => {
            setSelectedGroup(null);
            setActiveTab('Groups');
          }}
        />
      );
    }

    /*
     * ==========================================
     * CREATE GROUP
     * ==========================================
     */

    if (isCreateGroupOpen) {
      return (
        <CreateGroupScreen
          onBack={() => {
            setIsCreateGroupOpen(false);
            setActiveTab('Groups');
          }}
        />
      );
    }

    /*
     * ==========================================
     * MAIN TABS
     * ==========================================
     */

    switch (activeTab) {
      case 'Resources':
        return (
          <ResourcesScreen
            savedResources={savedResources}
            onOpenArticle={handleOpenArticle}
            onOpenActivity={handleOpenActivity}
            onOpenEmergencySupport={
              handleOpenEmergency
            }
          />
        );

      case 'Groups':
        return (
          <GroupsHomeScreen
            joinedGroups={joinedGroups}
            onCreateGroup={() => {
              setIsCreateGroupOpen(true);
            }}
            onOpenGroup={group => {
              setSelectedGroup(group);
            }}
            onLeaveGroup={groupName => {
              setJoinedGroups(current =>
                current.filter(
                  group =>
                    group.groupName !==
                    groupName
                )
              );
            }}
          />
        );

      case 'Messages':
        return (
          <View
            style={{
              flex: 1,
              backgroundColor: '#F2F5F7',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          />
        );

      case 'Profile':
        return (
          <View
            style={{
              flex: 1,
              backgroundColor: '#F2F5F7',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          />
        );

      case 'Home':
      default:
        return <HomeScreen />;
    }
  }, [
    currentScreen,
    selectedPost,
    activeTab,
    isDarkMode,
    isArticleOpen,
    selectedArticle,
    savedResources,
    isActivityOpen,
    selectedActivity,
    isEmergencyOpen,
    isCreateGroupOpen,
    selectedGroup,
    joinedGroups,
  ]);

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

      {/*
       * Bottom navigation is hidden while the user
       * is inside a secondary screen.
       */}
      {!isArticleOpen &&
        !isActivityOpen &&
        !isEmergencyOpen &&
        !isCreateGroupOpen &&
        !selectedGroup &&
        !currentScreen && (
          <BottomNavigation
            activeTab={activeTab}
            onChangeTab={changeTab}
          />
        )}
    </SafeAreaProvider>
  );
}

export default App;