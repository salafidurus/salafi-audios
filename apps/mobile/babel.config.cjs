const path = require("node:path");

module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],

    plugins: [
      [
        "react-native-unistyles/plugin",
        {
          root: "src",
          autoProcessImports: [
            "@sd/shared",
            "@sd/feature-auth",
            "@sd/feature-navigation",
            "@sd/feature-search",
            "@sd/feature-account",
            "@sd/feature-feed",
            "@sd/feature-legal",
            "@sd/feature-library",
            "@sd/feature-live",
            "@sd/feature-support",
            "@sd/core-styles",
          ],
          autoProcessPaths: [
            path.resolve(__dirname, "../../packages/shared/src"),
            path.resolve(__dirname, "../../packages/feature-auth/src"),
            path.resolve(__dirname, "../../packages/feature-navigation/src"),
            path.resolve(__dirname, "../../packages/feature-search/src"),
            path.resolve(__dirname, "../../packages/feature-account/src"),
            path.resolve(__dirname, "../../packages/feature-feed/src"),
            path.resolve(__dirname, "../../packages/feature-legal/src"),
            path.resolve(__dirname, "../../packages/feature-library/src"),
            path.resolve(__dirname, "../../packages/feature-live/src"),
            path.resolve(__dirname, "../../packages/feature-support/src"),
            path.resolve(__dirname, "../../packages/core-styles/src"),
          ],
        },
      ],
      "react-native-worklets/plugin",
    ],
  };
};
