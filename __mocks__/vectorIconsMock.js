const React = require('react');

const MockIcon = props => {
  return React.createElement('Icon', props, props.children);
};

module.exports = {
  Feather: MockIcon,
  AntDesign: MockIcon,
  MaterialIcons: MockIcon,
  Ionicons: MockIcon,
  FontAwesome: MockIcon,
};
