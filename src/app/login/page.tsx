"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Swal from "sweetalert2";
import axios from 'axios';
import { getApiUrl } from '@/utils/env';
import './styles.css';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(getApiUrl('/login'), {
        email,
        password
      });

      const { data } = response;

      if (data.status && data.data && data.data.token) {
        sessionStorage.setItem("token", data.data.token);
        sessionStorage.setItem("user", JSON.stringify(data.data.user));
        
        // Redirection directe vers le dashboard sans message
        router.push("/dashboard");
      } else {
        Swal.fire({
          icon: "error",
          title: "Erreur de connexion",
          text: data.message || "Erreur lors de la connexion",
        });
      }
    } catch (error: unknown) {
      let errorMessage = "Erreur lors de la connexion";
      
      // Vérification de type pour les erreurs axios
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { status: number; data: unknown } };
        
        if (axiosError.response) {
          const { status, data } = axiosError.response;
          
          // Vérification de type pour l'objet data
          if (typeof data === 'object' && data !== null && 'message' in data) {
            const responseData = data as { message?: string; errors?: Record<string, string[]> };
            
            switch (status) {
              case 401:
                errorMessage = responseData.message || "Email ou mot de passe incorrect";
                break;
              case 403:
                errorMessage = responseData.message || "Votre compte est désactivé. Contactez l'administrateur.";
                break;
              case 422:
                errorMessage = responseData.message || "Erreur de validation des données";
                if (responseData.errors) {
                  errorMessage += ": " + Object.values(responseData.errors).flat().join(', ');
                }
                break;
              case 500:
                errorMessage = "Erreur interne du serveur. Veuillez réessayer plus tard.";
                break;
              default:
                errorMessage = responseData.message || "Erreur de connexion";
            }
          } else {
            // Fallback si la structure de data n'est pas conforme
            switch (status) {
              case 401:
                errorMessage = "Email ou mot de passe incorrect";
                break;
              case 403:
                errorMessage = "Votre compte est désactivé. Contactez l'administrateur.";
                break;
              case 422:
                errorMessage = "Erreur de validation des données";
                break;
              case 500:
                errorMessage = "Erreur interne du serveur. Veuillez réessayer plus tard.";
                break;
              default:
                errorMessage = "Erreur de connexion";
            }
          }
        }
      } else if (typeof error === 'object' && error !== null && 'request' in error) {
        // Erreur réseau (pas de réponse du serveur)
        errorMessage = "Impossible de se connecter au serveur. Vérifiez votre connexion internet.";
      } else {
        // Erreur lors de la configuration de la requête
        errorMessage = "Erreur de configuration de la requête";
      }

      Swal.fire({
        icon: "error",
        title: "Erreur de connexion",
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 page-bg">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <div className="flex items-center justify-center mb-3">
          <Image
            src="/logon_EDN_erp.png"
            alt="Logo"
            width={120}
            height={120}
            className="rounded-full"
          />
          {/* <h1 className="text-2xl font-bold text-[#3a57e8] ml-3">EDEN ERP</h1> */}

        </div>
        <h3 className="text-lg font-medium text-center mb-4">Se connecter</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Entrez votre adresse email"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              placeholder="Entrez le mot de passe"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Souviens-toi de moi
            </label>
            <a href="#" className="text-sm text-blue-600">Mot de passe oublié ?</a>
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 rounded-md disabled:bg-blue-400 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion...
              </span>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>
        <div className="text-center mt-4">
          <span className="text-sm text-gray-600">Besoin d&apos;un compte ? <a href="#" className="text-blue-600">Inscrivez-vous</a></span>
        </div>
      </div>
    </div>
  );
}
