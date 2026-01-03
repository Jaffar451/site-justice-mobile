# Script d'installation et de configuration (Setup)
Write-Host "🚀 Démarrage de l'installation des dépendances et de la configuration..." -ForegroundColor Cyan

# 1. Recréation du fichier .env (Supprimé lors du reset)
Write-Host "📝 Génération du fichier .env..."
$envContent = @"
PORT=4000
NODE_ENV=development

# Database Configuration
DB_USER=postgres
DB_PASSWORD=password123
DB_NAME=justice_pro
DB_HOST=localhost
DB_PORT=5432
CORS_ORIGIN=*,http://localhost:19006

# PgAdmin Configuration
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=root
"@

Set-Content -Path ".\.env" -Value $envContent -Encoding UTF8

# 2. Création du fichier tsconfig.json (Configuration TypeScript)
Write-Host "VX Génération du fichier tsconfig.json..."
$tsconfigContent = @"
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "rootDir": "./src",
    "moduleResolution": "node",
    "outDir": "./dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  },
  "ignoreDeprecations": "6.0",
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
"@
Set-Content -Path ".\tsconfig.json" -Value $tsconfigContent -Encoding UTF8

# 3. Installation des paquets Node.js
Write-Host "📦 Installation des dépendances (npm install)..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "✅ Installation terminée avec succès !" -ForegroundColor Green
Write-Host "👉 Vous pouvez maintenant lancer : docker-compose up -d" -ForegroundColor Yellow