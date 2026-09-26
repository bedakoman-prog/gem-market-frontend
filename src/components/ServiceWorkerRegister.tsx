"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Enregistre le service worker (public/sw.js) côté client uniquement.
// Nécessaire pour que Chrome (Android et Bureau) propose l'installation
// de TROUVE TOUT comme une application ("Ajouter à l'écran d'accueil" /
// "Installer l'application") et pour afficher les notifications push de la
// messagerie (section 5) même quand l'appli n'est pas au premier plan.
export function ServiceWorkerRegister() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    // Quand on clique sur une notification alors qu'un onglet TROUVE TOUT est
    // déjà ouvert, le service worker se contente de le mettre au premier
    // plan (voir sw.js) — c'est ici qu'on effectue la navigation réelle vers
    // la conversation concernée, sans recharger toute la page.
    function onMessage(event: MessageEvent) {
      if (event.data?.type === "navigate" && typeof event.data.url === "string") {
        router.push(event.data.url);
      }
    }
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [router]);

  return null;
}
