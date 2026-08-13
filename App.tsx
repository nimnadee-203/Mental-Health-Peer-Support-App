import React, { useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {hasStarted ? (
        <HomeScreen />
      ) : (
        <WelcomeScreen onGetStarted={() => setHasStarted(true)} />
      )}
    </SafeAreaProvider>
  );
}

export default App;
