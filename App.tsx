import React, { useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';

type AppScreen =
  | 'splash'
  | 'welcome'
  | 'auth'
  | 'onboarding'
  | 'home'
  | 'profile';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [activeScreen, setActiveScreen] = useState<AppScreen>('splash');

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {activeScreen === 'splash' ? (
        <SplashScreen onFinish={() => setActiveScreen('welcome')} />
      ) : activeScreen === 'welcome' ? (
        <WelcomeScreen onGetStarted={() => setActiveScreen('auth')} />
      ) : activeScreen === 'auth' ? (
        <AuthScreen onAuthenticated={() => setActiveScreen('onboarding')} />
      ) : activeScreen === 'onboarding' ? (
        <OnboardingScreen
          onComplete={() => setActiveScreen('home')}
          onSkip={() => setActiveScreen('home')}
        />
      ) : activeScreen === 'profile' ? (
        <ProfileScreen onBack={() => setActiveScreen('home')} />
      ) : (
        <HomeScreen onOpenProfile={() => setActiveScreen('profile')} />
      )}
    </SafeAreaProvider>
  );
}

export default App;

