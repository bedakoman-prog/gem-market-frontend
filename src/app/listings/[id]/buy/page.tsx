"use client";

import { use, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useApiData } from "@/lib/useApi";
import { useAuth } from "@/lib/auth";
import type { Listing, CheckoutResult } from "@/lib/types";
import { money } from "@/lib/format";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/Button";
import { LoadingState, ErrorState } from "@/components/LoadingState";
import { useRequireAuth } from "@/lib/useRequireAuth";

export default function BuyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { ready } = useRequireAuth();
  const { me } = useAuth();
  const { data: listing, loading, error } = useApiData(() => api.get<Listing>(`/listings/${id}`, false), [id]);
  const [address, setAddress] = useState(me?.city || "");
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handlePay() {
    if (!listing) return;
    setBusy(true);
    setSubmitError(null);
    try {
      const res = await api.post<CheckoutResult>("/orders", { listingId: listing.id });
      window.location.href = res.paymentUrl;
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Impossible de lancer le paiement.");
      setBusy(false);
    }
  }

  if (!ready) return <LoadingState label="Vérification de la connexion…" />;
  if (loading) return <LoadingState />;
  if (error || !listing) return <ErrorState message={error || "Annonce introuvable."} />;

  return (
    <div className="fade">
      <TopBar title={listing.type === "service" ? "Commander" : "Achat"} />

      <div className="mb-4 rounded-[var(--radius-m)] border p-3.5" style={{ borderColor: "var(--line)" }}>
        <div className="text-[13.5px] font-bold" style={{ color: "var(--ink)" }}>{listing.title}</div>
        <div className="mt-0.5 text-[12px]" style={{ color: "var(--text-faint)" }}>{listing.seller?.name}</div>
      </div>

      <div
        className="mb-4 flex items-start gap-2.5 rounded-[var(--radius-m)] p-3.5 text-[12.5px] leading-relaxed"
        style={{ background: "var(--teal-100)", color: "var(--teal-900)" }}
      >
        <ShieldCheck size={17} className="mt-0.5 flex-none" />
        <p>
          Votre argent est conservé par TROUVE TOUT et n&apos;est versé au vendeur qu&apos;après votre confirmation de
          réception. Vous pouvez signaler la commande à tout moment en cas de problème pour être remboursé.
        </p>
      </div>

      <div className="mb-5">
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
          Adresse de livraison / lieu de retrait
        </label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-[var(--radius-s)] border px-3 py-2.5 text-[13.5px]"
          style={{ borderColor: "var(--line)" }}
        />
      </div>

      <div className="mb-6 space-y-2 border-t border-dashed pt-3" style={{ borderColor: "var(--line)" }}>
        <div className="flex justify-between text-[15px] font-bold" style={{ color: "var(--ink)" }}>
          <span>Total à payer (en séquestre)</span>
          <span>{money(listing.priceFcfa)}</span>
        </div>
      </div>

      {submitError && <p className="mb-3 text-[12.5px]" style={{ color: "var(--clay)" }}>{submitError}</p>}

      <Button variant="amber" onClick={handlePay} disabled={busy}>
        {busy ? "Redirection vers le paiement…" : "Payer par carte bancaire"}
      </Button>
    </div>
  );
}
