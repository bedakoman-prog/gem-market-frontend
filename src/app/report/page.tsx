"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flag } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/Button";
import { LoadingState } from "@/components/LoadingState";

const REASONS = [
  "Produit non conforme à l'annonce",
  "Vendeur injoignable après paiement",
  "Tentative d'arnaque ou de fraude",
  "Contenu ou annonce inapproprié(e)",
  "Autre motif",
];

function ReportForm() {
  const { ready } = useRequireAuth();
  const router = useRouter();
  const params = useSearchParams();
  const sellerId = params.get("sellerId") || undefined;
  const listingId = params.get("listingId") || undefined;

  const [reasonIdx, setReasonIdx] = useState(0);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const reason = details.trim() ? `${REASONS[reasonIdx]} — ${details.trim()}` : REASONS[reasonIdx];
      await api.post("/reports", { sellerId, listingId, reason });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer le signalement.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <LoadingState label="Vérification de la connexion…" />;

  if (sent) {
    return (
      <div className="fade flex flex-col items-center gap-4 py-10 text-center">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "var(--clay-100)", color: "var(--clay)" }}
        >
          <Flag size={26} />
        </span>
        <h3 className="font-[var(--font-display)] text-[18px] font-semibold" style={{ color: "var(--ink)" }}>
          Signalement transmis
        </h3>
        <p className="max-w-[280px] text-[13px]" style={{ color: "var(--text-dim)" }}>
          Notre équipe examine chaque signalement sous 24h et peut suspendre un vendeur en cas d&apos;abus avéré.
        </p>
        <Button onClick={() => router.push("/")} full={false} className="px-8">
          Retour à l&apos;accueil
        </Button>
      </div>
    );
  }

  return (
    <div className="fade">
      <TopBar title="Signaler" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
            Motif du signalement
          </div>
          <div className="space-y-2">
            {REASONS.map((r, i) => (
              <label
                key={r}
                className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-s)] border px-3.5 py-3"
                style={{
                  borderColor: reasonIdx === i ? "var(--teal-600)" : "var(--line)",
                  background: reasonIdx === i ? "var(--teal-100)" : "transparent",
                }}
              >
                <input type="radio" checked={reasonIdx === i} onChange={() => setReasonIdx(i)} className="accent-current" />
                <span className="text-[13px] font-medium" style={{ color: "var(--text)" }}>{r}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
            Détails (optionnel)
          </label>
          <textarea
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Décrivez ce qui s'est passé pour accélérer la modération…"
            className="w-full rounded-[var(--radius-s)] border px-3 py-2.5 text-[13.5px]"
            style={{ borderColor: "var(--line)" }}
          />
        </div>

        {error && (
          <p className="rounded-[var(--radius-s)] p-2.5 text-[12.5px]" style={{ background: "var(--clay-100)", color: "var(--clay)" }}>
            {error}
          </p>
        )}

        <Button type="submit" variant="danger-outline" disabled={busy}>
          {busy ? "Envoi…" : "Envoyer le signalement"}
        </Button>

        <p className="text-[11px]" style={{ color: "var(--text-faint)" }}>
          La modération examine chaque signalement sous 24h et peut suspendre un compte en cas d&apos;abus avéré.
        </p>
      </form>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ReportForm />
    </Suspense>
  );
}
