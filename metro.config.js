const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  App: require.resolve('./src/App.js'),
};

module.exports = config;