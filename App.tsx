import React, { useMemo, useState } from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomNavigation from './src/components/BottomNavigation';
import HomeScreen from './src/screens/HomeScreen';
import ResourceArticleScreen from './src/screens/ResourceArticleScreen';
import ResourcesScreen from './src/screens/ResourcesScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [activeTab, setActiveTab] = useState<
    'Home' | 'Resources' | 'Groups' | 'Messages' | 'Profile'
  >('Home');
  const [isArticleOpen, setIsArticleOpen] = useState(false);

  const changeTab = (tab: 'Home' | 'Resources' | 'Groups' | 'Messages' | 'Profile') => {
    setActiveTab(tab);
    setIsArticleOpen(false);
  };

  const screen = useMemo(() => {
    if (isArticleOpen) {
      return (
        <ResourceArticleScreen
          onBack={() => {
            setIsArticleOpen(false);
            setActiveTab('Resources');
          }}
        />
      );
    }

    switch (activeTab) {
      case 'Resources':
        return <ResourcesScreen onOpenArticle={() => setIsArticleOpen(true)} />;
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
  }, [activeTab, isDarkMode, isArticleOpen]);

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
