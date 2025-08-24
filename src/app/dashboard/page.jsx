"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { MoreVertical, Eye, Edit, Trash2, UserPlus } from "lucide-react"; 
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { RoleFilter } from "@/components/RoleFilter";
import { StatusFilter } from "@/components/StatusFilter";
import axios from 'axios';
import { hasPermission } from "@/utils/roleCheck";
import { getApiUrl } from '@/utils/env';
import Swal from 'sweetalert2';

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

// 🔹 Menu d'actions conditionné par rôle
const ActionsMenu = ({ onView, onEdit, onDelete, userRole }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

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
          <button
            className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-50 text-sm"
            onClick={() => {
              setOpen(false);
              onView();
            }}
          >
            <Eye size={16} /> Voir
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-50 text-sm"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            <Edit size={16} /> Modifier
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-50 text-sm text-red-600"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            <Trash2 size={16} /> Supprimer
          </button>
        </div>
      )}
    </div>
  );
};

const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

function ListeUtilisateursContent() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // Récupérer le rôle de l'utilisateur connecté
  useEffect(() => {
    const getUserRole = () => {
      try {
        const userData = sessionStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setCurrentUserRole(user.role);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du rôle:', error);
      }
    };

    getUserRole();
  }, []);

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

        try {
          const response = await axios.get(getApiUrl('/users'), {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            timeout: 15000
          });

          if (response.data && response.data.status === true && response.data.data && Array.isArray(response.data.data.users)) {
            setUsers(response.data.data.users);
          } else if (response.data && Array.isArray(response.data)) {
            setUsers(response.data);
          } else {
            console.warn("⚠️ Format de réponse inattendu:", response.data);
            setUsers([]);
          }
        } catch (requestError) {
          console.error("❌ Erreur de requête API:", requestError);
          
          if (requestError.response?.status === 401) {
            console.error("🔐 Token expiré ou invalide - Nettoyage et redirection");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            router.push("/login");
            return;
          }
          
          throw requestError;
        }
      } catch (error) {
        console.error("❌ Erreur lors du chargement des utilisateurs:", error);
        
        if (error.response) {
          if (error.response.status === 401 || error.response.status === 403) {
            console.error("🔐 Token invalide ou expiré - Redirection vers login");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            router.push("/login");
            return;
          }
        }
        
        setUsers([]);
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
        } else {
          throw new Error(response.data.message || "Erreur lors de la suppression");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      
      let errorMessage = "Erreur lors de la suppression de l'utilisateur";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        errorMessage = errors.join(', ');
      }

      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: errorMessage,
      });
    }
  };

  // Mise à jour des filtres de colonne
  useEffect(() => {
    const newFilters = [];
    
    if (roleFilter) {
      newFilters.push({ id: 'role', value: roleFilter });
    }
    
    if (statusFilter) {
      newFilters.push({ id: 'active', value: parseInt(statusFilter) });
    }
    
    setColumnFilters(newFilters);
  }, [roleFilter, statusFilter]);

  // 🔹 Colonnes du DataTable pour les utilisateurs
  const columns = [
    { 
      accessorKey: "name", 
      header: "Nom",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.profile_photo_url ? (
            <img
              src={row.original.profile_photo_url}
              alt={row.original.name}
              className="w-9 h-9 rounded-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <span 
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600"
            style={{ display: row.original.profile_photo_url ? 'none' : 'flex' }}
          >
            {getInitials(row.original.name)}
          </span>
          <div>
            <div className="font-semibold text-black">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">{row.original.email}</div>
          </div>
        </div>
      )
    },
    { 
      accessorKey: "email", 
      header: "Email",
      cell: ({ row }) => <div className="text-sm">{row.original.email}</div>
    },
    { 
      accessorKey: "role", 
      header: "Rôle", 
      cell: ({ row }) => roleBadge(row.original.role) 
    },
    { 
      accessorKey: "active", 
      header: "Statut", 
      cell: ({ row }) => statutBadge(row.original.active),
      filterFn: (row, columnId, filterValue) => {
        if (filterValue === undefined || filterValue === "") return true;
        return row.getValue(columnId) === filterValue;
      }
    },
    {
      accessorKey: "created_at",
      header: "Date de création",
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.original.created_at).toLocaleDateString('fr-FR')}
        </div>
      )
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionsMenu
          onView={() => router.push(`/dashboard/detail/${row.original.id}`)}
          onEdit={() => router.push(`/dashboard/modifier/${row.original.id}`)}
          onDelete={() => handleDeleteUser(row.original.id, row.original.name)}
          userRole={currentUserRole}
        />
      ),
    },
  ];

  const canAddUser = hasPermission('admin');

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mx-auto max-w-6xl px-2 sm:px-4 md:px-8 pt-8 pb-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold">Liste des Utilisateurs</h1>
                <div className="text-muted-foreground text-base mt-1">
                  Gérez les utilisateurs de votre application
                </div>
              </div>
              {canAddUser && (
                <Button
                  onClick={() => router.push("/dashboard/creer")}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <UserPlus size={16} />
                  <span className="font-semibold">Ajouter un Utilisateur</span>
                </Button>
              )}
            </div>

            {/* 🔹 DataTable avec recherche intégrée et filtres */}
            <div className="bg-white rounded-lg shadow-sm">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <DataTable 
                  data={users} 
                  columns={columns} 
                  columnFilters={columnFilters}
                  onColumnFiltersChange={setColumnFilters}
                  exportFileName="utilisateurs"
                  exportSheetName="Utilisateurs"
                  showExport={hasPermission("admin")}
                  customFilters={
                    <>
                      <RoleFilter value={roleFilter} onChange={setRoleFilter} />
                      <StatusFilter value={statusFilter} onChange={setStatusFilter} />
                    </>
                  }
                />
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default function ListeUtilisateurs() {
  return (
    <ProtectedRoute>
      <ListeUtilisateursContent />
    </ProtectedRoute>
  );
}
