const path = require("node:path");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

// const config = getDefaultConfig(__dirname);
// eslint-disable-next-line no-undef
const config = getSentryExpoConfig(__dirname);

// Ignore generated native build folders. On Windows, Metro's fallback watcher can crash
// while traversing deeply nested CMake/autolink output under android/app/.cxx.
config.resolver.blockList = [
  new RegExp(`${escapePathForRegex(path.join(__dirname, "android", "app", ".cxx"))}[/\\\\].*`),
  new RegExp(`${escapePathForRegex(path.join(__dirname, "android", "app", "build"))}[/\\\\].*`),
  new RegExp(`${escapePathForRegex(path.join(__dirname, "android", ".gradle"))}[/\\\\].*`),
  new RegExp(`${escapePathForRegex(path.join(__dirname, "ios", "build"))}[/\\\\].*`),
];

module.exports = config;

function escapePathForRegex(value) {
  return value.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
}
