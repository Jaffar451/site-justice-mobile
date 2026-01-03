// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Bloquer react-native-maps sur web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Si on est sur web et qu'on essaie d'importer react-native-maps
  if (platform === 'web' && moduleName === 'react-native-maps') {
    // Retourner un module vide
    return {
      type: 'empty',
    };
  }
  
  // Comportement par défaut pour tous les autres cas
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;