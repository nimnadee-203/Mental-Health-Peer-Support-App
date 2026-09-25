const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/**
 * Metro configuration with Expo + web support
 * https://docs.expo.dev/guides/customizing-metro/
 *
 * @type {import('expo/metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname, {
  isCSSEnabled: true,
});

// Add web platform extensions
config.resolver.platforms = ['web', 'ios', 'android', 'native'];

// Alias native-only modules to web shims when bundling for web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    const webShims = {
      'react-native-linear-gradient': path.resolve(
        __dirname,
        'src/shims/react-native-linear-gradient.js',
      ),
      'react-native-sound': path.resolve(
        __dirname,
        'src/shims/react-native-sound.js',
      ),
    };
    if (webShims[moduleName]) {
      return { filePath: webShims[moduleName], type: 'sourceFile' };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
