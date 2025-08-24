"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CreateUser() {
  const router = useRouter();
  const isLoading = false; // Remplacez par votre logique de chargement

  return (
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
      >
        Retour
      </Button>
    </div>
  );
}
