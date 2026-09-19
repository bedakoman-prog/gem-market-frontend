"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth";

// Garde d'accès pour /admin : redirige vers /login si non connecté, puis vers
// l'accueil si connecté mais pas modérateur (isAdmin), une fois GET /users/me
// résolu. Volontairement séparé de useRequireAuth pour ne jamais modifier le
// comportement des pages existantes.
export function useRequireAdmin() {
  const { me, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/login?next=%2Fadmin");
      return;
    }
    if (!me?.isAdmin) {
      router.replace("/");
    }
  }, [loading, isAuthenticated, me, router]);

  return { ready: !loading && isAuthenticated && !!me?.isAdmin };
}
