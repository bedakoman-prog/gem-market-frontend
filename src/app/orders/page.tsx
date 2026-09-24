"use client";

import { useState } from "react";
import { Clock, CheckCircle2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useApiData } from "@/lib/useApi";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useToast } from "@/lib/toast";
import type { Order } from "@/lib/types";
import { money, formatDate } from "@/lib/format";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { LoadingState, ErrorState, EmptyState } from "@/components/LoadingState";

export default function OrdersPage() {
  const { ready } = useRequireAuth();
  const { toast } = useToast();
  const { data: orders, loading, error, reload } = useApiData(
    () => (ready ? api.get<Order[]>("/orders") : Promise.resolve(null)),
    [ready],
  );
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  async function confirmReceipt(id: string) {
    setConfirmingId(id);
    try {
      await api.post(`/orders/${id}/confirm-receipt`);
      toast("Réception confirmée — le vendeur a été payé");
      reload();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Impossible de confirmer la réception.");
    } finally {
      setConfirmingId(null);
    }
  }

  if (!ready) return <LoadingState label="Vérification de la connexion…" />;

  return (
    <div className="fade">
      <TopBar title="Mes achats" />
      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {orders && orders.length === 0 && (
        <EmptyState>Vous n&apos;avez encore effectué aucun achat sur TROUVE TOUT.</EmptyState>
      )}
      {orders && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-[var(--radius-m)] border p-3.5" style={{ borderColor: "var(--line)" }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-bold" style={{ color: "var(--ink)" }}>
                    {o.listing?.title || "Annonce"}
                  </div>
                  <div className="mt-0.5 text-[11.5px]" style={{ color: "var(--text-faint)" }}>
                    {formatDate(o.createdAt)} · {money(o.amountFcfa)}
                  </div>
                </div>
                {o.status === "released" ? (
                  <Chip variant="good" icon={<CheckCircle2 size={11} />}>Livré et payé</Chip>
                ) : (
                  <Chip variant="service" icon={<Clock size={11} />}>En séquestre</Chip>
                )}
              </div>
              {o.status === "paid_escrow" && (
                <Button
                  variant="outline"
                  className="mt-3"
                  disabled={confirmingId === o.id}
                  onClick={() => confirmReceipt(o.id)}
                >
                  {confirmingId === o.id ? "Confirmation…" : "Confirmer la réception"}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-[11.5px]" style={{ color: "var(--text-faint)" }}>
        Ne confirmez la réception qu&apos;une fois la commande effectivement reçue et conforme.
      </p>
    </div>
  );
}
