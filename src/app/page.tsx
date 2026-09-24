"use client";

import Link from "next/link";
import { Search, MessageCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useApiData } from "@/lib/useApi";
import type { Category, Listing } from "@/lib/types";
import { categoryIcon, categoryTint, sortByKnownOrder } from "@/lib/categoryMeta";
import { ListingRowCard, ListingGridCard } from "@/components/ListingCard";
import { LoadingState, ErrorState, EmptyState } from "@/components/LoadingState";

export default function HomePage() {
  const categories = useApiData(() => api.get<Category[]>("/categories", false), []);
  const listings = useApiData(() => api.get<Listing[]>("/listings", false), []);

  const spaces = (listings.data || []).filter((l) => l.type === "espace");
  const popular = [...(listings.data || [])].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 8);

  return (
    <div className="fade">
      <div className="flex items-center justify-between pb-3.5 pt-1">
        <div className="flex items-center gap-2">
          <span
            className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] font-[var(--font-display)] text-[15px] font-bold"
            style={{ background: "linear-gradient(155deg, var(--teal-700), var(--teal-900))", color: "var(--amber)" }}
          >
            T
          </span>
          <span className="font-[var(--font-display)] text-[19px] font-bold" style={{ color: "var(--ink)" }}>
            TROUVE TOUT
          </span>
        </div>
        <Link
          href="/messages"
          className="flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          <MessageCircle size={17} />
        </Link>
      </div>

      <Link
        href="/search"
        className="mb-4 flex items-center gap-2 rounded-full border px-3.5 py-2.5 text-[13.5px]"
        style={{ borderColor: "var(--line)", background: "var(--surface)", color: "var(--text-faint)" }}
      >
        <Search size={16} />
        Rechercher un bien, un service, un espace…
      </Link>

      <div className="mb-2.5 mt-4 flex items-baseline justify-between">
        <h3 className="font-[var(--font-display)] text-[15.5px] font-semibold" style={{ color: "var(--ink)" }}>
          Catégories
        </h3>
      </div>
      {categories.loading && <LoadingState label="Chargement des catégories…" />}
      {categories.error && <ErrorState message={categories.error} onRetry={categories.reload} />}
      {categories.data && (
        <div className="grid grid-cols-4 gap-x-2 gap-y-3 sm:grid-cols-6 md:grid-cols-8">
          {sortByKnownOrder(categories.data).map((c) => {
            const Icon = categoryIcon(c.id);
            const tint = categoryTint(c.id);
            return (
              <Link key={c.id} href={`/category/${c.id}`} className="flex flex-col items-center gap-1.5 text-center">
                <span
                  className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl border"
                  style={{ background: tint.bg, color: tint.fg, borderColor: "transparent" }}
                >
                  <Icon size={21} strokeWidth={1.8} />
                </span>
                <span className="text-[10.5px] font-semibold leading-tight" style={{ color: "var(--text-dim)" }}>
                  {c.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mb-2.5 mt-5 flex items-baseline justify-between">
        <h3 className="font-[var(--font-display)] text-[15.5px] font-semibold" style={{ color: "var(--ink)" }}>
          Espaces à louer près de vous
        </h3>
        <Link href="/category/espace" className="text-[11.5px] font-semibold" style={{ color: "var(--teal-700)" }}>
          Tout voir
        </Link>
      </div>
      {listings.loading && <LoadingState label="Chargement des annonces…" />}
      {listings.error && <ErrorState message={listings.error} onRetry={listings.reload} />}
      {listings.data && (
        spaces.length ? (
          <div className="hide-scrollbar -mx-0.5 flex gap-2.5 overflow-x-auto px-0.5 pb-2">
            {spaces.map((l) => (
              <ListingRowCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <EmptyState>Aucun espace disponible pour le moment.</EmptyState>
        )
      )}

      <div className="mb-2.5 mt-5 flex items-baseline justify-between">
        <h3 className="font-[var(--font-display)] text-[15.5px] font-semibold" style={{ color: "var(--ink)" }}>
          Annonces populaires
        </h3>
        <Link href="/search" className="text-[11.5px] font-semibold" style={{ color: "var(--teal-700)" }}>
          Tout voir
        </Link>
      </div>
      {listings.data && (
        popular.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {popular.map((l) => (
              <ListingGridCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <EmptyState>Aucune annonce publiée pour le moment.</EmptyState>
        )
      )}
    </div>
  );
}
