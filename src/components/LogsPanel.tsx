"use client";
import { useState, useEffect } from 'react';
import { Download, Filter, Search, Calendar, User, AlertCircle, Info, Shield, Globe, Monitor, Mail, Key, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { hasPermission } from '@/utils/roleCheck';
import axios from 'axios';
import { getApiUrl } from '@/utils/env';

interface Log {
  timestamp: string;
  action: string;
  user_id: number | string;
  user_email: string;
  message: string;
  ip_address: string;
  user_agent: string;
  context: any;
  method: string;
  url: string;
  route: string | null;
  log_timestamp: string;
}

interface Filters {
  action: string;
  search: string;
  startDate: string;
  endDate: string;
  userId: string;
  method: string;
}

// Types d'actions disponibles pour le logging basés sur l'API
const LOG_ACTIONS = {
  POST_API_LOGIN: 'POST_API/LOGIN',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  POST_API_USERS: 'POST_API/USERS',
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE', 
  USER_DELETE: 'USER_DELETE',
  USER_VIEW: 'USER_VIEW',
  SYSTEM: 'SYSTEM'
};

// Méthodes HTTP
const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
};

export default function LogsPanel() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
  const [filters, setFilters] = useState<Filters>({
    action: '',
    search: '',
    startDate: '',
    endDate: '',
    userId: '',
    method: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [canManageLogs, setCanManageLogs] = useState(false);

  useEffect(() => {
    const userRole = sessionStorage.getItem('user');
    console.log("Données utilisateur dans sessionStorage:", userRole); // Ajout d'un log pour vérifier les données utilisateur
    const hasAdminPermission = hasPermission('admin');
    console.log("Permissions admin:", hasAdminPermission); // Ajout d'un log pour vérifier les permissions
    setCanManageLogs(hasAdminPermission);
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      
      if (!token) {
        console.error("Aucun token trouvé");
        setIsLoading(false);
        return;
      }

      const apiUrl = getApiUrl(`/logs`);
      console.log("URL de l'API:", apiUrl); // Ajout d'un log pour vérifier l'URL
      console.log("Token d'authentification:", token); // Ajout d'un log pour vérifier le token
      
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      console.log("Logs récupérés:", response.data); // Ajout d'un log pour vérifier les données
      if (response.data && response.data.status === true && Array.isArray(response.data.data.logs)) {
        const sortedLogs = response.data.data.logs.sort((a: Log, b: Log) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setLogs(sortedLogs);
      } else {
        console.error("Format de réponse inattendu:", response.data);
        setLogs([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Filtre par action
    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action);
    }

    // Filtre par méthode HTTP
    if (filters.method) {
      filtered = filtered.filter(log => log.method === filters.method);
    }

    // Filtre par recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        log.user_email.toLowerCase().includes(searchLower) ||
        log.ip_address.toLowerCase().includes(searchLower) ||
        (log.context && JSON.stringify(log.context).toLowerCase().includes(searchLower))
      );
    }

    // Filtre par date de début
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(log => new Date(log.timestamp) >= startDate);
    }

    // Filtre par date de fin
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Fin de la journée
      filtered = filtered.filter(log => new Date(log.timestamp) <= endDate);
    }

    setFilteredLogs(filtered);
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      action: '',
      search: '',
      startDate: '',
      endDate: '',
      userId: '',
      method: ''
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case LOG_ACTIONS.USER_CREATE:
        return <Plus size={16} className="text-green-600" />;
      case LOG_ACTIONS.USER_UPDATE:
        return <Edit size={16} className="text-blue-600" />;
      case LOG_ACTIONS.USER_DELETE:
        return <Trash2 size={16} className="text-red-600" />;
      case LOG_ACTIONS.POST_API_LOGIN:
      case LOG_ACTIONS.LOGIN_SUCCESS:
      case LOG_ACTIONS.LOGIN_FAILED:
        return <Key size={16} className="text-purple-600" />;
      case LOG_ACTIONS.POST_API_USERS:
        return <User size={16} className="text-orange-600" />;
      default:
        return <Info size={16} className="text-gray-600" />;
    }
  };

  const getMethodBadge = (method: string) => {
    const base = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (method) {
      case 'GET':
        return <span className={`${base} bg-green-100 text-green-700`}>GET</span>;
      case 'POST':
        return <span className={`${base} bg-blue-100 text-blue-700`}>POST</span>;
      case 'PUT':
        return <span className={`${base} bg-yellow-100 text-yellow-700`}>PUT</span>;
      case 'DELETE':
        return <span className={`${base} bg-red-100 text-red-700`}>DELETE</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-700`}>{method}</span>;
    }
  };

  const getActionLabel = (action: string) => {
    const labels = {
      [LOG_ACTIONS.POST_API_LOGIN]: 'Requête Login API',
      [LOG_ACTIONS.LOGIN_SUCCESS]: 'Connexion réussie',
      [LOG_ACTIONS.LOGIN_FAILED]: 'Échec connexion',
      [LOG_ACTIONS.POST_API_USERS]: 'Requête Utilisateurs API',
      [LOG_ACTIONS.USER_CREATE]: 'Création utilisateur',
      [LOG_ACTIONS.USER_UPDATE]: 'Modification utilisateur',
      [LOG_ACTIONS.USER_DELETE]: 'Suppression utilisateur',
      [LOG_ACTIONS.USER_VIEW]: 'Consultation utilisateur',
      [LOG_ACTIONS.SYSTEM]: 'Système'
    };
    
    return labels[action] || action;
  };

  const getStatusFromContext = (context: any) => {
    if (context && context.status_code) {
      const status = context.status_code;
      if (status >= 200 && status < 300) {
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">✓ {status}</span>;
      } else if (status >= 400 && status < 500) {
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">⚠ {status}</span>;
      } else if (status >= 500) {
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">✗ {status}</span>;
      }
    }
    return null;
  };

  if (!canManageLogs) {
    return (
      <div className="bg-white rounded-lg p-6 text-center">
        <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Accès restreint</h3>
        <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder aux logs.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* En-tête avec actions */}
      <div className="p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Historique des Actions</h2>
            <p className="text-gray-600 mt-1">
              {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''} trouvé{filteredLogs.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={loadLogs}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Actualiser
            </Button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="p-6 border-b bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-3 py-2 border rounded-md text-sm"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Filtre action */}
          <select
            className="border rounded px-3 py-2 text-sm"
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
          >
            <option value="">Toutes les actions</option>
            {Object.values(LOG_ACTIONS).map(action => (
              <option key={action} value={action}>
                {getActionLabel(action)}
              </option>
            ))}
          </select>

          {/* Filtre méthode HTTP */}
          <select
            className="border rounded px-3 py-2 text-sm"
            value={filters.method}
            onChange={(e) => handleFilterChange('method', e.target.value)}
          >
            <option value="">Toutes les méthodes</option>
            {Object.values(HTTP_METHODS).map(method => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>

          {/* Date début */}
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              className="w-full pl-10 pr-3 py-2 border rounded-md text-sm"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          {/* Date fin */}
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              className="w-full pl-10 pr-3 py-2 border rounded-md text-sm"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>

        {(filters.action || filters.method || filters.search || filters.startDate || filters.endDate) && (
          <div className="mt-4 flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">Filtres actifs</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-blue-600 hover:text-blue-700"
            >
              Tout effacer
            </Button>
          </div>
        )}
      </div>

      {/* Liste des logs */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <Info size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun log trouvé</h3>
            <p className="text-gray-600">
              {logs.length === 0 
                ? "Aucune action n'a encore été enregistrée." 
                : "Aucun log ne correspond à vos critères de recherche."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log, index) => (
              <div key={`${log.timestamp}-${index}`} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getActionIcon(log.action)}
                    <span className="font-semibold text-gray-900">
                      {getActionLabel(log.action)}
                    </span>
                    {getMethodBadge(log.method)}
                    {getStatusFromContext(log.context)}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString('fr-FR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>
                
                <p className="text-gray-800 mb-3">{log.message}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                  {log.user_email && log.user_email !== 'anonymous' && (
                    <span className="flex items-center gap-1">
                      <Mail size={14} />
                      {log.user_email}
                    </span>
                  )}
                  {log.user_id && log.user_id !== 'guest' && (
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      ID: {log.user_id}
                    </span>
                  )}
                  {log.ip_address && (
                    <span className="flex items-center gap-1">
                      <Globe size={14} />
                      {log.ip_address}
                    </span>
                  )}
                  {log.user_agent && (
                    <span className="flex items-center gap-1">
                      <Monitor size={14} />
                      {log.user_agent.length > 30 ? `${log.user_agent.substring(0, 30)}...` : log.user_agent}
                    </span>
                  )}
                </div>

                {log.context && Object.keys(log.context).length > 0 && (
                  <details className="mt-2">
                    <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-700">
                      Détails techniques
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                      {JSON.stringify(log.context, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
