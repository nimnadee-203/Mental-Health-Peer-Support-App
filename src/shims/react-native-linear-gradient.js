import React from 'react';
import { View } from 'react-native';

// Web shim: renders a plain View with a CSS gradient background
const LinearGradient = ({ colors, start, end, style, children, ...props }) => {
  const angle =
    start && end
      ? Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI)
      : 180;

  const gradient = colors
    ? 'linear-gradient(' + angle + 'deg, ' + colors.join(', ') + ')'
    : undefined;

  return (
    <View
      style={[style, gradient ? { background: gradient } : {}]}
      {...props}
    >
      {children}
    </View>
  );
};

export default LinearGradient;

