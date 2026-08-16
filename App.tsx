import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CommunityHomeScreen from './src/screens/CommunityHomeScreen';

function App() {
  return (
    <SafeAreaProvider>
      <CommunityHomeScreen />
    </SafeAreaProvider>
  );
}

export default App;
