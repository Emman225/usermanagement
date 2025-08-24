/**
 * Utilitaire de gestion des variables d'environnement
 * Fournit un accès centralisé et validé aux variables d'environnement
 */

// Configuration des variables d'environnement requises
const requiredEnvVars = ['NEXT_PUBLIC_API_URL'] as const;

// Types pour les variables d'environnement
export interface EnvironmentConfig {
  apiUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

// Validation des variables d'environnement
const validateEnvironment = (): void => {
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Variables d'environnement manquantes: ${missingVars.join(', ')}. ` +
      `Veuillez les définir dans votre fichier .env.local`
    );
  }
};

// Configuration d'environnement
export const env: EnvironmentConfig = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Valider l'environnement au chargement (uniquement côté serveur)
if (typeof window === 'undefined') {
  validateEnvironment();
}

// Fonction utilitaire pour obtenir l'URL de l'API avec un chemin optionnel
export const getApiUrl = (path: string = ''): string => {
  const baseUrl = env.apiUrl.replace(/\/$/, ''); // Supprimer le slash final
  // Vérifier si l'URL de base est correcte
  console.log("Base URL de l'API:", baseUrl);
  
  // Si le chemin est vide, retourner simplement l'URL de base
  if (!path) return baseUrl;
  
  const normalizedPath = path.replace(/^\//, ''); // Supprimer le slash initial
  return `${baseUrl}/${normalizedPath}`;
};

// Fonction pour vérifier si une variable d'environnement existe
export const hasEnvVar = (varName: string): boolean => {
  return !!process.env[varName];
};

// Fonction pour obtenir une variable d'environnement avec une valeur par défaut
export const getEnvVar = (varName: string, defaultValue: string = ''): string => {
  return process.env[varName] || defaultValue;
};
