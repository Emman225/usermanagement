"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getApiUrl } from '@/utils/env';

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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

  return (
    <header className="bg-[#3a57e8] text-white flex items-center justify-end h-16 px-4 border-b border-gray-200 rounded-bl-lg">
      <button className="md:hidden text-gray-600 focus:outline-none mr-4" aria-label="Toggle sidebar">
        {/* Icon hamburger */}
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 focus:outline-none"
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
        >
            <Image
              src={profilePhoto}
              alt="Profil"
              width={40}  // Ajustement de la largeur
              height={40} // Ajustement de la hauteur
              className="h-10 rounded-full object-cover" // Ajustement de la classe pour la hauteur
            />
          <span className="text-white font-medium">{userName}</span>
          <svg
            className={`w-4 h-4 text-white transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-10">
            <a
              href="#"
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-100"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
              Déconnexion
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
