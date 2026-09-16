"use client";

import { useEffect } from "react";

// Enregistre le service worker (public/sw.js) côté client uniquement.
// Nécessaire pour que Chrome (Android et Bureau) propose l'installation
// de GEM Market comme une application ("Ajouter à l'écran d'accueil" /
// "Installer l'application").
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
