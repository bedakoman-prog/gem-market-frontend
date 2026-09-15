"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Minus, Plus } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useApiData } from "@/lib/useApi";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { ShopStatus, CheckoutResult } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/Button";
import { LoadingState, ErrorState } from "@/components/LoadingState";

const PRICE_PER_DAY_USD = 1;

export default function ShopPage() {
  const { ready } = useRequireAuth();
  const { data: status, loading, error, reload } = useApiData(
    () => (ready ? api.get<ShopStatus>("/shop/status") : Promise.resolve(null)),
    [ready],
  );
  const [days, setDays] = useState(30);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubscribe() {
    setBusy(true);
    setSubmitError(null);
    try {
      const res = await api.post<CheckoutResult>("/shop/subscribe", { days });
      window.location.href = res.paymentUrl;
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Impossible de lancer le paiement.");
      setBusy(false);
    }
  }

  if (!ready) return <LoadingState label="Vérification de la connexion…" />;

  return (
    <div className="fade">
      <TopBar title="Paiement & boutique" />

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {status && (
        <div
          className="mb-5 flex items-center gap-3 rounded-[var(--radius-m)] border p-3.5"
          style={{ borderColor: "var(--line)" }}
        >
          <span
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full"
            style={{
              background: status.active ? "var(--good-100)" : "var(--clay-100)",
              color: status.active ? "var(--good)" : "var(--clay)",
            }}
          >
            {status.active ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          </span>
          <div>
            <div className="text-[13.5px] font-bold" style={{ color: "var(--ink)" }}>
              {status.active ? "Boutique active" : "Boutique inactive"}
            </div>
            <div className="mt-0.5 text-[11.5px]" style={{ color: "var(--text-faint)" }}>
              {status.active
                ? `${status.activeListingsCount}/${status.maxListings} annonces · expire le ${formatDate(status.endDate)}`
                : "Aucun abonnement actif"}
            </div>
          </div>
        </div>
      )}

      <div className="mb-5 rounded-[var(--radius-m)] p-4" style={{ background: "var(--teal-100)", color: "var(--teal-900)" }}>
        <p className="mb-1 text-[13px] font-bold">{PRICE_PER_DAY_USD} $ / jour, jusqu&apos;à 10 annonces actives</p>
        <p className="text-[12px] leading-relaxed">
          Nécessaire pour publier des biens, services ou offres d&apos;emploi. Les espaces à louer restent payés
          à la réservation par le locataire, séparément. La navigation et le téléchargement de l&apos;application
          restent gratuits pour les acheteurs. Une commission de 1% est prélevée sur chaque vente réglée en
          séquestre.
        </p>
      </div>

      <div className="mb-5 flex items-center justify-center gap-6">
        <button
          onClick={() => setDays((d) => Math.max(1, d - 1))}
          className="flex h-10 w-10 items-center justify-center rounded-full border"
          style={{ borderColor: "var(--line)" }}
        >
          <Minus size={16} />
        </button>
        <div className="font-[var(--font-mono)] text-[22px] font-bold" style={{ color: "var(--ink)" }}>
          {days} <span className="text-[13px] font-medium" style={{ color: "var(--text-faint)" }}>jours</span>
        </div>
        <button
          onClick={() => setDays((d) => d + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border"
          style={{ borderColor: "var(--line)" }}
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="mb-6 flex justify-between border-t border-dashed pt-3 text-[15px] font-bold" style={{ borderColor: "var(--line)", color: "var(--ink)" }}>
        <span>Total</span>
        <span>{(days * PRICE_PER_DAY_USD).toFixed(2)} $</span>
      </div>

      {submitError && <p className="mb-3 text-[12.5px]" style={{ color: "var(--clay)" }}>{submitError}</p>}

      <Button variant="amber" onClick={handleSubscribe} disabled={busy}>
        {busy ? "Redirection vers le paiement…" : status?.active ? "Renouveler mon abonnement" : `Activer ma boutique — ${PRICE_PER_DAY_USD} $/jour`}
      </Button>
    </div>
  );
}
