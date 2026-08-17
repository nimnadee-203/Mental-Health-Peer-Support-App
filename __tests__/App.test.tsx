/**
 * @format
 */

import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import BottomNavigation from '../src/components/BottomNavigation';
import HomeScreen from '../src/screens/HomeScreen';

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
});
