"use client";
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Upload, Save, ArrowLeft } from 'lucide-react';
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import { getApiUrl } from '@/utils/env';
import Swal from 'sweetalert2';

function ModifierUtilisateurContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const fileInput = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'user',
    active: true,
    profile_photo: null,
    current_profile_photo: null
  });

  // Chargement des données de l'utilisateur
  useEffect(() => {
    const fetchUtilisateur = async () => {
      try {
        setIsLoadingData(true);
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
          const user = response.data.data;
          setFormData({
            name: user.name || '',
            email: user.email || '',
            password: '',
            password_confirmation: '',
            role: user.role || 'user',
            active: user.active === 1,
            profile_photo: null,
            current_profile_photo: user.profile_photo_url
          });
        } else {
          throw new Error("Utilisateur non trouvé");
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          router.push("/login");
        } else {
          Swal.fire({
            icon: "error",
            title: "Erreur",
            text: "Erreur lors du chargement des données de l'utilisateur",
          });
          router.push("/dashboard");
        }
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchUtilisateur();
  }, [id, router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validation de la taille du fichier (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "La taille du fichier ne doit pas dépasser 2MB",
        });
        e.target.value = ''; // Réinitialiser l'input file
        return;
      }

      // Validation du type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Format de fichier non supporté. Utilisez JPEG, PNG ou GIF",
        });
        e.target.value = ''; // Réinitialiser l'input file
        return;
      }

      setFormData(prev => ({
        ...prev,
        profile_photo: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = sessionStorage.getItem("token");

      // Toujours utiliser FormData comme dans le formulaire de création
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('role', formData.role);
      submitData.append('active', formData.active ? '1' : '0');
      
      // Ajouter le mot de passe seulement s'il est modifié
      if (formData.password) {
        submitData.append('password', formData.password);
        submitData.append('password_confirmation', formData.password_confirmation);
      }
      
      if (formData.profile_photo) {
        submitData.append('profile_photo', formData.profile_photo);
      }

      // Pour Laravel, utiliser POST avec _method=PUT
      submitData.append('_method', 'PUT');

      // Debug: Afficher les données envoyées
      console.log("Données envoyées à l'API (FormData):");
      for (let [key, value] of submitData.entries()) {
        console.log(key, value);
      }

      const response = await axios.post(getApiUrl(`/users/${id}`), submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });

      if (response.data.status) {
        console.log("Réponse complète de l'API:", JSON.stringify(response.data, null, 2));
        console.log("Données retournées par l'API:", response.data.data);
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: response.data.message || "Utilisateur modifié avec succès",
        });
        router.push("/dashboard");
      } else {
        console.log("Réponse API sans status true:", response.data);
        throw new Error(response.data.message || "Erreur lors de la modification");
      }
    } catch (error) {
      console.error("Erreur modification utilisateur:", error);
      
      let errorMessage = "Erreur lors de la modification de l'utilisateur";
      
      if (error.response?.data?.errors) {
        // Afficher les erreurs de validation
        const errors = Object.values(error.response.data.errors).flat();
        errorMessage = errors.join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
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

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mx-auto max-w-4xl px-2 sm:px-4 md:px-8 pt-8 pb-2">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">Modifier l'Utilisateur</h1>
                <div className="text-muted-foreground text-base mt-1">
                  Modifier les informations de l'utilisateur
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => router.push("/dashboard")}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Retour
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo de profil */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-3">Photo de profil</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full border flex items-center justify-center bg-gray-50 text-gray-400">
                      {formData.profile_photo ? (
                        <img
                          src={URL.createObjectURL(formData.profile_photo)}
                          alt="Preview"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : formData.current_profile_photo ? (
                        <img
                          src={formData.current_profile_photo}
                          alt="Current profile"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <UserPlus size={32} />
                      )}
                    </div>
                    <input 
                      ref={fileInput} 
                      type="file" 
                      className="hidden" 
                      accept=".jpeg,.png,.jpg,.gif"
                      onChange={handleFileChange}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => fileInput.current.click()}
                      disabled={isLoading}
                    >
                      <Upload size={16} className="mr-2" />
                      {formData.current_profile_photo ? 'Changer la photo' : 'Choisir une photo'}
                    </Button>
                    <span className="text-xs text-muted-foreground">.jpg/.png/.gif, 2Mo max.</span>
                  </div>
                </div>

                {/* Nom complet */}
                <div>
                  <label className="block text-sm font-medium mb-2">Nom complet *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full border rounded px-3 py-2"
                    placeholder="Nom complet"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full border rounded px-3 py-2"
                    placeholder="email@exemple.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>

                {/* Mot de passe */}
                <div>
                  <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
                  <input
                    type="password"
                    name="password"
                    minLength={8}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Laisser vide pour ne pas modifier"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>

                {/* Confirmation mot de passe */}
                <div>
                  <label className="block text-sm font-medium mb-2">Confirmer le nouveau mot de passe</label>
                  <input
                    type="password"
                    name="password_confirmation"
                    className="w-full border rounded px-3 py-2"
                    placeholder="Confirmer le nouveau mot de passe"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>

                {/* Rôle */}
                <div>
                  <label className="block text-sm font-medium mb-2">Rôle *</label>
                  <select
                    name="role"
                    required
                    className="w-full border rounded px-3 py-2"
                    value={formData.role}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>

                {/* Statut */}
                <div className="flex items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="active"
                      className="accent-primary"
                      checked={formData.active}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    <span className="text-sm font-medium">Utilisateur actif</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end mt-8 pt-6 border-t">
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Modification...
                    </span>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Modifier l'Utilisateur
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default function ModifierUtilisateur() {
  return (
    <ProtectedRoute>
      <ModifierUtilisateurContent />
    </ProtectedRoute>
  );
}
