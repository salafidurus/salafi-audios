module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],

    plugins: [
      [
        'react-native-unistyles/plugin',
        {
          root: 'src',
          // autoProcessRoot: 'src/app',
          autoProcessImports: ['@/src/shared/components'],
        },
      ],
      'react-native-worklets/plugin',
    ],
  };
};
