"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flag, MapPin, Eye, ShieldCheck, Phone, MessageCircle, Star } from "lucide-react";
import { api } from "@/lib/api";
import { useApiData } from "@/lib/useApi";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import type { Listing, Conversation } from "@/lib/types";
import { priceOf } from "@/lib/format";
import { categoryIcon, categoryTint } from "@/lib/categoryMeta";
import { Chip, typeChipProps } from "@/components/Chip";
import { Button, LinkButton } from "@/components/Button";
import { TopBar } from "@/components/TopBar";
import { LoadingState, ErrorState } from "@/components/LoadingState";

const CANNED_FIRST_MESSAGE = "Bonjour, cette annonce est-elle toujours disponible ?";

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, me } = useAuth();
  const { toast } = useToast();
  const [contacting, setContacting] = useState(false);

  const { data: listing, loading, error, reload } = useApiData(
    () => api.get<Listing>(`/listings/${id}`, false),
    [id],
  );

  async function handleContact() {
    if (!isAuthenticated) {
      router.push(`/login?next=/listings/${id}`);
      return;
    }
    if (!listing) return;
    setContacting(true);
    try {
      const res = await api.post<{ conversation: Conversation }>("/conversations", {
        listingId: listing.id,
        body: CANNED_FIRST_MESSAGE,
      });
      router.push(`/messages/${res.conversation.id}`);
    } catch {
      toast("Impossible d'ouvrir la conversation pour le moment.");
    } finally {
      setContacting(false);
    }
  }

  function handlePrimaryAction() {
    if (!isAuthenticated) {
      router.push(`/login?next=/listings/${id}`);
      return;
    }
    if (listing?.type === "espace") router.push(`/listings/${id}/book`);
    else router.push(`/listings/${id}/buy`);
  }

  if (loading) return <LoadingState />;
  if (error || !listing) return <ErrorState message={error || "Annonce introuvable."} onRetry={reload} />;

  const Icon = categoryIcon(listing.categoryId);
  const tint = categoryTint(listing.categoryId);
  const chip = typeChipProps(listing);
  const isOwn = me?.id === listing.sellerId;
  const phoneDigits = (listing.seller?.phone || "").replace(/[^0-9+]/g, "");

  return (
    <div className="fade">
      <TopBar
        title="Annonce"
        right={
          <Link
            href={`/report?sellerId=${listing.sellerId}&listingId=${listing.id}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border"
            style={{ borderColor: "var(--line)", background: "var(--surface)", color: "var(--clay)" }}
          >
            <Flag size={16} />
          </Link>
        }
      />

      <div
        className="mb-3 flex h-[190px] items-center justify-center overflow-hidden rounded-[var(--radius-l)]"
        style={{ background: tint.bg, color: tint.fg }}
      >
        {listing.media?.[0]?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.media[0].url} alt={listing.title} className="h-full w-full object-cover" />
        ) : (
          <Icon size={56} strokeWidth={1.4} />
        )}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <Chip variant={chip.variant}>{chip.label}</Chip>
        <Chip icon={<Eye size={11} />}>{listing.views ?? 0} vues</Chip>
        {(listing.type === "bien" || listing.type === "service") && (
          <Chip variant="secure" icon={<ShieldCheck size={11} />}>Achat sécurisé</Chip>
        )}
      </div>

      <h1 className="mb-1.5 font-[var(--font-display)] text-[21px] font-semibold leading-tight" style={{ color: "var(--ink)" }}>
        {listing.title}
      </h1>
      <div className="mb-1 font-[var(--font-mono)] text-[17px] font-semibold" style={{ color: "var(--teal-700)" }}>
        {priceOf(listing)}
      </div>
      <div className="mb-4 flex items-center gap-1 text-[12px]" style={{ color: "var(--text-faint)" }}>
        <MapPin size={13} />
        {listing.seller?.city || "Abidjan"}
      </div>

      {listing.type === "espace" && listing.specs && listing.specs.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 font-[var(--font-display)] text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
            Détails
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {listing.specs.map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 rounded-[var(--radius-s)] border p-2.5 text-center"
                style={{ borderColor: "var(--line)" }}
              >
                <span className="text-[11px] font-semibold" style={{ color: "var(--text-dim)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isOwn && (
        <div
          className="mb-4 rounded-[var(--radius-m)] border p-3.5"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 flex-none items-center justify-center rounded-full font-bold"
              style={{ background: "var(--teal-100)", color: "var(--teal-700)" }}
            >
              {listing.seller?.name?.slice(0, 2).toUpperCase() || "?"}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[13.5px] font-bold" style={{ color: "var(--ink)" }}>
                {listing.seller?.name || "Vendeur"}
                {listing.seller?.verified && <ShieldCheck size={13} color="var(--good)" />}
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-[11.5px]" style={{ color: "var(--text-faint)" }}>
                <Star size={11} fill="var(--amber)" color="var(--amber)" />
                {listing.seller?.rating?.toFixed(1) ?? "—"} ({listing.seller?.ratingsCount ?? 0} avis)
              </div>
            </div>
            {listing.seller?.verified ? (
              <Chip variant="verified">Vérifié</Chip>
            ) : (
              <Chip variant="neutral">Non vérifié</Chip>
            )}
          </div>
        </div>
      )}

      <div className="mb-5">
        <h3 className="mb-2 font-[var(--font-display)] text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
          Description
        </h3>
        <p className="whitespace-pre-line text-[13.5px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
          {listing.description}
        </p>
      </div>

      {isOwn ? (
        <div
          className="mb-4 rounded-[var(--radius-m)] border p-3.5 text-center text-[12.5px]"
          style={{ borderColor: "var(--line)", color: "var(--text-faint)" }}
        >
          C&apos;est votre annonce — gérez-la depuis votre{" "}
          <Link href="/dashboard" className="font-bold underline">
            espace vendeur
          </Link>
          .
        </div>
      ) : (
        <>
          {listing.type === "espace" && (
            <div
              className="mb-4 rounded-[var(--radius-m)] p-3.5"
              style={{ background: "var(--teal-100)", color: "var(--teal-900)" }}
            >
              <p className="mb-3 text-[12.5px] leading-relaxed">
                Réservation payable par carte bancaire, directement dans l&apos;application.
              </p>
              <Button variant="amber" onClick={handlePrimaryAction}>
                Réserver cet espace
              </Button>
            </div>
          )}

          {(listing.type === "bien" || listing.type === "service") && (
            <div
              className="mb-4 rounded-[var(--radius-m)] p-3.5"
              style={{ background: "var(--teal-100)", color: "var(--teal-900)" }}
            >
              <p className="mb-3 text-[12.5px] leading-relaxed">
                <strong>Paiement sécurisé :</strong> votre argent est conservé par GEM Market et n&apos;est versé au
                vendeur qu&apos;après votre confirmation de réception. En cas de problème, vous pouvez signaler la
                commande pour être remboursé.
              </p>
              <Button variant="amber" onClick={handlePrimaryAction}>
                {listing.type === "bien" ? "Acheter maintenant" : "Commander ce service"}
              </Button>
            </div>
          )}

          <div className="mb-2 grid grid-cols-3 gap-2">
            <a
              href={`tel:${phoneDigits}`}
              className="flex flex-col items-center gap-1 rounded-[var(--radius-s)] border py-2.5 text-[11.5px] font-semibold"
              style={{ borderColor: "var(--line)", color: "var(--teal-700)" }}
            >
              <Phone size={16} /> Appeler
            </a>
            <a
              href={`https://wa.me/${phoneDigits.replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 rounded-[var(--radius-s)] border py-2.5 text-[11.5px] font-semibold"
              style={{ borderColor: "var(--line)", color: "var(--good)" }}
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <button
              onClick={handleContact}
              disabled={contacting}
              className="flex flex-col items-center gap-1 rounded-[var(--radius-s)] border py-2.5 text-[11.5px] font-semibold disabled:opacity-60"
              style={{ borderColor: "var(--line)", color: "var(--ink)" }}
            >
              <MessageCircle size={16} /> {listing.type === "emploi" ? (listing.jobKind === "recherche" ? "Contacter" : "Postuler") : "Message"}
            </button>
          </div>
        </>
      )}

      <LinkButton
        href={`/report?sellerId=${listing.sellerId}&listingId=${listing.id}`}
        variant="ghost"
        className="mt-2 text-center"
      >
        <Flag size={13} /> Signaler ce vendeur
      </LinkButton>
    </div>
  );
}
