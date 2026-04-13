const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Liste des packages à traiter avec Babel (ajustez selon votre projet)
  const packagesToTranspile = [
    /node_modules[\\/]mapbox-gl/,
    /node_modules[\\/]@react-native[\\/]debugger-frontend/,
    // Ajoutez d'autres packages si nécessaire (ex: celui de LaunchDarkly)
    // /node_modules[\\/]launchdarkly-js-client-sdk/,
  ];

  // Modifier les règles de Webpack pour inclure ces packages dans Babel
  config.module.rules.forEach(rule => {
    if (rule.oneOf) {
      rule.oneOf.forEach(oneOfRule => {
        if (oneOfRule.loader && oneOfRule.loader.includes('babel-loader')) {
          if (!oneOfRule.include) oneOfRule.include = [];
          // Convertir l'include existant en tableau si ce n'en est pas un
          let existingInclude = oneOfRule.include;
          if (!Array.isArray(existingInclude)) {
            existingInclude = [existingInclude];
          }
          oneOfRule.include = existingInclude.concat(packagesToTranspile);
        }
      });
    }
  });

  return config;
};