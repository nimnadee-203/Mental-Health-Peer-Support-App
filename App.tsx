import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CommunityHomeScreen from './src/screens/CommunityHomeScreen';
import GroupDetailScreen from './src/screens/GroupDetailScreen';
import GroupDiscussionScreen, { Community, Post } from './src/screens/GroupDiscussionScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'detail' | 'discussion' | 'create' | 'postDetail'>('home');
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

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

  const navigateToPostDetail = (post: Post) => {
    setSelectedPost(post);
    setCurrentScreen('postDetail');
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
          onPostPress={navigateToPostDetail}
        />
      )}
      {currentScreen === 'create' && selectedCommunity && (
        <CreatePostScreen 
          community={selectedCommunity}
          onBack={() => navigateToDiscussion(selectedCommunity)}
          onPostCreated={() => navigateToDiscussion(selectedCommunity)}
        />
      )}
      {currentScreen === 'postDetail' && selectedPost && selectedCommunity && (
        <PostDetailScreen
          post={selectedPost}
          onBack={() => navigateToDiscussion(selectedCommunity)}
        />
      )}
    </SafeAreaProvider>
  );
}

export default App;
