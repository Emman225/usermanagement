# Demande d'implémentation de la pagination API

## Objet
Implémentation de la pagination côté serveur pour l'endpoint `/users`

## Contexte
L'application frontend de gestion des utilisateurs nécessite une pagination efficace pour gérer un grand nombre d'utilisateurs. Actuellement, l'API retourne tous les utilisateurs en une seule requête, ce qui peut causer des problèmes de performance avec un grand volume de données.

## Besoins fonctionnels

### Paramètres de requête à supporter
- `page` (number): Numéro de la page demandée (défaut: 1)
- `pageSize` (number): Nombre d'éléments par page (défaut: 10, max: 100)
- `sortBy` (string): Champ de tri (optionnel)
- `sortOrder` (string): Ordre de tri ('asc' ou 'desc', optionnel)

### Format de réponse attendu
```json
{
  "status": true,
  "message": "Utilisateurs récupérés avec succès",
  "data": {
    "users": [
      // Array des utilisateurs de la page courante
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 10,
      "totalItems": 150,
      "totalPages": 15,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Exemple d'utilisation
```
GET /api/users?page=2&pageSize=20&sortBy=name&sortOrder=asc
```

## Avantages
- Meilleures performances avec de grands volumes de données
- Réduction de la consommation de bande passante
- Expérience utilisateur améliorée
- Compatibilité avec les composants de table React

## Priorité
Moyenne à haute - Améliore significativement les performances et l'expérience utilisateur

## Contact
[Vos coordonnées ou celles de votre équipe]

## Date souhaitée
[Dates de livraison souhaitées]
