import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

type Props = {
  title: string;
  onPress: () => void;
};

const Button = ({ title, onPress }: Props) => {
  return (
    <TouchableOpacity testID="custom-button" onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;

test('renders the custom button title', () => {
  const component = ReactTestRenderer.create(
    <Button title="Continue" onPress={() => {}} />,
  );

  expect(component.root.findByType(Text).props.children).toBe('Continue');
});