module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'babel-plugin-transform-import-meta',
      ['module-resolver', { root: ['./'], alias: { '@': './src' } }],
    ],
    overrides: [
      {
        // Appliquer la transformation import.meta aux node_modules Expo
        include: /node_modules\/(expo|@expo)\/.*/,
        plugins: ['babel-plugin-transform-import-meta'],
      },
    ],
  };
};