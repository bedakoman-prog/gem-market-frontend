"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/lib/toast";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/Button";
import { LoadingState } from "@/components/LoadingState";

export default function EditProfilePage() {
  const { ready } = useRequireAuth();
  const { me, refreshMe } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [name, setName] = useState(me?.name || "");
  const [email, setEmail] = useState(me?.email || "");
  const [city, setCity] = useState(me?.city || "");
  const [isSeller, setIsSeller] = useState(me?.isSeller ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.patch("/users/me", { name, email: email || undefined, city, isSeller });
      await refreshMe();
      toast("Profil mis à jour");
      router.push("/profile");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'enregistrer.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready || !me) return <LoadingState label="Vérification de la connexion…" />;

  return (
    <div className="fade">
      <TopBar title="Mes informations" />

      <form onSubmit={handleSave} className="space-y-3.5">
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
            Nom complet
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-[var(--radius-s)] border px-3 py-2.5 text-[13.5px]"
            style={{ borderColor: "var(--line)" }}
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[var(--radius-s)] border px-3 py-2.5 text-[13.5px]"
            style={{ borderColor: "var(--line)" }}
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
            Téléphone
          </label>
          <input
            disabled
            value={me.phone}
            className="w-full rounded-[var(--radius-s)] border px-3 py-2.5 text-[13.5px] opacity-60"
            style={{ borderColor: "var(--line)" }}
          />
          <p className="mt-1 text-[11px]" style={{ color: "var(--text-faint)" }}>
            Le numéro de connexion ne peut pas être modifié ici.
          </p>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
            Ville
          </label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-[var(--radius-s)] border px-3 py-2.5 text-[13.5px]"
            style={{ borderColor: "var(--line)" }}
          />
        </div>

        <div>
          <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
            Vous êtes
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label
              className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-s)] border px-3 py-2.5"
              style={{ borderColor: !isSeller ? "var(--line)" : "var(--teal-600)", background: !isSeller ? "transparent" : "var(--teal-100)" }}
            >
              <input type="checkbox" checked readOnly className="accent-current" />
              <span className="text-[12.5px] font-semibold">Acheteur</span>
            </label>
            <label
              className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-s)] border px-3 py-2.5"
              style={{ borderColor: isSeller ? "var(--teal-600)" : "var(--line)", background: isSeller ? "var(--teal-100)" : "transparent" }}
            >
              <input type="checkbox" checked={isSeller} onChange={(e) => setIsSeller(e.target.checked)} className="accent-current" />
              <span className="text-[12.5px] font-semibold">Vendeur</span>
            </label>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-faint)" }}>
          Publier un bien, un service ou une offre d&apos;emploi nécessite un abonnement boutique actif. Les
          catégories interdites (médicaments, drogues, armes) restent bloquées quel que soit votre statut.
        </p>

        {error && (
          <p className="rounded-[var(--radius-s)] p-2.5 text-[12.5px]" style={{ background: "var(--clay-100)", color: "var(--clay)" }}>
            {error}
          </p>
        )}

        <Button type="submit" disabled={busy}>
          {busy ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </div>
  );
}
