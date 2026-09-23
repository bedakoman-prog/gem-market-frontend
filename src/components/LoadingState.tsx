"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// Le backend est hébergé sur le plan gratuit de Render : il se met en veille après
// une période d'inactivité et met 30 à 50s à se "réveiller" au premier appel.
// On avertit l'utilisateur au-delà de 4s d'attente plutôt que de le laisser devant
// un écran qui semble figé.
export function LoadingState({ label = "Chargement…" }: { label?: string }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <Loader2 className="animate-spin" size={26} color="var(--teal-600)" />
      <div className="text-[13px] font-medium" style={{ color: "var(--text-dim)" }}>
        {label}
      </div>
      {slow && (
        <div className="max-w-[260px] text-[11.5px]" style={{ color: "var(--text-faint)" }}>
          Le serveur TROUVE TOUT se réveille (hébergement gratuit) — cela peut prendre jusqu&apos;à 50 secondes la première fois.
        </div>
      )}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[var(--radius-m)] border border-dashed p-6 text-center text-[13px]"
      style={{ borderColor: "var(--line)", color: "var(--text-faint)" }}
    >
      {children}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      className="rounded-[var(--radius-m)] border p-4 text-center text-[13px]"
      style={{ borderColor: "var(--clay)", background: "var(--clay-100)", color: "var(--clay)" }}
    >
      <div className="font-semibold">Une erreur est survenue</div>
      <div className="mt-1">{message}</div>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 font-bold underline">
          Réessayer
        </button>
      )}
    </div>
  );
}
