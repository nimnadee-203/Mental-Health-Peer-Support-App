import React, { useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';

type AppScreen = 'welcome' | 'auth' | 'home' | 'profile';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [activeScreen, setActiveScreen] = useState<AppScreen>('welcome');

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {activeScreen === 'welcome' ? (
        <WelcomeScreen onGetStarted={() => setActiveScreen('auth')} />
      ) : activeScreen === 'auth' ? (
        <AuthScreen onAuthenticated={() => setActiveScreen('home')} />
      ) : activeScreen === 'profile' ? (
        <ProfileScreen onBack={() => setActiveScreen('home')} />
      ) : (
        <HomeScreen onOpenProfile={() => setActiveScreen('profile')} />
      )}
    </SafeAreaProvider>
  );
}

export default App;
