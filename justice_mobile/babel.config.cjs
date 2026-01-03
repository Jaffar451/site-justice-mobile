module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
          },
        },
      ],
      // ✅ Reanimated doit toujours être en dernier
      'react-native-reanimated/plugin',
    ],
  };
};