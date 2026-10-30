"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Flag, User as UserIcon, CheckCircle2, XCircle, Ban, Clock3, BadgeCheck } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useApiData } from "@/lib/useApi";
import { useRequireAdmin } from "@/lib/useRequireAdmin";
import { useToast } from "@/lib/toast";
import type { AdminReport, AdminSeller, Listing } from "@/lib/types";
import { money } from "@/lib/format";

// Côté admin on affiche le nom de boutique (visible des acheteurs) suivi du
// nom réel du compte entre parenthèses quand il diffère, pour garder une
// identification fiable de la personne (modération/litiges).
function adminSellerLabel(seller?: { name?: string | null; shopName?: string | null } | null): string {
  if (!seller) return "—";
  const shop = seller.shopName?.trim();
  if (shop && shop !== seller.name) return `${shop} (${seller.name})`;
  return seller.name || "—";
}
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/Button";
import { LoadingState, EmptyState, ErrorState } from "@/components/LoadingState";

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function ReportCard({ report, onChanged }: { report: AdminReport; onChanged: () => void }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  async function run(action: string, fn: () => Promise<unknown>, successMsg: string) {
    setBusy(action);
    try {
      await fn();
      toast(successMsg);
      onChanged();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Action impossible, réessayez.");
    } finally {
      setBusy(null);
    }
  }

  const markReviewed = () =>
    run("reviewed", () => api.post(`/admin/reports/${report.id}/review`, { status: "reviewed" }), "Signalement marqué traité.");
  const dismiss = () =>
    run("dismissed", () => api.post(`/admin/reports/${report.id}/review`, { status: "dismissed" }), "Signalement rejeté.");
  const rejectListing = () =>
    run(
      "rejectListing",
      async () => {
        await api.post(`/admin/listings/${report.listingId}/reject`);
        await api.post(`/admin/reports/${report.id}/review`, { status: "reviewed" });
      },
      "Annonce rejetée et signalement traité.",
    );

  return (
    <div className="mb-3 rounded-[var(--radius-m)] border p-3.5" style={{ borderColor: "var(--line)" }}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--clay)" }}>
          <Flag size={12} />
          Signalement
        </div>
        <div className="text-[12px]" style={{ color: "var(--text-faint)" }}>
          {formatDate(report.createdAt)}
        </div>
      </div>

      <p className="mb-2.5 text-[13.5px]" style={{ color: "var(--text)" }}>
        {report.reason}
      </p>

      <div className="mb-3 rounded-[var(--radius-s)] p-2.5 text-[12.5px]" style={{ background: "var(--surface-2)" }}>
        <div style={{ color: "var(--text-faint)" }}>
          Signalé par <span style={{ color: "var(--text)" }}>{report.reporter?.name || "Utilisateur"}</span>
        </div>
        {report.listing ? (
          <div className="mt-1">
            Annonce :{" "}
            <Link href={`/listings/${report.listingId}`} className="font-semibold underline" style={{ color: "var(--teal-700)" }}>
              {report.listing.title}
            </Link>
          </div>
        ) : report.seller ? (
          <div className="mt-1 flex items-center gap-1.5">
            <UserIcon size={12} />
            Vendeur : <span className="font-semibold" style={{ color: "var(--text)" }}>{adminSellerLabel(report.seller)}</span>
            {report.seller.phone ? <span style={{ color: "var(--text-faint)" }}> — {report.seller.phone}</span> : null}
          </div>
        ) : (
          <div className="mt-1 italic" style={{ color: "var(--text-faint)" }}>
            Aucune annonce ni vendeur associé.
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" full={false} className="px-3 py-2 text-[12px]" disabled={!!busy} onClick={markReviewed}>
          <CheckCircle2 size={14} />
          {busy === "reviewed" ? "…" : "Marquer traité"}
        </Button>
        <Button variant="ghost" full={false} className="px-3 py-2 text-[12px]" disabled={!!busy} onClick={dismiss}>
          <XCircle size={14} />
          {busy === "dismissed" ? "…" : "Rejeter le signalement"}
        </Button>
        {report.listingId && (
          <Button variant="danger-outline" full={false} className="px-3 py-2 text-[12px]" disabled={!!busy} onClick={rejectListing}>
            <Ban size={14} />
            {busy === "rejectListing" ? "…" : "Rejeter l'annonce"}
          </Button>
        )}
      </div>
    </div>
  );
}

function PendingMedia({ media }: { media: Listing["media"] }) {
  if (!media || media.length === 0) {
    return (
      <div
        className="mb-3 rounded-[var(--radius-s)] border border-dashed p-3 text-center text-[12.5px]"
        style={{ borderColor: "var(--line)", color: "var(--text-faint)" }}
      >
        Aucune photo ni vidéo ajoutée par le vendeur.
      </div>
    );
  }
  return (
    <div className="mb-3 flex gap-2 overflow-x-auto">
      {media.map((m) => (
        <div
          key={m.id}
          className="h-20 w-20 flex-none overflow-hidden rounded-[var(--radius-s)]"
          style={{ background: "var(--surface-2)" }}
        >
          {m.type === "video" ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={m.url} className="h-full w-full object-cover" muted />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.url} alt="" className="h-full w-full object-cover" />
          )}
        </div>
      ))}
    </div>
  );
}

function PendingListingCard({ listing, onChanged }: { listing: Listing; onChanged: () => void }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  async function run(action: string, fn: () => Promise<unknown>, successMsg: string) {
    setBusy(action);
    try {
      await fn();
      toast(successMsg);
      onChanged();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Action impossible, réessayez.");
    } finally {
      setBusy(null);
    }
  }

  const approve = () =>
    run("approve", () => api.post(`/admin/listings/${listing.id}/approve`), "Annonce approuvée et mise en ligne.");
  const reject = () =>
    run("reject", () => api.post(`/admin/listings/${listing.id}/reject`), "Annonce rejetée.");

  return (
    <div className="mb-3 rounded-[var(--radius-m)] border p-3.5" style={{ borderColor: "var(--line)" }}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--amber-600)" }}>
          <Clock3 size={12} />
          En attente de validation
        </div>
        <div className="text-[12px]" style={{ color: "var(--text-faint)" }}>
          {formatDate(listing.createdAt)}
        </div>
      </div>

      <Link href={`/listings/${listing.id}`} className="mb-1 block text-[13.5px] font-bold underline" style={{ color: "var(--ink)" }}>
        {listing.title}
      </Link>
      <p className="mb-2.5 line-clamp-2 text-[12.5px]" style={{ color: "var(--text-dim)" }}>
        {listing.description}
      </p>

      <PendingMedia media={listing.media} />

      <div className="mb-3 rounded-[var(--radius-s)] p-2.5 text-[12.5px]" style={{ background: "var(--surface-2)" }}>
        <div className="flex items-center gap-1.5" style={{ color: "var(--text-faint)" }}>
          <UserIcon size={12} />
          Vendeur : <span className="font-semibold" style={{ color: "var(--text)" }}>{adminSellerLabel(listing.seller)}</span>
          {listing.seller?.phone ? <span> — {listing.seller.phone}</span> : null}
        </div>
        <div className="mt-1" style={{ color: "var(--text-faint)" }}>
          Prix : <span className="font-semibold" style={{ color: "var(--text)" }}>{money(listing.priceFcfa)}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" full={false} className="px-3 py-2 text-[12px]" disabled={!!busy} onClick={approve}>
          <CheckCircle2 size={14} />
          {busy === "approve" ? "…" : "Approuver"}
        </Button>
        <Button variant="danger-outline" full={false} className="px-3 py-2 text-[12px]" disabled={!!busy} onClick={reject}>
          <Ban size={14} />
          {busy === "reject" ? "…" : "Rejeter"}
        </Button>
      </div>
    </div>
  );
}

// Le badge "vérifié" doit uniquement signifier qu'un modérateur a lui-même
// constaté que la boutique/l'annonce existe réellement — jamais un état
// automatique à l'inscription. Cette liste permet de cocher/décocher ce
// badge après vérification (appel, visite, pièce justificative, etc.).
function SellerVerificationRow({ seller, onChanged }: { seller: AdminSeller; onChanged: () => void }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      if (seller.verified) {
        await api.post(`/admin/sellers/${seller.id}/unverify`);
        toast("Badge « vérifié » retiré.");
      } else {
        await api.post(`/admin/sellers/${seller.id}/verify`);
        toast("Vendeur marqué comme vérifié.");
      }
      onChanged();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Action impossible, réessayez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="mb-2 flex items-center justify-between gap-2 rounded-[var(--radius-m)] border p-3"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[13.5px] font-semibold" style={{ color: "var(--ink)" }}>
          {adminSellerLabel(seller)}
          {seller.verified && <BadgeCheck size={14} style={{ color: "var(--teal-700)" }} />}
        </div>
        <div className="text-[12px]" style={{ color: "var(--text-faint)" }}>
          {seller.phone}
          {seller._count ? ` — ${seller._count.listings} annonce${seller._count.listings > 1 ? "s" : ""}` : ""}
        </div>
      </div>
      <Button
        variant={seller.verified ? "danger-outline" : "outline"}
        full={false}
        className="flex-none px-3 py-2 text-[12px]"
        disabled={busy}
        onClick={toggle}
      >
        {busy ? "…" : seller.verified ? "Retirer la vérification" : "Marquer vérifié"}
      </Button>
    </div>
  );
}

export default function AdminPage() {
  const { ready } = useRequireAdmin();
  const reports = useApiData(() => (ready ? api.get<AdminReport[]>("/admin/reports") : Promise.resolve([])), [ready]);
  const pendingListings = useApiData(
    () => (ready ? api.get<Listing[]>("/admin/listings/pending") : Promise.resolve([])),
    [ready],
  );
  const sellers = useApiData(
    () => (ready ? api.get<AdminSeller[]>("/admin/sellers") : Promise.resolve([])),
    [ready],
  );

  if (!ready) return <LoadingState label="Vérification des droits d'accès…" />;

  return (
    <div className="fade">
      <TopBar
        title="Modération"
        right={
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: "var(--teal-100)", color: "var(--teal-700)" }}
          >
            <ShieldCheck size={16} />
          </span>
        }
      />

      <h3 className="mb-2.5 font-[var(--font-display)] text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
        Annonces en attente de validation
      </h3>
      <p className="mb-3 text-[12.5px]" style={{ color: "var(--text-faint)" }}>
        Toute nouvelle annonce doit être approuvée avant sa mise en ligne (pas de paiement d&apos;abonnement boutique
        pendant les 3 mois de lancement — cette validation manuelle sert de garde-fou à la place).
      </p>
      {pendingListings.loading && <LoadingState label="Chargement des annonces en attente…" />}
      {pendingListings.error && <ErrorState message={pendingListings.error} onRetry={pendingListings.reload} />}
      {!pendingListings.loading && !pendingListings.error && (!pendingListings.data || pendingListings.data.length === 0) && (
        <EmptyState>Aucune annonce en attente. 👍</EmptyState>
      )}
      {!pendingListings.loading &&
        !pendingListings.error &&
        pendingListings.data?.map((l) => (
          <PendingListingCard key={l.id} listing={l} onChanged={pendingListings.reload} />
        ))}

      <h3 className="mb-2.5 mt-6 font-[var(--font-display)] text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
        Signalements
      </h3>
      <p className="mb-4 text-[12.5px]" style={{ color: "var(--text-faint)" }}>
        File de signalements en attente. Périmètre actuel : signalements et rejet d&apos;annonce uniquement — la
        gestion financière, vendeurs et support se fait encore hors interface.
      </p>

      {reports.loading && <LoadingState label="Chargement des signalements…" />}
      {reports.error && <ErrorState message={reports.error} onRetry={reports.reload} />}
      {!reports.loading && !reports.error && (!reports.data || reports.data.length === 0) && (
        <EmptyState>Aucun signalement en attente. 👍</EmptyState>
      )}
      {!reports.loading &&
        !reports.error &&
        reports.data?.map((r) => <ReportCard key={r.id} report={r} onChanged={reports.reload} />)}

      <h3 className="mb-2.5 mt-6 font-[var(--font-display)] text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
        Vérification des vendeurs
      </h3>
      <p className="mb-4 text-[12.5px]" style={{ color: "var(--text-faint)" }}>
        Le badge « vérifié » doit uniquement être coché après qu&apos;un modérateur a constaté que la boutique ou
        l&apos;annonce existe réellement — plus jamais automatiquement à l&apos;inscription.
      </p>
      {sellers.loading && <LoadingState label="Chargement des vendeurs…" />}
      {sellers.error && <ErrorState message={sellers.error} onRetry={sellers.reload} />}
      {!sellers.loading && !sellers.error && (!sellers.data || sellers.data.length === 0) && (
        <EmptyState>Aucun vendeur pour le moment.</EmptyState>
      )}
      {!sellers.loading &&
        !sellers.error &&
        sellers.data?.map((s) => <SellerVerificationRow key={s.id} seller={s} onChanged={sellers.reload} />)}
    </div>
  );
}
