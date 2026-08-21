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
  | 'journaling'
  | 'digitalDetox'
  | 'healthyRoutine';

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

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  /*
   * ==========================================
   * GROUP DISCUSSION STATE
   * ==========================================
   */

  const [currentScreen, setCurrentScreen] =
    useState<
      'discussion' | 'create' | 'postDetail' | null
    >(null);

  const [selectedPost, setSelectedPost] =
    useState<Post | null>(null);

  /*
   * The actual group selected by the user.
   */
  const [selectedGroup, setSelectedGroup] =
    useState<Group | null>(null);

  /*
   * Community used by GroupDiscussionScreen.
   */
  const [selectedCommunity, setSelectedCommunity] =
    useState<Community | null>(null);

  /*
   * ==========================================
   * GROUP DISCUSSION NAVIGATION
   * ==========================================
   */

  const navigateToDiscussion = () => {
    if (!selectedCommunity) {
      return;
    }

    setSelectedPost(null);
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
   * ==========================================
   * MAIN NAVIGATION
   * ==========================================
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

  const [joinedGroups, setJoinedGroups] =
    useState<Group[]>([]);

  const [selectedActivity, setSelectedActivity] =
    useState<ActivityType>('breathing');

  /*
   * ==========================================
   * CHANGE MAIN TAB
   * ==========================================
   */

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
     * Close Group Discussion screens
     */
    setCurrentScreen(null);
    setSelectedPost(null);
    setSelectedCommunity(null);

    /*
     * Close other secondary screens
     */
    setIsArticleOpen(false);
    setIsActivityOpen(false);
    setIsEmergencyOpen(false);
    setIsCreateGroupOpen(false);

    setSelectedArticle(null);
    setSelectedGroup(null);
  };

  /*
   * ==========================================
   * RESOURCE FUNCTIONS
   * ==========================================
   */

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

  /*
   * ==========================================
   * OPEN REAL GROUP DISCUSSION
   * ==========================================
   */

const openGroupDiscussion = (group: Group) => {
  const community: Community = {
    _id: group.groupName,
    name: group.groupName,
    category: group.category,
    memberCount: 0,
    isJoined: true,
    emoji: group.emoji,
    bgColor: '#EEF4FF',
    description: group.description,
    memberAvatarColors: [],
  };

  setSelectedGroup(group);
  setSelectedCommunity(community);
  setCurrentScreen('discussion');
};
  /*
   * ==========================================
   * SCREEN RENDERING
   * ==========================================
   */

  const screen = useMemo(() => {
    /*
     * ==========================================
     * GROUP DISCUSSION
     * ==========================================
     */

    if (
      currentScreen === 'discussion' &&
      selectedCommunity
    ) {
      return (
        <GroupDiscussionScreen
          community={selectedCommunity}
          onBack={() => {
            setCurrentScreen(null);
            setSelectedPost(null);
            setActiveTab('Groups');
          }}
          onCreatePost={navigateToCreate}
          onPostPress={navigateToPostDetail}
        />
      );
    }

    /*
     * ==========================================
     * CREATE POST
     * ==========================================
     */

    if (
      currentScreen === 'create' &&
      selectedCommunity
    ) {
      return (
        <CreatePostScreen
          community={selectedCommunity}
          onBack={() => {
            setCurrentScreen('discussion');
          }}
          onPostCreated={() => {
            setCurrentScreen('discussion');
          }}
        />
      );
    }

    /*
     * ==========================================
     * POST DETAIL
     * ==========================================
     */

    if (
      currentScreen === 'postDetail' &&
      selectedPost
    ) {
      return (
        <PostDetailScreen
          post={selectedPost}
          onBack={() => {
            setSelectedPost(null);
            setCurrentScreen('discussion');
          }}
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

            /*
             * After joining, open the actual
             * discussion community.
             */
            openGroupDiscussion(selectedGroup);
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
      /*
       * HOME
       */

      case 'Home':
        return <HomeScreen />;

      /*
       * RESOURCES
       */

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

      /*
       * GROUPS
       */

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

      /*
       * MESSAGES
       */

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

      /*
       * PROFILE
       */

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

      default:
        return <HomeScreen />;
    }
  }, [
    currentScreen,
    selectedPost,
    selectedCommunity,
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

  /*
   * ==========================================
   * APP
   * ==========================================
   */

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
       * Bottom navigation appears only on
       * the main screens.
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