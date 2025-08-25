# Guide de déploiement sur LWS

Ce document explique comment déployer l'application User Management Frontend sur l'hébergeur LWS.

## Prérequis

- Un compte d'hébergement LWS avec Node.js supporté
- Accès SSH ou FTP à votre hébergement
- Node.js 18+ installé sur votre machine locale

## Étapes de déploiement

### 1. Préparation du build

Sur votre machine locale, préparez le build de production :

```bash
# Installer les dépendances
npm install

# Créer le build de production
npm run build
```

### 2. Configuration des variables d'environnement

Modifiez le fichier `.env.production` pour définir l'URL de votre API backend :

```
NEXT_PUBLIC_API_URL=https://votre-api-production.lws.fr
NODE_ENV=production
```

### 3. Transfert des fichiers

Transférez les fichiers suivants vers votre hébergement LWS via FTP ou SSH :

- Dossier `.next/` (contient le build de production)
- Dossier `public/` (contient les assets statiques)
- Fichier `package.json`
- Fichier `.env.production` (renommez-le en `.env.local` sur le serveur)
- Fichier `next.config.js`

### 4. Installation des dépendances sur le serveur

Connectez-vous à votre serveur via SSH et exécutez :

```bash
npm install --production
```

### 5. Configuration du serveur LWS

#### Option 1 : Utilisation de Node.js

Si votre hébergement LWS supporte l'exécution de processus Node.js :

1. Configurez le point d'entrée pour exécuter :
   ```bash
   npm start
   ```
   
2. Assurez-vous que le port configuré correspond à celui attendu par LWS (généralement le port 3000)

#### Option 2 : Utilisation d'un serveur web statique

Si vous ne pouvez pas exécuter de processus Node.js sur LWS :

1. Exécutez localement la commande suivante pour générer une version statique :
   ```bash
   npx next export
   ```

2. Transférez le contenu du dossier `out/` généré vers la racine de votre hébergement

### 6. Configuration du domaine

Dans le panneau d'administration LWS :

1. Associez votre domaine au répertoire où vous avez déployé l'application
2. Configurez les redirections pour que toutes les routes soient gérées par Next.js

### 7. Vérification du déploiement

Accédez à votre domaine pour vérifier que l'application fonctionne correctement.

## Dépannage

### Problèmes de connexion à l'API

Vérifiez que :
- L'URL de l'API dans `.env.local` est correcte
- Les CORS sont correctement configurés sur votre API
- Le pare-feu de LWS autorise les connexions sortantes vers votre API

### Problèmes de routage

Si certaines routes ne fonctionnent pas :

1. Vérifiez la configuration de redirection dans le panneau LWS
2. Assurez-vous que toutes les requêtes sont redirigées vers le point d'entrée de Next.js

## Mise à jour de l'application

Pour mettre à jour l'application déployée :

1. Effectuez vos modifications localement
2. Générez un nouveau build avec `npm run build`
3. Transférez les fichiers mis à jour vers le serveur
4. Redémarrez le processus Node.js si nécessaire