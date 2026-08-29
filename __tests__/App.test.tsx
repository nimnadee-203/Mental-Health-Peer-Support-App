/**
 * @format
 */

import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import BottomNavigation from '../src/components/BottomNavigation';
import HomeScreen from '../src/screens/HomeScreen';
import ResourceArticleScreen from '../src/screens/ResourceArticleScreen';
import ResourcesScreen from '../src/screens/ResourcesScreen';
import ActivitiesScreen from '../src/screens/ActivitiesScreen';
import { resourceArticles } from '../src/types/ResourceArticle';

jest.mock('react-native-sound', () => {
  const SoundMock = jest.fn().mockImplementation(() => ({
    setNumberOfLoops: jest.fn(),
    setVolume: jest.fn(),
    play: jest.fn(),
    stop: jest.fn(),
    release: jest.fn(),
  }));
  (SoundMock as any).setCategory = jest.fn();
  return SoundMock;
});

test('renders the home screen content and the full shared bottom navigation', async () => {
  let homeComponent: ReactTestRenderer.ReactTestRenderer;
  let navComponent: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    homeComponent = ReactTestRenderer.create(<HomeScreen />);
    navComponent = ReactTestRenderer.create(
      <BottomNavigation activeTab="Home" onChangeTab={() => {}} />,
    );
  });

  const homeTextLabels = homeComponent!.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .flatMap(value => (Array.isArray(value) ? value : [value]));

  const navTextLabels = navComponent!.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .flatMap(value => (Array.isArray(value) ? value : [value]));

  expect(homeTextLabels).toContain('Patient Stories');
  expect(homeTextLabels).toContain('Share your health journey');
  expect(navTextLabels).toContain('Home');
  expect(navTextLabels).toContain('Resources');
  expect(navTextLabels).toContain('Groups');
  expect(navTextLabels).toContain('Messages');
  expect(navTextLabels).toContain('Profile');

  await ReactTestRenderer.act(() => {
    homeComponent!.unmount();
    navComponent!.unmount();
  });
});

test('opens the article detail screen when the resources card is pressed', async () => {
  const onOpenArticle = jest.fn();
  let resourceComponent: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    resourceComponent = ReactTestRenderer.create(
      <ResourcesScreen
        onOpenArticle={onOpenArticle}
        onOpenActivity={() => {}}
        onOpenEmergencySupport={() => {}}
        onOpenCreateResource={() => {}}
        savedResources={[]}
      />,
    );
  });

  const articleCard = resourceComponent!.root
    .findAll(node => node.props.testID === 'resource-article-card')[0];

  expect(articleCard).toBeTruthy();

  await ReactTestRenderer.act(() => {
    articleCard.props.onPress();
  });

  expect(onOpenArticle).toHaveBeenCalledTimes(1);

  await ReactTestRenderer.act(() => {
    resourceComponent!.unmount();
  });
});

test('starts the breathing exercise flow from the activities screen', async () => {
  jest.useFakeTimers();

  let activitiesComponent: ReactTestRenderer.ReactTestRenderer | undefined;

  try {
    await ReactTestRenderer.act(() => {
      activitiesComponent = ReactTestRenderer.create(
        <ActivitiesScreen
          activity="breathing"
          onBack={() => {}}
          onSelectActivity={() => {}}
        />,
      );
    });

    const activityText = activitiesComponent!.root
      .findAllByType(Text)
      .map(node => node.props.children)
      .flatMap(value => (Array.isArray(value) ? value : [value]))
      .join(' ');

    expect(activityText).toContain('Breathe in slowly');
  } finally {
    await ReactTestRenderer.act(() => {
      activitiesComponent?.unmount();
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  }
});

test('allows the user to go back from the article detail screen', async () => {
  const onBack = jest.fn();
  let articleComponent: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    articleComponent = ReactTestRenderer.create(
      <ResourceArticleScreen article={resourceArticles[0]} onBack={onBack} />,
    );
  });

  const backButton = articleComponent!.root
    .findAll(node => node.props.testID === 'resource-article-back')[0];

  expect(backButton).toBeTruthy();

  await ReactTestRenderer.act(() => {
    backButton.props.onPress();
  });

  expect(onBack).toHaveBeenCalledTimes(1);

  await ReactTestRenderer.act(() => {
    articleComponent!.unmount();
  });
});
