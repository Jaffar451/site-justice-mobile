const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    if (moduleName === '@react-native/debugger-frontend') return { type: 'empty' };
    if (moduleName === 'react-native-maps') return { type: 'empty' };

    if (moduleName === 'zustand') {
      return { filePath: path.resolve(__dirname, 'node_modules/zustand/umd/index.development.js'), type: 'sourceFile' };
    }
    if (moduleName === 'zustand/react') {
      return { filePath: path.resolve(__dirname, 'node_modules/zustand/umd/react/index.development.js'), type: 'sourceFile' };
    }
    if (moduleName === 'zustand/vanilla') {
      return { filePath: path.resolve(__dirname, 'node_modules/zustand/umd/vanilla.development.js'), type: 'sourceFile' };
    }
    if (moduleName === 'zustand/middleware') {
      return { filePath: path.resolve(__dirname, 'node_modules/zustand/umd/middleware.development.js'), type: 'sourceFile' };
    }
    if (moduleName === 'zustand/traditional') {
      return { filePath: path.resolve(__dirname, 'node_modules/zustand/umd/traditional.development.js'), type: 'sourceFile' };
    }
    if (moduleName === 'zustand/shallow') {
      return { filePath: path.resolve(__dirname, 'node_modules/zustand/umd/shallow.development.js'), type: 'sourceFile' };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

module.exports = config;