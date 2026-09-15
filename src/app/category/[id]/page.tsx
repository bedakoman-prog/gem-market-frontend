"use client";

import { use } from "react";
import { api } from "@/lib/api";
import { useApiData } from "@/lib/useApi";
import type { Listing, Category } from "@/lib/types";
import { TopBar } from "@/components/TopBar";
import { ListingGridCard } from "@/components/ListingCard";
import { LoadingState, ErrorState, EmptyState } from "@/components/LoadingState";

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const categories = useApiData(() => api.get<Category[]>("/categories", false), []);
  const listings = useApiData(
    () => api.get<Listing[]>(`/listings?category=${encodeURIComponent(id)}`, false),
    [id],
  );

  const label = categories.data?.find((c) => c.id === id)?.label || "Catégorie";

  return (
    <div className="fade">
      <TopBar title={label} />
      {listings.loading && <LoadingState />}
      {listings.error && <ErrorState message={listings.error} onRetry={listings.reload} />}
      {listings.data && (
        listings.data.length ? (
          <div className="grid grid-cols-2 gap-2.5">
            {listings.data.map((l) => (
              <ListingGridCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <EmptyState>Aucune annonce dans cette catégorie pour le moment.</EmptyState>
        )
      )}
    </div>
  );
}
