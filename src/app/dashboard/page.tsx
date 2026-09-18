"use client";

import Link from "next/link";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { useApiData } from "@/lib/useApi";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { Listing, Order, ShopStatus } from "@/lib/types";
import { money, formatDate } from "@/lib/format";
import { categoryIcon, categoryTint } from "@/lib/categoryMeta";
import { TopBar } from "@/components/TopBar";
import { LinkButton } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { LoadingState, ErrorState, EmptyState } from "@/components/LoadingState";

const COMMISSION_RATE = 0.01;

export default function DashboardPage() {
  const { ready } = useRequireAuth();
  const myListings = useApiData(() => (ready ? api.get<Listing[]>("/listings/mine") : Promise.resolve(null)), [ready]);
  const shopStatus = useApiData(() => (ready ? api.get<ShopStatus>("/shop/status") : Promise.resolve(null)), [ready]);
  const sales = useApiData(() => (ready ? api.get<Order[]>("/orders/received") : Promise.resolve(null)), [ready]);

  if (!ready) return <LoadingState label="Vérification de la connexion…" />;

  const activeListings = (myListings.data || []).filter((l) => l.status === "active" || !l.status);

  return (
    <div className="fade">
      <TopBar title="Mon espace vendeur" />

      <div className="mb-5 grid grid-cols-2 gap-2.5">
        <div className="rounded-[var(--radius-m)] border p-3.5 text-center" style={{ borderColor: "var(--line)" }}>
          <div className="font-[var(--font-mono)] text-[20px] font-bold" style={{ color: "var(--ink)" }}>
            {myListings.data?.length ?? "—"}
          </div>
          <div className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
            Annonces
          </div>
        </div>
        <div className="rounded-[var(--radius-m)] border p-3.5 text-center" style={{ borderColor: "var(--line)" }}>
          <div className="font-[var(--font-mono)] text-[20px] font-bold" style={{ color: "var(--ink)" }}>
            {sales.data?.length ?? "—"}
          </div>
          <div className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
            Commandes reçues
          </div>
        </div>
      </div>

      <Link
        href="/shop"
        className="mb-5 flex items-center gap-3 rounded-[var(--radius-m)] border p-3.5"
        style={{ borderColor: "var(--line)" }}
      >
        <span
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full"
          style={{
            background: shopStatus.data?.active ? "var(--good-100)" : "var(--clay-100)",
            color: shopStatus.data?.active ? "var(--good)" : "var(--clay)",
          }}
        >
          {shopStatus.data?.active ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
        </span>
        <div className="flex-1">
          <div className="text-[13px] font-bold" style={{ color: "var(--ink)" }}>
            {shopStatus.data?.active ? "Boutique active" : "Boutique inactive"}
          </div>
          <div className="text-[11px]" style={{ color: "var(--text-faint)" }}>
            {shopStatus.data ? `${shopStatus.data.activeListingsCount}/${shopStatus.data.maxListings} annonces · 1 $/jour` : "…"}
          </div>
        </div>
      </Link>

      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="font-[var(--font-display)] text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
          Mes annonces
        </h3>
      </div>
      {myListings.loading && <LoadingState />}
      {myListings.error && <ErrorState message={myListings.error} onRetry={myListings.reload} />}
      {myListings.data && (
        activeListings.length ? (
          <div className="mb-5 space-y-2">
            {activeListings.map((l) => {
              const Icon = categoryIcon(l.categoryId);
              const tint = categoryTint(l.categoryId);
              return (
                <Link
                  key={l.id}
                  href={`/listings/${l.id}`}
                  className="flex items-center gap-3 rounded-[var(--radius-m)] border p-2.5"
                  style={{ borderColor: "var(--line)" }}
                >
                  <span
                    className="flex h-11 w-11 flex-none items-center justify-center rounded-[var(--radius-s)]"
                    style={{ background: tint.bg, color: tint.fg }}
                  >
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] font-bold" style={{ color: "var(--ink)" }}>{l.title}</div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <Chip variant="good">En ligne</Chip>
                    </div>
                  </div>
                  <div className="font-[var(--font-mono)] text-[12.5px] font-semibold" style={{ color: "var(--teal-700)" }}>
                    {money(l.priceFcfa)}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mb-5">
            <EmptyState>Vous n&apos;avez pas encore publié d&apos;annonce.</EmptyState>
          </div>
        )
      )}

      <LinkButton href="/publish" variant="outline" className="mb-6">
        Publier une nouvelle annonce
      </LinkButton>

      <h3 className="mb-2.5 font-[var(--font-display)] text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
        Commandes reçues
      </h3>
      <p className="mb-3 text-[11.5px]" style={{ color: "var(--text-faint)" }}>
        Une commission de {(COMMISSION_RATE * 100).toFixed(0)}% est prélevée par GEM Market sur chaque vente réglée en séquestre.
      </p>
      {sales.loading && <LoadingState />}
      {sales.error && <ErrorState message={sales.error} onRetry={sales.reload} />}
      {sales.data && (
        sales.data.length === 0 ? (
          <EmptyState>Aucune commande reçue pour le moment.</EmptyState>
        ) : (
          <div className="space-y-2.5">
            {sales.data.map((o) => {
              const net = o.amountFcfa - o.platformFeeFcfa;
              return (
                <div key={o.id} className="rounded-[var(--radius-m)] border p-3.5" style={{ borderColor: "var(--line)" }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-bold" style={{ color: "var(--ink)" }}>
                        {o.listing?.title || "Annonce"}
                      </div>
                      <div className="mt-0.5 text-[11px]" style={{ color: "var(--text-faint)" }}>
                        {formatDate(o.createdAt)}
                      </div>
                    </div>
                    {o.status === "released" ? (
                      <Chip variant="good" icon={<CheckCircle2 size={11} />}>Payé — {money(net)}</Chip>
                    ) : (
                      <Chip variant="service" icon={<Clock size={11} />}>En attente de confirmation</Chip>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
