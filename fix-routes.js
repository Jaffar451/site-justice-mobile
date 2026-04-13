const fs = require('fs');
const path = require('path');

const ROUTES_DIR = path.join(__dirname, 'src/interfaces/routes');

// Fonction pour convertir user.routes.ts → user.controller
const routeToController = (routeFile) => {
  return routeFile.replace('.routes.ts', '.controller');
};

fs.readdirSync(ROUTES_DIR).forEach(file => {
  if (!file.endsWith('.routes.ts')) return;
  
  const filePath = path.join(ROUTES_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  const controllerName = routeToController(file);
  
  // Remplace l'import '../controllers' par '../controllers/nom.controller'
  // Gère à la fois import { ... } from et import * as from
  content = content.replace(
    /(from\s+['"]\.\.\/controllers['"])/g,
    `from '../controllers/${controllerName}'`
  );
  
  // Si le remplacement n'a rien fait, on essaie avec un chemin relatif plus explicite
  if (!content.includes(`from '../controllers/${controllerName}'`)) {
    content = content.replace(
      /(require\(\s*['"]\.\.\/controllers['"]\s*\))/g,
      `require('../controllers/${controllerName}')`
    );
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ ${file} → import '../controllers/${controllerName}'`);
});

console.log('\n🎉 Tous les imports de routes sont corrigés !');
console.log('🚀 Lance `npm run dev` pour tester.');