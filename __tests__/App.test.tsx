/**
 * @format
 */

import React from 'react';
import { Pressable, Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import BottomNavigation from '../src/components/BottomNavigation';
import HomeScreen from '../src/screens/HomeScreen';
import ResourceArticleScreen from '../src/screens/ResourceArticleScreen';
import ResourcesScreen from '../src/screens/ResourcesScreen';
import { resourceArticles } from '../src/types/ResourceArticle';

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

  homeComponent!.unmount();
  navComponent!.unmount();
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

  resourceComponent!.unmount();
});

test('starts the breathing exercise flow from the resources screen', async () => {
  jest.useFakeTimers();

  let resourceComponent: ReactTestRenderer.ReactTestRenderer;

  try {
    await ReactTestRenderer.act(() => {
      resourceComponent = ReactTestRenderer.create(
        <ResourcesScreen
          onOpenArticle={() => {}}
          onOpenActivity={() => {}}
          onOpenEmergencySupport={() => {}}
          savedResources={[]}
        />,
      );
    });

    const startButton = resourceComponent!.root
      .findAll(node => node.props.testID === 'breathing-start-button')[0];

    expect(startButton).toBeTruthy();

    await ReactTestRenderer.act(() => {
      startButton.props.onPress();
      jest.runOnlyPendingTimers();
    });

    const activityText = resourceComponent!.root
      .findAllByType(Text)
      .map(node => node.props.children)
      .flatMap(value => (Array.isArray(value) ? value : [value]))
      .join(' ');

    expect(activityText).toContain('Breathe in slowly');
  } finally {
    await ReactTestRenderer.act(() => {
      resourceComponent?.unmount();
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

  articleComponent!.unmount();
});
