/**
 * Utilitaires pour la gestion des permissions selon les rôles
 */

/**
 * Récupère le rôle de l'utilisateur connecté depuis sessionStorage
 * @returns {string|null} Le rôle de l'utilisateur ou null si non connecté
 */
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

/**
 * Vérifie si l'utilisateur a la permission requise
 * @param {string|string[]} requiredRole - Rôle ou liste de rôles requis
 * @returns {boolean} True si l'utilisateur a la permission
 */
export const hasPermission = (requiredRole) => {
  const userRole = getUserRole();
  
  if (!userRole) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  
  return userRole === requiredRole;
};

/**
 * Vérifie si l'utilisateur est administrateur
 * @returns {boolean} True si l'utilisateur est admin
 */
export const isAdmin = () => {
  return hasPermission('admin');
};

/**
 * Vérifie si l'utilisateur est un utilisateur standard
 * @returns {boolean} True si l'utilisateur est user
 */
export const isUser = () => {
  return hasPermission('user');
};
