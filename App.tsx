import React, { useMemo, useState } from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomNavigation from './src/components/BottomNavigation';
import HomeScreen from './src/screens/HomeScreen';
import ResourceArticleScreen from './src/screens/ResourceArticleScreen';
import { ResourceArticle } from './src/types/ResourceArticle';

type ResourcesScreenProps = {
  onOpenArticle: (article: ResourceArticle) => void;
  savedResources?: string[];
};

const ResourcesScreen = require('./src/screens/ResourcesScreen').default as React.ComponentType<ResourcesScreenProps>;

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [activeTab, setActiveTab] = useState<
    'Home' | 'Resources' | 'Groups' | 'Messages' | 'Profile'
  >('Home');
  const [isArticleOpen, setIsArticleOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ResourceArticle | null>(null);
  const [savedResources, setSavedResources] = useState<string[]>([]);

  const changeTab = (tab: 'Home' | 'Resources' | 'Groups' | 'Messages' | 'Profile') => {
    setActiveTab(tab);
    setIsArticleOpen(false);
  };

  const handleOpenArticle = (article: ResourceArticle) => {
    setSelectedArticle(article);
    setSavedResources(current => {
      if (current.includes(article.id)) {
        return current;
      }

      return [...current, article.id];
    });

    setIsArticleOpen(true);
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

    switch (activeTab) {
      case 'Resources':
        return (
          <ResourcesScreen
            savedResources={savedResources}
            onOpenArticle={handleOpenArticle}
          />
        );
      case 'Groups':
        return (
          <View
            style={{
              flex: 1,
              backgroundColor: '#F2F5F7',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          </View>
        );
      case 'Messages':
        return (
          <View
            style={{
              flex: 1,
              backgroundColor: '#F2F5F7',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
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
            }}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          </View>
        );
      case 'Home':
      default:
        return <HomeScreen />;
    }
  }, [activeTab, isDarkMode, isArticleOpen, savedResources, selectedArticle]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {screen}
      {!isArticleOpen && (
        <BottomNavigation activeTab={activeTab} onChangeTab={changeTab} />
      )}
    </SafeAreaProvider>
  );
}

export default App;
