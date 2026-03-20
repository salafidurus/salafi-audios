// const { getDefaultConfig } = require("expo/metro-config");
const {getSentryExpoConfig} = require("@sentry/react-native/metro");

// const config = getDefaultConfig(__dirname);
// eslint-disable-next-line no-undef
const config = getSentryExpoConfig(__dirname);

// Add support for .mobile.web.* extensions
config.resolver.sourceExts = [
  'mobile.web.tsx',
  'mobile.web.ts',
  'mobile.web.jsx',
  'mobile.web.js',
  ...config.resolver.sourceExts,
];

module.exports = config;
