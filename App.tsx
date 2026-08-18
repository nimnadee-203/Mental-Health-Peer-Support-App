import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GroupDiscussionScreen, { Community, Post } from './src/screens/GroupDiscussionScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';

// Mock Community since we bypassed the Group Join screen
const MOCK_COMMUNITY: Community = {
  _id: 'mock_mindfulness',
  name: 'Mindfulness & Healthy Habits',
  category: 'Mindfulness',
  themeColor: '#D4C9F5',
  memberCount: 154,
  guidelines: [
    'Be kind and respectful.',
    'All posts here are anonymous.',
    'This is peer support — not professional advice.'
  ],
  isJoined: true,
};

function App() {
  const [currentScreen, setCurrentScreen] = useState<'discussion' | 'create' | 'postDetail'>('discussion');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const navigateToDiscussion = () => {
    setCurrentScreen('discussion');
  };

  const navigateToCreate = () => {
    setCurrentScreen('create');
  };

  const navigateToPostDetail = (post: Post) => {
    setSelectedPost(post);
    setCurrentScreen('postDetail');
  };

  return (
    <SafeAreaProvider>
      {currentScreen === 'discussion' && (
        <GroupDiscussionScreen 
          community={MOCK_COMMUNITY}
          onBack={() => { /* Handled natively or ignored in isolation mode */ }}
          onCreatePost={navigateToCreate}
          onPostPress={navigateToPostDetail}
        />
      )}
      {currentScreen === 'create' && (
        <CreatePostScreen 
          community={MOCK_COMMUNITY}
          onBack={navigateToDiscussion}
          onPostCreated={navigateToDiscussion}
        />
      )}
      {currentScreen === 'postDetail' && selectedPost && (
        <PostDetailScreen
          post={selectedPost}
          onBack={navigateToDiscussion}
        />
      )}
    </SafeAreaProvider>
  );
}

export default App;
