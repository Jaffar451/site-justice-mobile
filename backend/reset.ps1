# Script de réinitialisation complète (Hard Reset)
Write-Host "☢️  ATTENTION : DÉBUT DU NETTOYAGE COMPLET DU BACKEND ☢️" -ForegroundColor Red
Write-Host "Ce script va supprimer :"
Write-Host " - Tous les conteneurs et volumes Docker (Données perdues)"
Write-Host " - Le dossier node_modules et dist"
Write-Host " - Le fichier .env (Configuration)"
Write-Host ""

# 1. Docker : Arrêt et nettoyage profond
Write-Host "🐳 Nettoyage Docker..." -ForegroundColor Cyan
# -v : supprime les volumes (la BDD)
# --rmi local : supprime les images construites par le docker-compose
# --remove-orphans : supprime les conteneurs orphelins
docker-compose down -v --rmi local --remove-orphans

# 2. Suppression des fichiers locaux
Write-Host "🗑️  Suppression des fichiers de configuration et dépendances..." -ForegroundColor Cyan
$itemsToRemove = @("node_modules", "dist", ".env", "package-lock.json")

foreach ($item in $itemsToRemove) {
    if (Test-Path $item) {
        Write-Host "   - Suppression de $item"
        Remove-Item -Path $item -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "✨ Environnement remis à zéro. Vous pouvez maintenant recréer votre .env et lancer 'npm install'." -ForegroundColor Green
