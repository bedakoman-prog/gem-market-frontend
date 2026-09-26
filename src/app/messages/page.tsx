"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Bell, X } from "lucide-react";
import { api } from "@/lib/api";
import { useApiData } from "@/lib/useApi";
import { useAuth } from "@/lib/auth";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { Conversation } from "@/lib/types";
import { sellerDisplayName } from "@/lib/format";
import { Chip } from "@/components/Chip";
import { LoadingState, ErrorState, EmptyState } from "@/components/LoadingState";
import { enablePushNotifications, isPushSupported } from "@/lib/push";

const PUSH_DISMISSED_KEY = "gem_market_push_dismissed";

function PushOptInBanner() {
  const [visible, setVisible] = useState(false);
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    try {
      const dismissed = window.localStorage.getItem(PUSH_DISMISSED_KEY);
      if (!dismissed && isPushSupported() && Notification.permission === "default") setVisible(true);
    } catch {
      // stockage indisponible — pas grave, on affiche simplement la bannière une fois de plus
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(PUSH_DISMISSED_KEY, "1");
    } catch {
      // pas grave
    }
  }

  async function handleEnable() {
    setEnabling(true);
    const ok = await enablePushNotifications().catch(() => false);
    setEnabling(false);
    dismiss();
    if (!ok) {
      // refusé, ou navigateur non supporté — pas d'erreur bloquante, la messagerie continue de
      // fonctionner normalement, simplement sans notification push.
    }
  }

  if (!visible) return null;

  return (
    <div
      className="mb-3 flex items-center gap-2.5 rounded-[var(--radius-m)] border p-3"
      style={{ borderColor: "var(--line)", background: "var(--teal-100)" }}
    >
      <Bell size={18} style={{ color: "var(--teal-700)" }} className="flex-none" />
      <div className="min-w-0 flex-1 text-[12px]" style={{ color: "var(--teal-900)" }}>
        Activez les notifications pour être prévenu dès qu&apos;un acheteur ou un vendeur vous écrit.
      </div>
      <button
        type="button"
        onClick={handleEnable}
        disabled={enabling}
        className="flex-none rounded-full px-3 py-1.5 text-[11.5px] font-bold disabled:opacity-60"
        style={{ background: "var(--teal-700)", color: "#fff" }}
      >
        {enabling ? "…" : "Activer"}
      </button>
      <button type="button" onClick={dismiss} aria-label="Ignorer" className="flex-none p-1">
        <X size={15} style={{ color: "var(--teal-900)" }} />
      </button>
    </div>
  );
}

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
      <PushOptInBanner />
      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {conversations && conversations.length === 0 && <EmptyState>Aucune conversation pour le moment.</EmptyState>}
      {conversations && conversations.length > 0 && (
        <div className="divide-y" style={{ borderColor: "var(--line)" }}>
          {conversations.map((c) => {
            const iAmSeller = me?.id === c.sellerId;
            const other = iAmSeller ? c.buyer : c.seller;
            const last = c.messages?.[0];
            const unread = !!last && last.authorId !== me?.id && (!c.myLastReadAt || last.sentAt > c.myLastReadAt);
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
                    <span
                      className="truncate text-[13.5px]"
                      style={{ color: "var(--ink)", fontWeight: unread ? 800 : 700 }}
                    >
                      {sellerDisplayName(other) || "Utilisateur"}
                    </span>
                    {unread && (
                      <span className="h-2 w-2 flex-none rounded-full" style={{ background: "var(--clay)" }} />
                    )}
                  </div>
                  <div
                    className="truncate text-[12.5px]"
                    style={{ color: last ? "var(--text)" : "var(--text-faint)", fontWeight: unread ? 600 : 400 }}
                  >
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
