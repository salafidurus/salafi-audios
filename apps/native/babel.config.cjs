module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: { "@": "./src" },
          extensions: [".native.tsx", ".native.ts", ".tsx", ".ts", ".native.js", ".js"],
        },
      ],
      [
        "react-native-unistyles/plugin",
        {
          root: "src",
        },
      ],
      "react-native-worklets/plugin",
    ],
  };
};
