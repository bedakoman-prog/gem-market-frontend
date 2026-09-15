import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";
import type { Listing } from "@/lib/types";
import { priceOfCard } from "@/lib/format";
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

// Carte compacte pour les rangées horizontales (ex. "Espaces à louer près de vous").
export function ListingRowCard({ listing }: { listing: Listing }) {
  const verified = listing.seller?.verified;
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="w-[168px] flex-none overflow-hidden rounded-[var(--radius-m)] border bg-[var(--surface)] shadow-sm"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="relative h-24">
        <Thumb listing={listing} />
        {verified && (
          <span className="absolute left-1.5 top-1.5">
            <Chip variant="verified" icon={<ShieldCheck size={11} />}>
              Vérifié
            </Chip>
          </span>
        )}
      </div>
      <div className="p-2.5">
        <div className="line-clamp-2 min-h-[2.6em] text-[12.5px] font-bold" style={{ color: "var(--ink)" }}>
          {listing.title}
        </div>
        <div className="mt-1 font-mono text-[12.5px] font-semibold" style={{ color: "var(--teal-700)" }}>
          {priceOfCard(listing)}
        </div>
        <div className="mt-1 flex items-center gap-1 text-[10.5px]" style={{ color: "var(--text-faint)" }}>
          <MapPin size={11} />
          {listing.seller?.city || "Abidjan"}
        </div>
      </div>
    </Link>
  );
}

// Carte pour les grilles 2 colonnes (populaire / catégorie / recherche).
export function ListingGridCard({ listing }: { listing: Listing }) {
  const chip = typeChipProps(listing);
  const secure = listing.type === "bien" || listing.type === "service";
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="overflow-hidden rounded-[var(--radius-m)] border bg-[var(--surface)]"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="relative h-[104px]">
        <Thumb listing={listing} />
        <span className="absolute bottom-1.5 left-1.5">
          <Chip variant={chip.variant}>{chip.label}</Chip>
        </span>
      </div>
      <div className="p-2.5">
        <div className="line-clamp-2 min-h-[2.6em] text-[12.5px] font-bold" style={{ color: "var(--ink)" }}>
          {listing.title}
        </div>
        <div className="mt-1 font-mono text-[12.5px] font-semibold" style={{ color: "var(--teal-700)" }}>
          {priceOfCard(listing)}
        </div>
        {secure && (
          <div className="mt-1 flex items-center gap-1 text-[10.5px] font-semibold" style={{ color: "var(--teal-700)" }}>
            <ShieldCheck size={11} /> Paiement sécurisé
          </div>
        )}
        <div className="mt-1 flex items-center gap-1 text-[10.5px]" style={{ color: "var(--text-faint)" }}>
          <MapPin size={11} />
          {listing.seller?.city || "Abidjan"}
        </div>
      </div>
    </Link>
  );
}
