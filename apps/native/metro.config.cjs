// const path = require("node:path");
// const { getSentryExpoConfig } = require("@sentry/react-native/metro");

// const projectRoot = __dirname;
// const workspaceRoot = path.resolve(projectRoot, "../..");

// const config = getSentryExpoConfig(projectRoot);

// pnpm symlinks workspace packages into local node_modules — Metro follows
// symlinks automatically, so explicit watchFolders are not needed and cause
// FallbackWatcher crashes on Windows when walking broken symlinks.
// config.resolver.nodeModulesPaths = [
//   path.resolve(projectRoot, "node_modules"),
//   path.resolve(workspaceRoot, "node_modules"),
// ];
// config.resolver.unstable_enablePackageExports = true;

// Ignore generated native build folders to prevent watcher crashes on Windows
// Also block other monorepo app directories — Metro follows symlinks and would
// otherwise crawl into apps/api/dist, apps/web/.next, etc.
// function escapePathForRegex(value) {
//   return value.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
// }

// config.resolver.blockList = [
//   // Android build artifacts
//   new RegExp(
//     `${escapePathForRegex(path.join(__dirname, "android", "app", ".cxx"))}[/\\\\].*`,
//   ),
//   new RegExp(
//     `${escapePathForRegex(path.join(__dirname, "android", "app", "build"))}[/\\\\].*`,
//   ),
//   new RegExp(
//     `${escapePathForRegex(path.join(__dirname, "android", ".gradle"))}[/\\\\].*`,
//   ),
//   new RegExp(
//     `${escapePathForRegex(path.join(__dirname, "ios", "build"))}[/\\\\].*`,
//   ),
//   // Other monorepo apps — Metro must not crawl into api/web/mobile via symlinks
//   new RegExp(
//     `${escapePathForRegex(path.join(workspaceRoot, "apps", "api"))}[/\\\\].*`,
//   ),
//   new RegExp(
//     `${escapePathForRegex(path.join(workspaceRoot, "apps", "web"))}[/\\\\].*`,
//   ),
//   new RegExp(
//     `${escapePathForRegex(path.join(workspaceRoot, "apps", "mobile"))}[/\\\\].*`,
//   ),
// ];

// module.exports = config;

// const { getDefaultConfig } = require("expo/metro-config");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");
// const config = getDefaultConfig(__dirname);
// eslint-disable-next-line no-undef
const config = getSentryExpoConfig(__dirname);
module.exports = config;
