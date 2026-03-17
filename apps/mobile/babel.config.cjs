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
          autoProcessImports: ["@sd/ui-mobile"],
          autoProcessPaths: [path.resolve(__dirname, "../../packages/ui-mobile/src")],
        },
      ],
      "react-native-worklets/plugin",
    ],
  };
};
