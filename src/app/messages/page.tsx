"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { api } from "@/lib/api";
import { useApiData } from "@/lib/useApi";
import { useAuth } from "@/lib/auth";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { Conversation } from "@/lib/types";
import { sellerDisplayName } from "@/lib/format";
import { Chip } from "@/components/Chip";
import { LoadingState, ErrorState, EmptyState } from "@/components/LoadingState";

export default function MessagesPage() {
  const { ready } = useRequireAuth();
  const { me } = useAuth();
  const { data: conversations, loading, error, reload } = useApiData(
    () => (ready ? api.get<Conversation[]>("/conversations") : Promise.resolve(null)),
    [ready],
  );

  if (!ready) return <LoadingState label="Vérification de la connexion…" />;

  return (
    <div className="fade">
      <h2 className="pb-3 pt-1 font-[var(--font-display)] text-[18px] font-semibold" style={{ color: "var(--ink)" }}>
        Messages
      </h2>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {conversations && conversations.length === 0 && <EmptyState>Aucune conversation pour le moment.</EmptyState>}
      {conversations && conversations.length > 0 && (
        <div className="divide-y" style={{ borderColor: "var(--line)" }}>
          {conversations.map((c) => {
            const iAmSeller = me?.id === c.sellerId;
            const other = iAmSeller ? c.buyer : c.seller;
            const last = c.messages?.[0];
            return (
              <Link key={c.id} href={`/messages/${c.id}`} className="flex items-center gap-3 py-3.5">
                <span
                  className="flex h-11 w-11 flex-none items-center justify-center rounded-full font-bold"
                  style={{ background: "var(--teal-100)", color: "var(--teal-700)" }}
                >
                  {sellerDisplayName(other).slice(0, 2).toUpperCase() || "?"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13.5px] font-bold" style={{ color: "var(--ink)" }}>
                      {sellerDisplayName(other) || "Utilisateur"}
                    </span>
                  </div>
                  <div className="truncate text-[12.5px]" style={{ color: last ? "var(--text)" : "var(--text-faint)" }}>
                    {last?.body || "Aucun message"}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-faint)" }}>
                    <MapPin size={11} />
                    <span className="truncate">{c.listing?.title}</span>
                    {iAmSeller && <Chip variant="service">Vous vendez</Chip>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
