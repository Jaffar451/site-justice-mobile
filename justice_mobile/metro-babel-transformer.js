const babelTransformer = require('metro-react-native-babel-transformer');

module.exports.transform = async (props) => {
  // Appliquer la transformation Babel sur les packages problématiques
  const shouldTransform = (
    props.filename.includes('node_modules/mapbox-gl') ||
    props.filename.includes('node_modules/@react-native/debugger-frontend')
    // Ajoutez d'autres packages si nécessaire
  );

  if (shouldTransform) {
    // Force l'application de Babel (y compris le plugin transform-import-meta)
    return babelTransformer.transform(props);
  } else {
    // Pour les autres fichiers, comportement par défaut
    return babelTransformer.transform(props);
  }
};