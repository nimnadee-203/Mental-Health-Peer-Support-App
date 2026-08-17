import React, { useMemo, useState } from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomNavigation from './src/components/BottomNavigation';
import HomeScreen from './src/screens/HomeScreen';
import ResourcesScreen from './src/screens/ResourcesScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [activeTab, setActiveTab] = useState<
    'Home' | 'Resources' | 'Groups' | 'Messages' | 'Profile'
  >('Home');

  const screen = useMemo(() => {
    switch (activeTab) {
      case 'Resources':
        return <ResourcesScreen />;
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
  }, [activeTab, isDarkMode]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {screen}
      <BottomNavigation activeTab={activeTab} onChangeTab={setActiveTab} />
    </SafeAreaProvider>
  );
}

export default App;
