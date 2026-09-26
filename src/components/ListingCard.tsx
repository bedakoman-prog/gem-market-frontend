import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";
import type { Listing } from "@/lib/types";
import { priceOfCard, sellerLocation } from "@/lib/format";
import { categoryIcon, categoryTint } from "@/lib/categoryMeta";
import { Chip, typeChipProps } from "./Chip";

function Thumb({ listing }: { listing: Listing }) {
  const Icon = categoryIcon(listing.categoryId);
  const tint = categoryTint(listing.categoryId);
  const photo = listing.media?.[0]?.url;
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt={listing.title} className="h-full w-full object-cover" />;
  }
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ background: tint.bg, color: tint.fg }}>
      <Icon size={28} strokeWidth={1.7} />
    </div>
  );
}

// Petite ligne "catégorie" au-dessus du titre (ex. "SANTÉ · CARDIOLOGIE"), inspirée
// des maquettes de référence (Alibaba, AGBATIA) qui donnent tout de suite un repère
// de classement au produit avant même de lire son nom.
function CategoryEyebrow({ listing }: { listing: Listing }) {
  if (!listing.category?.label) return null;
  return (
    <div
      className="mb-1 truncate text-[10px] font-bold uppercase tracking-wide"
      style={{ color: "var(--text-faint)" }}
    >
      {listing.category.label}
    </div>
  );
}

// Carte compacte pour les rangées horizontales (ex. "Espaces à louer près de vous").
export function ListingRowCard({ listing }: { listing: Listing }) {
  const verified = listing.seller?.verified;
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="w-[176px] flex-none overflow-hidden rounded-[var(--radius-m)] border bg-[var(--surface)] shadow-sm transition-shadow hover:shadow-md"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="relative h-28">
        <Thumb listing={listing} />
        {verified && (
          <span className="absolute left-1.5 top-1.5">
            <Chip variant="verified" icon={<ShieldCheck size={11} />}>
              Vérifié
            </Chip>
          </span>
        )}
      </div>
      <div className="p-3">
        <CategoryEyebrow listing={listing} />
        <div className="line-clamp-2 min-h-[2.6em] text-[13.5px] font-bold" style={{ color: "var(--ink)" }}>
          {listing.title}
        </div>
        <div className="mt-1.5 font-mono text-[14.5px] font-bold" style={{ color: "var(--teal-700)" }}>
          {priceOfCard(listing)}
        </div>
        {sellerLocation(listing.seller) && (
          <div className="mt-1.5 flex items-center gap-1 text-[11.5px]" style={{ color: "var(--text-faint)" }}>
            <MapPin size={11} />
            <span className="truncate">{sellerLocation(listing.seller)}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

// Carte pour les grilles (populaire / catégorie / recherche) — agrandie et
// réorganisée (repère catégorie, prix plus visible, badge sécurité aligné avec
// la localisation) pour se rapprocher des maquettes de référence plus "premium"
// (Alibaba, AGBATIA) au lieu de rester une simple vignette compacte.
export function ListingGridCard({ listing }: { listing: Listing }) {
  const chip = typeChipProps(listing);
  const secure = listing.type === "bien" || listing.type === "service";
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="overflow-hidden rounded-[var(--radius-m)] border bg-[var(--surface)] shadow-sm transition-shadow hover:shadow-md"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="relative h-[150px]">
        <Thumb listing={listing} />
        <span className="absolute bottom-2 left-2">
          <Chip variant={chip.variant}>{chip.label}</Chip>
        </span>
      </div>
      <div className="p-3">
        <CategoryEyebrow listing={listing} />
        <div className="line-clamp-2 min-h-[2.6em] text-[13.5px] font-bold" style={{ color: "var(--ink)" }}>
          {listing.title}
        </div>
        <div className="mt-1.5 font-mono text-[15px] font-bold" style={{ color: "var(--teal-700)" }}>
          {priceOfCard(listing)}
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-1.5">
          <div className="flex min-w-0 items-center gap-1 text-[11.5px]" style={{ color: "var(--text-faint)" }}>
            <MapPin size={11} className="flex-none" />
            <span className="truncate">{sellerLocation(listing.seller)}</span>
          </div>
          {secure && (
            <div
              className="flex flex-none items-center gap-1 text-[10.5px] font-semibold"
              style={{ color: "var(--teal-700)" }}
            >
              <ShieldCheck size={11} /> Sécurisé
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
