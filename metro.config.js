const { getDefaultConfig } = require('expo/metro-config');

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

module.exports = config;
