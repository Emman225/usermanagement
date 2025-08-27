# Explication du Code - User Management Frontend

Ce document explique les principales fonctions utilisées dans les composants et la gestion de l'affichage conditionnel selon les rôles d'utilisateur dans l'application User Management Frontend.

## 1. Fonctions de Gestion des Rôles et Utilitaires

Le fichier `src/utils/roleCheck.js` contient plusieurs fonctions utilitaires pour gérer les permissions selon les rôles des utilisateurs :

### `getUserRole()`

```javascript
export const getUserRole = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = sessionStorage.getItem('user');
    if (!userData) return null;
    
    const user = JSON.parse(userData);
    return user.role || null;
  } catch (error) {
    console.error('Erreur lors de la récupération du rôle:', error);
    return null;
  }
};
```

Cette fonction récupère le rôle de l'utilisateur connecté depuis le `sessionStorage`. Elle :
- Vérifie si le code s'exécute côté client (`typeof window === 'undefined'`)
- Récupère les données utilisateur du `sessionStorage`
- Parse les données JSON et retourne le rôle de l'utilisateur
- Gère les erreurs et retourne `null` en cas de problème

### `hasPermission(requiredRole)`

```javascript
export const hasPermission = (requiredRole) => {
  const userRole = getUserRole();
  
  if (!userRole) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  
  return userRole === requiredRole;
};
```

Cette fonction vérifie si l'utilisateur a la permission requise :
- Récupère le rôle de l'utilisateur avec `getUserRole()`
- Si aucun rôle n'est trouvé, retourne `false`
- Si `requiredRole` est un tableau, vérifie si le rôle de l'utilisateur est inclus dans ce tableau
- Sinon, compare directement le rôle de l'utilisateur avec le rôle requis

### `isAdmin()` et `isUser()`

```javascript
export const isAdmin = () => {
  return hasPermission('admin');
};

export const isUser = () => {
  return hasPermission('user');
};
```

Ces fonctions sont des raccourcis pour vérifier si l'utilisateur est un administrateur ou un utilisateur standard.

## 2. Gestion de l'Affichage Conditionnel selon les Rôles

### Sidebar - Affichage conditionnel des éléments de menu

Dans le composant `Sidebar.tsx`, l'affichage des éléments du menu est conditionné par le rôle de l'utilisateur :

```javascript
const menuData = [
  {
    title: "Dashboard",
    icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path d='M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8v-10h-8v10zm0-18v6h8V3h-8z'/></svg>",
    link: "/dashboard",
  },
  {
    title: "Journal",
    icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'/></svg>",
    link: "/dashboard/logs",
    requiredRole: "admin"
  },
];
```

Le rendu des éléments du menu est filtré selon le rôle de l'utilisateur :

```javascript
{menuData.map((item, idx) => {
  // Vérifier si l'utilisateur a la permission d'accéder à ce menu
  const hasAccess = !item.requiredRole || hasPermission(item.requiredRole);
  
  if (!hasAccess) return null;
  
  return (
    <li key={idx}>
      {/* Rendu de l'élément de menu */}
    </li>
  );
})}
```

La logique est simple :
- Si l'élément de menu n'a pas de `requiredRole`, il est accessible à tous les utilisateurs
- Si l'élément a un `requiredRole`, la fonction `hasPermission()` vérifie si l'utilisateur a le rôle requis
- Si l'utilisateur n'a pas accès, l'élément n'est pas rendu (`return null`)

### Dashboard - Affichage conditionnel des actions

Dans le composant `dashboard/page.jsx`, le menu d'actions (voir, modifier, supprimer) est conditionné par le rôle de l'utilisateur :

```javascript
const ActionsMenu = ({ onView, onEdit, onDelete, userRole }) => {
  // ...
  const isAdmin = userRole === 'admin';

  return (
    <div className="relative" ref={menuRef}>
      {isAdmin && (
        <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => setOpen((o) => !o)}>
          <MoreVertical size={20} />
        </button>
      )}
      {open && isAdmin && (
        <div className="absolute right-0 mt-2 w-36 bg-white border rounded-lg shadow-lg z-10">
          {/* Boutons d'action */}
        </div>
      )}
    </div>
  );
};
```

La logique ici :
- Le bouton d'actions et le menu déroulant ne sont rendus que si `isAdmin` est `true`
- Les utilisateurs standards ne voient pas ces options

### ProtectedRoute - Protection des routes

Le composant `ProtectedRoute.jsx` protège les routes contre les accès non autorisés :

```javascript
export default function ProtectedRoute({ children }) {
  // ...
  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem("token");
      
      if (!token) {
        console.error("❌ Aucun token trouvé - Redirection vers login");
        router.push("/login");
        return false;
      }
      
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    };

    checkAuth();
  }, [router]);
  // ...
}
```

Ce composant :
- Vérifie si un token d'authentification existe dans le `sessionStorage`
- Si aucun token n'est trouvé, redirige l'utilisateur vers la page de connexion
- Affiche un indicateur de chargement pendant la vérification
- Rend les composants enfants uniquement si l'utilisateur est authentifié

## 3. Fonctions Utilitaires et de Formatage

### Fonctions de Formatage dans le Dashboard

```javascript
// 🔹 Badges pour le statut actif/inactif 
const statutBadge = (active) => {
  const base = "px-3 py-1 rounded-full text-xs font-semibold";
  const styles = {
    1: "bg-green-100 text-green-700",
    0: "bg-red-100 text-red-700",
  };
  const text = active === 1 ? "Actif" : "Inactif";
  return <span className={`${base} ${styles[active] || "bg-gray-100 text-gray-700"}`}>{text}</span>;
};

// 🔹 Badges pour les rôles
const roleBadge = (role) => {
  const base = "px-3 py-1 rounded-full text-xs font-semibold";
  const styles = {
    'admin': "bg-purple-100 text-purple-700",
    'user': "bg-blue-100 text-blue-700",
  };
  return <span className={`${base} ${styles[role] || "bg-gray-100 text-gray-700"}`}>{role}</span>;
};

// Fonction pour obtenir les initiales d'un nom
const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
```

Ces fonctions utilitaires servent à formater l'affichage des données dans le tableau de bord :

- `statutBadge` : Crée un badge coloré pour indiquer si un utilisateur est actif (vert) ou inactif (rouge)
- `roleBadge` : Crée un badge coloré pour indiquer le rôle de l'utilisateur (violet pour admin, bleu pour user)
- `getInitials` : Extrait les initiales d'un nom complet pour les afficher dans un avatar lorsqu'aucune photo de profil n'est disponible

### Fonctions de Gestion des Utilisateurs dans le Dashboard

```javascript
// Chargement des utilisateurs depuis l'API
useEffect(() => {
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("token");
      const apiUrl = getApiUrl();
      
      if (!token) {
        console.error("❌ Aucun token trouvé dans sessionStorage - Redirection vers login");
        router.push("/login");
        return;
      }

      const response = await axios.get(getApiUrl('/users'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      // Traitement des données selon la structure de réponse
      if (response.data && response.data.status === true && Array.isArray(response.data.data)) {
        setUsers(response.data.data);
      } else if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement des utilisateurs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchUsers();
}, [searchTerm, router]);

// Fonction pour supprimer un utilisateur
const handleDeleteUser = async (userId, userName) => {
  try {
    const token = sessionStorage.getItem("token");
    
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Voulez-vous vraiment supprimer l'utilisateur "${userName}" ? Cette action est irréversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      const response = await axios.delete(getApiUrl(`/users/${userId}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.data.status) {
        Swal.fire({
          icon: 'success',
          title: 'Supprimé !',
          text: response.data.message || "L'utilisateur a été supprimé avec succès.",
        });
        
        // Rechargement de la liste des utilisateurs
        const fetchResponse = await axios.get(getApiUrl('/users'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (fetchResponse.data && fetchResponse.data.status === true && Array.isArray(fetchResponse.data.data)) {
          setUsers(fetchResponse.data.data);
        } else if (fetchResponse.data && Array.isArray(fetchResponse.data)) {
          setUsers(fetchResponse.data);
        }
      }
    }
  } catch (error) {
    console.error("❌ Erreur lors de la suppression:", error);
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: error.response?.data?.message || "Une erreur est survenue lors de la suppression."
    });
  }
};
```

Ces fonctions gèrent les opérations CRUD sur les utilisateurs :

- `fetchUsers` : Récupère la liste des utilisateurs depuis l'API
- `handleDeleteUser` : Supprime un utilisateur après confirmation de l'utilisateur

Notez que ces fonctions ne sont accessibles qu'aux administrateurs grâce à l'affichage conditionnel des boutons d'action.

### Fonctions d'Export dans DataTable

Le composant DataTable inclut plusieurs fonctions pour exporter les données :

```javascript
/** 🔽 Export CSV */
const handleExportCSV = () => {
  const csv = Papa.unparse(filteredRows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${exportFileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/** 🔽 Export Excel */
const handleExportExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(filteredRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, exportSheetName);
  XLSX.writeFile(workbook, `${exportFileName}.xlsx`);
};

/** 🔽 Export PDF */
const handleExportPDF = () => {
  const doc = new jsPDF();
  doc.text(`Liste des ${exportSheetName}`, 14, 16);
  
  // Filtrer les colonnes pour exclure "Actions"
  const exportColumns = columns.filter(col => col.id !== "actions");
  // ...
};
```

Ces fonctions permettent d'exporter les données du tableau dans différents formats (CSV, Excel, PDF) pour faciliter le partage et l'analyse des données.

## 4. Composants d'Interface Utilisateur

### Header - Gestion du Profil Utilisateur

Le composant `Header.tsx` gère l'affichage des informations de l'utilisateur connecté et les fonctionnalités de déconnexion :

```javascript
export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("Utilisateur");
  const [profilePhoto, setProfilePhoto] = useState("/profile.png");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Récupérer les informations de l'utilisateur connecté depuis le sessionStorage
    const getUserInfo = () => {
      try {
        const userData = sessionStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user.name || "Utilisateur");
          setProfilePhoto(user.profile_photo_url || "/profile.png");
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des informations utilisateur:', error);
      }
    };

    getUserInfo();
  }, []);

  const handleLogout = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token");
      
      const response = await fetch(getApiUrl(`/logout`), {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });

      const data = await response.json();
      
      if (data.status === true) {
        console.log("Déconnexion réussie:", data.message);
      } else {
        console.error("Erreur lors de la déconnexion:", data.message);
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    } finally {
      // Nettoyer le stockage local et rediriger dans tous les cas
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      router.push("/login");
    }
  };
}
```

Ce composant :
- Récupère les informations de l'utilisateur connecté depuis le `sessionStorage`
- Affiche le nom et la photo de profil de l'utilisateur
- Gère la déconnexion de l'utilisateur

Le Header est affiché pour tous les utilisateurs authentifiés, indépendamment de leur rôle, mais les informations affichées (nom, photo) sont spécifiques à l'utilisateur connecté.

## 5. Résumé de la Gestion des Rôles

L'application implémente un système de contrôle d'accès basé sur les rôles (RBAC) avec deux niveaux principaux :

1. **Administrateur (admin)** : Accès complet à toutes les fonctionnalités
   - Peut voir, créer, modifier et supprimer des utilisateurs
   - A accès à toutes les pages, y compris le journal des activités

2. **Utilisateur standard (user)** : Accès en lecture seule
   - Peut voir le tableau de bord
   - Ne peut pas modifier ou supprimer des utilisateurs
   - N'a pas accès au journal des activités

La gestion des rôles est implémentée à plusieurs niveaux :

- **Niveau des composants UI** : Affichage conditionnel des éléments d'interface selon le rôle
- **Niveau de la navigation** : Filtrage des éléments du menu selon le rôle
- **Niveau des actions** : Restriction des actions (modifier, supprimer) selon le rôle
- **Niveau des routes** : Protection des routes contre les accès non autorisés

Cette approche multicouche assure une sécurité robuste tout en offrant une expérience utilisateur adaptée au niveau de permission de chaque utilisateur.