const path = require("node:path");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getSentryExpoConfig(projectRoot);

// Monorepo: watch workspace root + expo defaults
config.watchFolders = [workspaceRoot, ...(config.watchFolders ?? [])];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.unstable_enablePackageExports = true;

// Ignore generated native build folders to prevent watcher crashes on Windows
function escapePathForRegex(value) {
  return value.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
}

config.resolver.blockList = [
  new RegExp(
    `${escapePathForRegex(path.join(__dirname, "android", "app", ".cxx"))}[/\\\\].*`,
  ),
  new RegExp(
    `${escapePathForRegex(path.join(__dirname, "android", "app", "build"))}[/\\\\].*`,
  ),
  new RegExp(
    `${escapePathForRegex(path.join(__dirname, "android", ".gradle"))}[/\\\\].*`,
  ),
  new RegExp(
    `${escapePathForRegex(path.join(__dirname, "ios", "build"))}[/\\\\].*`,
  ),
];

module.exports = config;
