import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CommunityHomeScreen from './src/screens/CommunityHomeScreen';
import GroupDetailScreen from './src/screens/GroupDetailScreen';
import GroupDiscussionScreen, { Community } from './src/screens/GroupDiscussionScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'detail' | 'discussion' | 'create'>('home');
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);

  const navigateToHome = () => setCurrentScreen('home');
  
  const navigateToDetail = (community: Community) => {
    setSelectedCommunity(community);
    setCurrentScreen('detail');
  };

  const navigateToDiscussion = (community: Community) => {
    setSelectedCommunity(community);
    setCurrentScreen('discussion');
  };

  const navigateToCreate = (community: Community) => {
    setSelectedCommunity(community);
    setCurrentScreen('create');
  };

  return (
    <SafeAreaProvider>
      {currentScreen === 'home' && (
        <CommunityHomeScreen onCommunityPress={navigateToDetail} />
      )}
      {currentScreen === 'detail' && selectedCommunity && (
        <GroupDetailScreen 
          community={selectedCommunity} 
          onBack={navigateToHome}
          onJoin={() => navigateToDiscussion(selectedCommunity)}
        />
      )}
      {currentScreen === 'discussion' && selectedCommunity && (
        <GroupDiscussionScreen 
          community={selectedCommunity}
          onBack={navigateToHome}
          onCreatePost={navigateToCreate}
        />
      )}
      {currentScreen === 'create' && selectedCommunity && (
        <CreatePostScreen 
          community={selectedCommunity}
          onBack={() => navigateToDiscussion(selectedCommunity)}
          onPostCreated={() => navigateToDiscussion(selectedCommunity)}
        />
      )}
    </SafeAreaProvider>
  );
}

export default App;
