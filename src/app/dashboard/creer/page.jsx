"use client";
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Upload, ArrowLeft } from 'lucide-react';
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/utils/env';
import Swal from 'sweetalert2';
import Image from "next/image";

function CreerUtilisateurContent() {
  const router = useRouter();
  const fileInput = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'user',
    active: true,
    profile_photo: null
  });

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

      // Créer FormData pour gérer le fichier
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('password_confirmation', formData.password_confirmation);
      submitData.append('role', formData.role);
      submitData.append('active', formData.active ? '1' : '0');
      
      if (formData.profile_photo) {
        submitData.append('profile_photo', formData.profile_photo);
      }

      const response = await axios.post(getApiUrl('/users'), submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });

      if (response.data.status) {
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: response.data.message || "Utilisateur créé avec succès",
        });
        router.push("/dashboard");
      } else {
        throw new Error(response.data.message || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("Erreur création utilisateur:", error);
      
      let errorMessage = "Erreur lors de la création de l'utilisateur";
      
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

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mx-auto max-w-4xl px-2 sm:px-4 md:px-8 pt-8 pb-2">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">Créer un Utilisateur</h1>
                <div className="text-muted-foreground text-base mt-1">
                  Ajouter un nouvel utilisateur au système
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Photo de profil */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-3">Photo de profil</label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border flex items-center justify-center bg-gray-50 text-gray-400">
                      {formData.profile_photo ? (
                        <img
                          src={URL.createObjectURL(formData.profile_photo)}
                          alt="Preview"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <UserPlus size={24} className="sm:size-8" />
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
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
                        className="w-full sm:w-auto"
                      >
                        <Upload size={16} className="mr-2" />
                        Choisir une photo
                      </Button>
                      <span className="text-xs text-muted-foreground text-center sm:text-left">.jpg/.png/.gif, 2Mo max.</span>
                    </div>
                  </div>
                </div>

                {/* Nom complet */}
                <div className="md:col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium mb-2">Nom complet *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full border rounded px-3 py-2 text-sm sm:text-base"
                    placeholder="Nom complet"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>

                {/* Email */}
                <div className="md:col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full border rounded px-3 py-2 text-sm sm:text-base"
                    placeholder="email@exemple.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>

                {/* Mot de passe */}
                <div className="md:col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium mb-2">Mot de passe *</label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={8}
                    className="w-full border rounded px-3 py-2 text-sm sm:text-base"
                    placeholder="Minimum 8 caractères"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>

                {/* Confirmation mot de passe */}
                <div className="md:col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium mb-2">Confirmer le mot de passe *</label>
                  <input
                    type="password"
                    name="password_confirmation"
                    required
                    className="w-full border rounded px-3 py-2 text-sm sm:text-base"
                    placeholder="Confirmer le mot de passe"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>

                {/* Rôle */}
                <div className="md:col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium mb-2">Rôle *</label>
                  <select
                    name="role"
                    required
                    className="w-full border rounded px-3 py-2 text-sm sm:text-base"
                    value={formData.role}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>

                {/* Statut */}
                <div className="md:col-span-2 sm:col-span-1 flex items-center pt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="active"
                      className="accent-primary size-4 sm:size-5"
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
                      Création...
                    </span>
                  ) : (
                    <>
                      <UserPlus size={16} className="mr-2" />
                      Créer l'Utilisateur
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

export default function CreerUtilisateur() {
  return (
    <ProtectedRoute>
      <CreerUtilisateurContent />
    </ProtectedRoute>
  );
}
