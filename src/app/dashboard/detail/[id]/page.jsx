"use client";

import { Fragment, useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Upload, ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import axios from 'axios';
import { getApiUrl } from '@/utils/env';
import Swal from 'sweetalert2';

const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

function DetailUtilisateurContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [utilisateur, setUtilisateur] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const docInput = useRef();

  // Chargement des données de l'utilisateur depuis l'API
  useEffect(() => {
    const fetchUtilisateur = async () => {
      try {
        setIsLoading(true);
        const token = sessionStorage.getItem("token");
        
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await axios.get(getApiUrl(`/users/${id}`), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });

        if (response.data && response.data.status === true && response.data.data) {
          setUtilisateur(response.data.data);
        } else {
          setError("Utilisateur non trouvé");
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          router.push("/login");
        } else {
          setError("Erreur lors du chargement des données");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUtilisateur();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 p-6 overflow-auto flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  if (error || !utilisateur) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 p-6 overflow-auto flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>
              <p className="text-gray-600">{error || "Utilisateur non trouvé"}</p>
              <Button 
                onClick={() => router.push("/dashboard")}
                className="mt-4"
              >
                Retour à la liste
              </Button>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Fragment>
            <div className="flex justify-between items-center mb-4 px-10">
              <h1 className="text-3xl font-bold text-blue-700">Détails de l'utilisateur</h1>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Retour à la liste
              </Button>
            </div>
            <div className="mx-auto max-w-6xl px-2 sm:px-4 md:px-8 pt-8 pb-2">
              {/* Informations personnelles */}
              <div className="bg-white border rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold mb-2">Informations personnelles</h2>
                <div className="text-muted-foreground text-xs mb-4">Informations de base</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div className="flex items-center gap-4">
                    {utilisateur.profile_photo_url ? (
                      <img
                        src={utilisateur.profile_photo_url}
                        alt={utilisateur.name}
                        className="w-16 h-16 rounded-full border object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600">
                        {getInitials(utilisateur.name)}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p><strong>Nom complet:</strong> {utilisateur.name}</p>
                    </div>
                    <div>
                      <p><strong>Email:</strong> {utilisateur.email}</p>
                    </div>
                  </div>
                  <div>
                    <p><strong>Rôle:</strong> 
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 ${
                        utilisateur.role === 'admin' 
                          ? "bg-purple-100 text-purple-700" 
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {utilisateur.role}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p><strong>Statut:</strong> 
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 ${
                        utilisateur.active === 1 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      }`}>
                        {utilisateur.active === 1 ? "Actif" : "Inactif"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Informations supplémentaires */}
              <div className="bg-white border rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold mb-2">Informations supplémentaires</h2>
                <div className="text-muted-foreground text-xs mb-4">Détails complémentaires</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Email vérifié:</strong> {utilisateur.email_verified_at ? "Oui" : "Non"}</p>
                  </div>
                  <div>
                    <p><strong>Date de création:</strong> {new Date(utilisateur.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <p><strong>Dernière modification:</strong> {new Date(utilisateur.updated_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>

              {/* Photo de profil */}
              {utilisateur.profile_photo_url && (
                <div className="bg-white border rounded-xl p-6 mb-6">
                  <h2 className="text-lg font-semibold mb-2">Photo de profil</h2>
                  <div className="text-muted-foreground text-xs mb-4">Photo actuelle de l'utilisateur</div>
                  <div className="flex justify-center">
                    <img
                      src={utilisateur.profile_photo_url}
                      alt={utilisateur.name}
                      className="w-32 h-32 rounded-full border object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </Fragment>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default function DetailUtilisateur() {
  return (
    <ProtectedRoute>
      <DetailUtilisateurContent />
    </ProtectedRoute>
  );
}
