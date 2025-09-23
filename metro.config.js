const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add crypto polyfill resolver configuration
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.alias = {
  ...config.resolver.alias,
  crypto: 'expo-crypto',
};

// Exclude react-native-maps from web builds
config.resolver.blockList = [/react-native-maps/];

module.exports = withNativeWind(config, { input: './global.css' });
