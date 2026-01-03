Write-Host "📌 Installation des dépendances..."
npm install

Write-Host "📌 Création des tables via Sequelize..."
npx sequelize-cli db:migrate

Write-Host "✔ Backend prêt."
