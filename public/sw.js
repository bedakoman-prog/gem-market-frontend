// Service worker minimal pour rendre GEM Market installable comme une
// application (bannière "Installer l'application" sur Chrome Android /
// Bureau). Aucune mise en cache personnalisée n'est ajoutée : on laisse
// le navigateur gérer le réseau normalement, la simple présence d'un
// gestionnaire "fetch" suffit pour satisfaire les critères d'installabilité.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Pas de interception : comportement réseau par défaut.
});
