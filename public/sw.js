// Service worker de TROUVE TOUT :
// - rend l'appli installable (bannière "Installer l'application" sur Chrome
//   Android / Bureau) — aucune mise en cache personnalisée, on laisse le
//   navigateur gérer le réseau normalement, la simple présence d'un
//   gestionnaire "fetch" suffit pour satisfaire les critères d'installabilité ;
// - affiche les notifications push de la messagerie (section 5) envoyées par
//   le backend (voir src/notifications/push.service.ts), y compris quand
//   l'appli n'est pas ouverte à l'écran.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Pas de interception : comportement réseau par défaut.
});

self.addEventListener("push", (event) => {
  let data = { title: "TROUVE TOUT", body: "Vous avez un nouveau message.", url: "/messages" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // payload non-JSON (ne devrait pas arriver, voir PushService) — on garde le message par défaut
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url },
      tag: data.url, // remplace une notification déjà affichée pour la même conversation
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/messages";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        // Une fenêtre de l'appli est déjà ouverte : on la ramène au premier
        // plan et on la navigue vers la conversation plutôt que d'en ouvrir une seconde.
        if ("focus" in client) {
          client.postMessage({ type: "navigate", url });
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
