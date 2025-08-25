# Script de déploiement pour LWS
# Ce script prépare les fichiers pour le déploiement sur l'hébergeur LWS

# Définir le répertoire de sortie pour les fichiers de déploiement
$deployDir = "./deploy-lws"

# Créer le répertoire de déploiement s'il n'existe pas
if (!(Test-Path -Path $deployDir)) {
    New-Item -ItemType Directory -Path $deployDir | Out-Null
    Write-Host "Répertoire de déploiement créé: $deployDir" -ForegroundColor Green
}

# Nettoyer le répertoire de déploiement
Get-ChildItem -Path $deployDir -Recurse | Remove-Item -Force -Recurse
Write-Host "Répertoire de déploiement nettoyé" -ForegroundColor Green

# Installer les dépendances
Write-Host "Installation des dépendances..." -ForegroundColor Yellow
npm install

# Créer le build de production
Write-Host "Création du build de production..." -ForegroundColor Yellow
npm run build

# Copier les fichiers nécessaires pour le déploiement
Write-Host "Copie des fichiers pour le déploiement..." -ForegroundColor Yellow

# Copier le dossier .next
Copy-Item -Path "./.next" -Destination "$deployDir/.next" -Recurse

# Copier le dossier public
Copy-Item -Path "./public" -Destination "$deployDir/public" -Recurse

# Copier les fichiers de configuration
Copy-Item -Path "./package.json" -Destination "$deployDir/package.json"
Copy-Item -Path "./next.config.js" -Destination "$deployDir/next.config.js"

# Copier le fichier .env.production et le renommer en .env.local
Copy-Item -Path "./.env.production" -Destination "$deployDir/.env.local"

# Créer un fichier README pour le déploiement
$readmeContent = @"
# Déploiement sur LWS

Ce dossier contient tous les fichiers nécessaires pour déployer l'application sur l'hébergeur LWS.

## Instructions

1. Transférez tous ces fichiers vers votre hébergement LWS via FTP ou SSH
2. Connectez-vous à votre serveur via SSH
3. Exécutez la commande: npm install --production
4. Démarrez l'application avec: npm start

Pour plus de détails, consultez le fichier DEPLOYMENT.md dans le répertoire principal du projet.
"@

Set-Content -Path "$deployDir/README.md" -Value $readmeContent

# Créer un package ZIP pour faciliter le transfert
$zipFile = "./deploy-lws.zip"
if (Test-Path -Path $zipFile) {
    Remove-Item -Path $zipFile -Force
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($deployDir, $zipFile)

Write-Host "Préparation du déploiement terminée!" -ForegroundColor Green
Write-Host "Les fichiers sont prêts dans le répertoire: $deployDir" -ForegroundColor Green
Write-Host "Un fichier ZIP a également été créé: $zipFile" -ForegroundColor Green
Write-Host "Suivez les instructions dans DEPLOYMENT.md pour finaliser le déploiement sur LWS." -ForegroundColor Yellow