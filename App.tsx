import React, { useMemo, useState } from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomNavigation from './src/components/BottomNavigation';
import HomeScreen from './src/screens/HomeScreen';
import ResourceArticleScreen from './src/screens/ResourceArticleScreen';
import ActivitiesScreen from './src/screens/ActivitiesScreen';
import { ResourceArticle } from './src/types/ResourceArticle';
import GroupsHomeScreen from './src/screens/Groups/GroupsHomeScreen';
import CreateGroupScreen from './src/screens/Groups/CreateGroupScreen';
import GroupDetailsScreen from './src/screens/Groups/GroupDetailsScreen';

type ResourcesScreenProps = {
  onOpenArticle: (article: ResourceArticle) => void;
  onOpenActivity: (
    activity: 'breathing' | 'mindfulness' | 'journaling'
  ) => void;
  savedResources?: string[];
};

const ResourcesScreen =
  require('./src/screens/ResourcesScreen').default as React.ComponentType<ResourcesScreenProps>;

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const [activeTab, setActiveTab] = useState<
    'Home' | 'Resources' | 'Groups' | 'Messages' | 'Profile'
  >('Home');

  const [isArticleOpen, setIsArticleOpen] = useState(false);

  const [selectedArticle, setSelectedArticle] =
    useState<ResourceArticle | null>(null);

  const [savedResources, setSavedResources] =
    useState<string[]>([]);

  const [isActivityOpen, setIsActivityOpen] =
    useState(false);

  const [isCreateGroupOpen, setIsCreateGroupOpen] = 
  useState(false);

  const [selectedGroup, setSelectedGroup] = useState<{
  groupName: string;
  category: string;
  description: string;
  guidelines: string;
} | null>(null);

  const [selectedActivity, setSelectedActivity] =
    useState<
      'breathing' | 'mindfulness' | 'journaling'
    >('breathing');

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
     setIsCreateGroupOpen(false);
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
    activity:
      | 'breathing'
      | 'mindfulness'
      | 'journaling'
  ) => {
    setSelectedActivity(activity);
    setIsActivityOpen(true);
  };

  const screen = useMemo(() => {
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

    if (isActivityOpen) {
      return (
        <ActivitiesScreen
          activity={selectedActivity}
          onBack={() => {
            setIsActivityOpen(false);
            setActiveTab('Resources');
          }}
        />
      );
    }

    if (selectedGroup) {
  return (
    <GroupDetailsScreen
      groupName={selectedGroup.groupName}
      category={selectedGroup.category}
      description={selectedGroup.description}
      guidelines={selectedGroup.guidelines}
      onBack={() => {
        setSelectedGroup(null);
        setActiveTab('Groups');
      }}
    />
  );
}

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

    switch (activeTab) {
      case 'Resources':
        return (
          <ResourcesScreen
            savedResources={savedResources}
            onOpenArticle={handleOpenArticle}
            onOpenActivity={handleOpenActivity}
          />
        );

       case 'Groups':
  return (
    <GroupsHomeScreen
      onCreateGroup={() => {
        setIsCreateGroupOpen(true);
      }}
      onOpenGroup={(group) => {
        setSelectedGroup(group);
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
    savedResources,
    selectedArticle,
    isActivityOpen,
    selectedActivity,
    isCreateGroupOpen,
    selectedGroup,

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

      {!isArticleOpen && !isActivityOpen && (
        <BottomNavigation
          activeTab={activeTab}
          onChangeTab={changeTab}
        />
      )}
    </SafeAreaProvider>
  );
}

export default App;