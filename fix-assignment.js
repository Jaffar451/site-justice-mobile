const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/interfaces/controllers/assignment.controller.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Ajoute les imports si absents
if (!content.includes('import {') || !content.includes('Case') || !content.includes('User')) {
  const importLine = "import { Assignment, Case, User } from '../../models';\n";
  if (!content.includes("import { Assignment, Case, User }")) {
    content = content.replace(
      /(import\s+\{\s*Assignment\s*\}\s+from\s+['"]\.\.\/\.\.\/models['"];?\n?)/,
      `import { Assignment, Case, User } from '../../models';\n`
    );
  }
}

// 2. Corrige les includes vides
content = content
  .replace(/{ model:\s*,\s*attributes:\s*\["id",\s*"reference",\s*"stage"\] }/g, 
           '{ model: Case, attributes: ["id", "reference", "stage"] }')
  .replace(/{ model:\s*,\s*attributes:\s*\["id",\s*"firstname",\s*"lastname",\s*"role"\] }/g, 
           '{ model: User, attributes: ["id", "firstname", "lastname", "role"] }')
  .replace(/include:\s*\[\s*{\s*model:\s*}\s*,\s*{\s*model:\s*}\s*\]/g, 
           'include: [{ model: Case }, { model: User }]');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ assignment.controller.ts corrigé');