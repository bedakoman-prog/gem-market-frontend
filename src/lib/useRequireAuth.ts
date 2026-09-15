"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth";

// Redirige vers /login (avec retour automatique) si l'utilisateur n'est pas connecté,
// une fois que le premier chargement de la session (GET /users/me) est terminé.
export function useRequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, isAuthenticated, router, pathname]);

  return { ready: !loading && isAuthenticated };
}
