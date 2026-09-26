"use client";

import { api } from "./api";

// Notifications push pour la messagerie (section 5) : prévenir l'autre
// partie d'un nouveau message même quand l'appli n'est pas ouverte à
// l'écran. S'appuie sur le service worker déjà enregistré pour
// l'installabilité PWA (voir components/ServiceWorkerRegister.tsx) — il
// suffit de lui ajouter un gestionnaire "push" (voir public/sw.js).

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

// Un endpoint de push est encodé en base64url ; l'API PushManager attend la
// clé serveur (VAPID) sous forme de Uint8Array — conversion standard
// documentée par le protocole Web Push.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

interface SubscriptionJSON {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

// Demande la permission (si pas déjà tranchée), crée l'abonnement Push côté
// navigateur puis l'enregistre côté serveur. Retourne false sans erreur si
// l'utilisateur refuse ou si le navigateur ne supporte pas les notifications
// — cette fonctionnalité est une amélioration, jamais un pré-requis.
export async function enablePushNotifications(): Promise<boolean> {
  if (!isPushSupported()) return false;

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") return false;

  const registration = await navigator.serviceWorker.ready;
  const { publicKey } = await api.get<{ publicKey: string | null }>("/notifications/vapid-public-key");
  if (!publicKey) return false; // backend pas encore configuré (VAPID_*)

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      // Cast nécessaire : le typage DOM de PushManager.subscribe attend un
      // ArrayBuffer "classique", plus strict depuis les dernières libs TS,
      // alors que Uint8Array.buffer est typé plus large (ArrayBufferLike).
      // Sans incidence à l'exécution — c'est bien un ArrayBuffer standard ici.
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    });
  }

  const json = subscription.toJSON() as SubscriptionJSON;
  if (!json.endpoint || !json.keys) return false;

  await api.post("/notifications/subscribe", { endpoint: json.endpoint, keys: json.keys });
  return true;
}

export async function disablePushNotifications(): Promise<void> {
  if (!isPushSupported()) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe().catch(() => {});
  await api.del("/notifications/subscribe", { endpoint }).catch(() => {});
}
