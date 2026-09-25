"use client";

import { use } from "react";
import Link from "next/link";
import { MapPin, ShieldCheck, Star } from "lucide-react";
import { api } from "@/lib/api";
import { useApiData } from "@/lib/useApi";
import type { SellerProfile, Listing } from "@/lib/types";
import { memberSince, sellerDisplayName } from "@/lib/format";
import { TopBar } from "@/components/TopBar";
import { ListingGridCard } from "@/components/ListingCard";
import { LoadingState, ErrorState, EmptyState } from "@/components/LoadingState";
import { Chip } from "@/components/Chip";

export default function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: seller, loading: sellerLoading, error: sellerError, reload: reloadSeller } = useApiData(
    () => api.get<SellerProfile>(`/sellers/${id}`, false),
    [id],
  );
  const { data: listings, loading: listingsLoading, error: listingsError, reload: reloadListings } = useApiData(
    () => api.get<Listing[]>(`/sellers/${id}/listings`, false),
    [id],
  );

  return (
    <div className="fade">
      <TopBar title="Boutique" />

      {sellerLoading && <LoadingState label="Chargement de la boutique…" />}
      {sellerError && <ErrorState message={sellerError} onRetry={reloadSeller} />}

      {seller && (
        <div className="mb-5 rounded-[var(--radius-m)] border p-4" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 flex-none items-center justify-center rounded-full text-[18px] font-bold" style={{ background: "var(--teal-100)", color: "var(--teal-700)" }}>
              {sellerDisplayName(seller).slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[16px] font-bold" style={{ color: "var(--ink)" }}>
                {sellerDisplayName(seller)}
                {seller.verified && <ShieldCheck size={15} color="var(--good)" />}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[12px]" style={{ color: "var(--text-faint)" }}>
                <MapPin size={12} />
                {seller.city || "Abidjan"}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[12px]" style={{ color: "var(--text-faint)" }}>
                <Star size={12} fill="var(--amber)" color="var(--amber)" />
                {seller.rating?.toFixed(1) ?? "—"} ({seller.ratingsCount ?? 0} avis)
              </div>
            </div>
            {seller.verified ? <Chip variant="verified">Vérifié</Chip> : <Chip variant="neutral">Non vérifié</Chip>}
          </div>
          <div className="mt-3 flex items-center justify-between border-t pt-3 text-[12px]" style={{ borderColor: "var(--line)", color: "var(--text-faint)" }}>
            <span>{memberSince(seller.createdAt)}</span>
            <span>{seller.activeListingsCount} annonce{seller.activeListingsCount > 1 ? "s" : ""} active{seller.activeListingsCount > 1 ? "s" : ""}</span>
          </div>
        </div>
      )}

      <h3 className="mb-3 font-[var(--font-display)] text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
        Annonces de cette boutique
      </h3>

      {listingsLoading && <LoadingState />}
      {listingsError && <ErrorState message={listingsError} onRetry={reloadListings} />}
      {listings && (
        listings.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {listings.map((l) => <ListingGridCard key={l.id} listing={l} />)}
          </div>
        ) : (
          <EmptyState>Cette boutique n&apos;a aucune annonce active pour le moment.</EmptyState>
        )
      )}
    </div>
  );
}

