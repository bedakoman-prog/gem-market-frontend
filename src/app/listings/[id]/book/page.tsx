"use client";

import { use, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useApiData } from "@/lib/useApi";
import type { Listing, CheckoutResult } from "@/lib/types";
import { money } from "@/lib/format";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/Button";
import { LoadingState, ErrorState } from "@/components/LoadingState";
import { useRequireAuth } from "@/lib/useRequireAuth";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
function addDaysIso(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { ready } = useRequireAuth();
  const { data: listing, loading, error } = useApiData(() => api.get<Listing>(`/listings/${id}`, false), [id]);

  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState(addDaysIso(todayIso(), 1));
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const nights = useMemo(() => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return Math.max(1, Math.round((end - start) / 86400000));
  }, [startDate, endDate]);

  const total = listing ? listing.priceFcfa * nights : 0;

  async function handlePay() {
    if (!listing) return;
    setBusy(true);
    setSubmitError(null);
    try {
      const res = await api.post<CheckoutResult>("/bookings", { listingId: listing.id, startDate, endDate });
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
      <TopBar title="Réservation" />

      <div className="mb-4 rounded-[var(--radius-m)] border p-3.5" style={{ borderColor: "var(--line)" }}>
        <div className="text-[13.5px] font-bold" style={{ color: "var(--ink)" }}>{listing.title}</div>
        <div className="mt-0.5 text-[12px]" style={{ color: "var(--text-faint)" }}>{money(listing.priceFcfa)} / jour</div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
            <CalendarDays size={12} /> Arrivée
          </label>
          <input
            type="date"
            value={startDate}
            min={todayIso()}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (endDate <= e.target.value) setEndDate(addDaysIso(e.target.value, 1));
            }}
            className="w-full rounded-[var(--radius-s)] border px-3 py-2.5 text-[13px]"
            style={{ borderColor: "var(--line)" }}
          />
        </div>
        <div>
          <label className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
            <CalendarDays size={12} /> Départ
          </label>
          <input
            type="date"
            value={endDate}
            min={addDaysIso(startDate, 1)}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-[var(--radius-s)] border px-3 py-2.5 text-[13px]"
            style={{ borderColor: "var(--line)" }}
          />
        </div>
      </div>

      <div className="mb-6 space-y-2 border-t border-dashed pt-3" style={{ borderColor: "var(--line)" }}>
        <div className="flex justify-between text-[13px]" style={{ color: "var(--text-dim)" }}>
          <span>Tarif par jour</span>
          <span>{money(listing.priceFcfa)}</span>
        </div>
        <div className="flex justify-between text-[13px]" style={{ color: "var(--text-dim)" }}>
          <span>Durée</span>
          <span>{nights} nuit{nights > 1 ? "s" : ""}</span>
        </div>
        <div className="flex justify-between text-[15px] font-bold" style={{ color: "var(--ink)" }}>
          <span>Total à payer</span>
          <span>{money(total)}</span>
        </div>
      </div>

      {submitError && <p className="mb-3 text-[12.5px]" style={{ color: "var(--clay)" }}>{submitError}</p>}

      <Button variant="amber" onClick={handlePay} disabled={busy}>
        {busy ? "Redirection vers le paiement…" : "Payer par carte bancaire"}
      </Button>
    </div>
  );
}
