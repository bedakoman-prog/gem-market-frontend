"use client";

// Détection d'installation de la PWA (section "proposer le téléchargement de
// l'application" dans la messagerie — demande utilisateur). TROUVE TOUT est
// une PWA installable (voir public/manifest.json, display: "standalone"),
// pas une app de store : "télécharger l'application" veut donc dire
// "l'installer sur l'écran d'accueil".

// Android/Chrome/Edge déclenchent cet évènement quand l'app est installable ;
// on le capture tôt (avant tout montage de composant) pour ne jamais le
// rater, et on le rejoue à la demande via promptInstall().
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = isStandalone();

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari expose ce flag non-standard sur navigator.
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    deferredPrompt = null;
  });
}

export function isAlreadyInstalled(): boolean {
  return installed || isStandalone();
}

// true si Chrome/Edge/Android a proposé l'évènement natif d'installation.
export function canPromptInstall(): boolean {
  return !!deferredPrompt;
}

// iOS Safari ne supporte pas beforeinstallprompt : il faut guider l'usager
// vers Partager → "Sur l'écran d'accueil" manuellement.
export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferredPrompt) return "unavailable";
  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome;
}
