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

function App() {
  const isDarkMode = useColorScheme() === 'dark';

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
     * Emergency Support Screen
     */
    if (isEmergencyOpen) {
      return (
        <EmergencySupportScreen
          onBack={handleBackFromEmergency}
        />
      );
    }

    /*
     * Resource Article Screen
     */
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

    /*
     * Activities Screen
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
     * Group Details Screen
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
              const alreadyJoined = current.some(
                group =>
                  group.groupName ===
                  selectedGroup.groupName
              );

              if (alreadyJoined) {
                return current;
              }

              return [...current, selectedGroup];
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
     * Create Group Screen
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
     * Main Tabs
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
                    group.groupName !== groupName
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

      case 'Home':
      default:
        return <HomeScreen />;
    }
  }, [
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

      {/* Bottom navigation should NOT appear on
          Article, Activity, Emergency, Create Group
          or Group Details screens */}
      {!isArticleOpen &&
        !isActivityOpen &&
        !isEmergencyOpen &&
        !isCreateGroupOpen &&
        !selectedGroup && (
          <BottomNavigation
            activeTab={activeTab}
            onChangeTab={changeTab}
          />
        )}
    </SafeAreaProvider>
  );
}

export default App;