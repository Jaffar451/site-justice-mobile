const fs = require('fs');
const path = require('path');

const CONTROLLERS_DIR = path.join(__dirname, 'src/interfaces/controllers');

const fixes = {
  'assignment.controller.ts': {
    imports: ['Assignment', 'CaseModel', 'User'],
    replacements: [
      [/{ model:\s*,\s*attributes:\s*\["id",\s*"reference",\s*"stage"\] }/g, '{ model: CaseModel, attributes: ["id", "reference", "stage"] }'],
      [/{ model:\s*,\s*attributes:\s*\["id",\s*"firstname",\s*"lastname",\s*"role"\] }/g, '{ model: User, attributes: ["id", "firstname", "lastname", "role"] }'],
      [/include:\s*\[\s*{\s*model:\s*}\s*,\s*{\s*model:\s*}\s*\]/g, 'include: [{ model: CaseModel }, { model: User }]']
    ]
  },
  'decision.controller.ts': {
    imports: ['Decision', 'CaseModel'],
    replacements: [
      [/{ model:\s*,\s*attributes:\s*\["id",\s*"status"\] }/g, '{ model: CaseModel, attributes: ["id", "status"] }']
    ]
  },
  'summon.controller.ts': {
    imports: ['Summon', 'Complaint', 'User'],
    replacements: [
      [/{ model:\s*,\s*as:\s*"complaint" }/g, '{ model: Complaint, as: "complaint" }'],
      [/model:\s*,\s*(?!as:)/g, 'model: User, ']
    ]
  },
  'case.controller.ts': {
    imports: ['CaseModel', 'Complaint'],
    replacements: [
      [/include:\s*\[\s*{\s*model:\s*}\s*\]/g, 'include: [{ model: Complaint }]']
    ]
  }
};

Object.entries(fixes).forEach(([filename, { imports, replacements }]) => {
  const filePath = path.join(CONTROLLERS_DIR, filename);
  if (!fs.existsSync(filePath)) { console.warn(`⚠️ ${filename} non trouvé`); return; }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Ajoute les imports si absents
  const importLine = `import { ${imports.join(', ')} } from '../../models';\n`;
  if (!imports.every(imp => content.includes(imp))) {
    content = content.replace(
      /(import\s+\{\s*[^}]+\}\s+from\s+['"]\.\.\/\.\.\/models['"];?\n?)/,
      `import { ${imports.join(', ')} } from '../../models';\n`
    );
  }
  
  // Applique les remplacements
  replacements.forEach(([regex, replacement]) => {
    content = content.replace(regex, replacement);
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ ${filename} corrigé`);
});

console.log('\n🎉 Tous les includes sont corrigés ! Lance `npx tsc --noEmit` pour vérifier.');