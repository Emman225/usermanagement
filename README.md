# Application de Gestion des Utilisateurs - Frontend

Ce projet est une application frontend de gestion des utilisateurs développée avec React et Next.js. Il fournit une interface utilisateur moderne et réactive pour gérer les utilisateurs, les rôles et les autorisations.

## Technologies utilisées

- **React 19** - Bibliothèque JavaScript pour construire des interfaces utilisateur
- **Next.js 15** - Framework React pour le développement d'applications web
- **TypeScript** - Superset JavaScript typé
- **Tailwind CSS** - Framework CSS utilitaire
- **Axios** - Client HTTP pour les requêtes API
- **TanStack React Table** - Bibliothèque pour la gestion des tableaux de données
- **SweetAlert2** - Bibliothèque pour les alertes et notifications
- **XLSX & jsPDF** - Bibliothèques pour l'export de données

## Prérequis

- Node.js (version recommandée : 18.x ou supérieure)
- npm ou yarn

### Configuration de l'Environnement

1. **Copiez le fichier d'exemple d'environnement :**
   ```bash
   cp .env.example .env.local
   ```

2. **Configurez les variables d'environnement dans `.env.local` :**
   ```env
   # URL de l'API backend (requise)
   NEXT_PUBLIC_API_URL=http://localhost:8283
   
   # Environnement (développement/production)
   NODE_ENV=development
   ```

3. **Variables d'environnement disponibles :**
   - `NEXT_PUBLIC_API_URL` (requise) : URL de l'API backend
   - `NODE_ENV` : Environnement d'exécution (development/production)

### Installation et Lancement

```bash
# Installer les dépendances
npm install
# ou
yarn install

# Lancer l'application en mode développement
npm run dev
# ou
yarn dev
```

L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000).

### Construire l'application pour la production

```bash
npm run build
# ou
yarn build
```

### Démarrer l'application en mode production

```bash
npm run start
# ou
yarn start
```

## Structure du projet

### Architecture des dossiers

```
├── .next/               # Dossier de build Next.js (généré)
├── public/              # Fichiers statiques accessibles publiquement
├── src/                 # Code source de l'application
│   ├── app/             # Pages et routes de l'application (App Router)
│   │   ├── dashboard/   # Pages du tableau de bord
│   │   ├── login/       # Page de connexion
│   │   ├── users/       # Pages de gestion des utilisateurs
│   │   ├── globals.css  # Styles globaux
│   │   ├── layout.tsx   # Layout principal de l'application
│   │   └── page.tsx     # Page d'accueil
│   ├── components/      # Composants réutilisables
│   │   ├── ui/          # Composants d'interface utilisateur
│   │   ├── DataTable.tsx # Composant de tableau de données
│   │   ├── Footer.tsx   # Pied de page
│   │   ├── Header.tsx   # En-tête
│   │   ├── LogsPanel.tsx # Panneau de journalisation
│   │   ├── ProtectedRoute.jsx # Route protégée par authentification
│   │   ├── RoleFilter.jsx # Filtre par rôle
│   │   ├── Sidebar.tsx  # Barre latérale
│   │   └── StatusFilter.jsx # Filtre par statut
│   └── utils/           # Utilitaires et fonctions d'aide
│       ├── env.ts       # Configuration des variables d'environnement
│       ├── roleCheck.js # Vérification des rôles
│       └── testLogin.js # Fonctions de test de connexion
├── .env.example         # Exemple de fichier de variables d'environnement
├── .env.local           # Variables d'environnement locales (à créer)
├── next.config.js       # Configuration de Next.js
├── package.json         # Dépendances et scripts npm
└── tsconfig.json        # Configuration TypeScript
```

### Fichiers de configuration principaux

- **next.config.js** : Configuration de Next.js, incluant les patterns d'images distantes
- **package.json** : Dépendances et scripts npm
- **tsconfig.json** : Configuration TypeScript
- **.env.local** : Variables d'environnement (à créer à partir de .env.example)

## 🔧 Configuration

### Variables d'Environnement

L'application utilise un système centralisé de gestion des variables d'environnement via `src/utils/env.ts`. 

**Variables requises :**
- `NEXT_PUBLIC_API_URL` : URL complète de l'API backend

**Utilisation dans le code :**
```typescript
import { env, getApiUrl } from '@/utils/env';

// Accès direct
const apiUrl = env.apiUrl;

// Construction d'URL API
const usersUrl = getApiUrl('/users');
const loginUrl = getApiUrl('login');
```

## 🚨 Dépannage

### Erreurs de Variables d'Environnement

Si vous rencontrez des erreurs concernant les variables d'environnement :

1. Vérifiez que le fichier `.env.local` existe
2. Vérifiez que `NEXT_PUBLIC_API_URL` est correctement définie
3. Redémarrez le serveur de développement après toute modification

### Erreurs de Connexion API

- Vérifiez que l'API backend est accessible à l'URL configurée
- Vérifiez les logs du navigateur pour les erreurs CORS

## 📚 Documentation Technique

- [Next.js Documentation](https://nextjs.org/docs) - Documentation officielle Next.js
- [React Documentation](https://react.dev) - Documentation React
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS utilitaire

## 🚀 Déploiement

### Sur Vercel (Recommandé)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

1. Connectez votre repository GitHub
2. Configurez les variables d'environnement dans le dashboard Vercel
3. Déployez automatiquement à chaque push

### Autres Plateformes

Consultez la [documentation de déploiement Next.js](https://nextjs.org/docs/app/building-your-application/deploying) pour plus de détails.

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
