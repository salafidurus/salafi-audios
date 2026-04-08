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
            "@sd/feature-live",
            "@sd/core-styles",
          ],
          autoProcessPaths: [
            path.resolve(__dirname, "../../packages/shared/src"),
            path.resolve(__dirname, "../../packages/feature-live/src"),
            path.resolve(__dirname, "../../packages/core-styles/src"),
          ],
        },
      ],
      "react-native-worklets/plugin",
    ],
  };
};
