"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useApiData } from "@/lib/useApi";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { Category, Listing, ShopStatus } from "@/lib/types";
import { sortByKnownOrder } from "@/lib/categoryMeta";
import { Button, LinkButton } from "@/components/Button";
import { LoadingState, ErrorState } from "@/components/LoadingState";

type DraftType = "bien" | "service" | "espace" | "emploi";
type JobKind = "offre" | "recherche";

const TYPE_OPTIONS: { id: DraftType; label: string }[] = [
  { id: "bien", label: "Un bien" },
  { id: "service", label: "Un service" },
  { id: "espace", label: "Un espace" },
  { id: "emploi", label: "Un emploi" },
];

export default function PublishPage() {
  const { ready } = useRequireAuth();
  const router = useRouter();

  const categories = useApiData(() => api.get<Category[]>("/categories", false), []);
  const shopStatus = useApiData(() => (ready ? api.get<ShopStatus>("/shop/status") : Promise.resolve(null)), [ready]);

  const [type, setType] = useState<DraftType>("bien");
  const [jobKind, setJobKind] = useState<JobKind>("offre");
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceFcfa, setPriceFcfa] = useState("");
  const [surface, setSurface] = useState("");
  const [capacity, setCapacity] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const needsShop = type !== "espace";
  const shopBlocked = needsShop && shopStatus.data && !shopStatus.data.active;
  const shopFull =
    needsShop && shopStatus.data?.active && shopStatus.data.activeListingsCount >= shopStatus.data.maxListings;

  const titlePlaceholder =
    type === "espace"
      ? "Studio meublé à louer, Cocody"
      : type === "service"
        ? "Cours de soutien scolaire à domicile"
        : type === "emploi"
          ? jobKind === "recherche"
            ? "Comptable disponible immédiatement"
            : "Développeur web junior (H/F)"
          : "Chaussures de sport neuves, taille 42";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setBusy(true);
    try {
      const specs =
        type === "espace" && (surface || capacity)
          ? [
              ...(surface ? [{ icon: "ic-ruler", label: surface }] : []),
              ...(capacity ? [{ icon: "ic-user", label: capacity }] : []),
            ]
          : undefined;

      const listing = await api.post<Listing>("/listings", {
        categoryId,
        type,
        jobKind: type === "emploi" ? jobKind : undefined,
        title,
        description,
        priceFcfa: Number(priceFcfa) || 0,
        specs,
      });
      router.push(`/listings/${listing.id}?published=1`);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Impossible de publier l'annonce.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <LoadingState label="Vérification de la connexion…" />;

  return (
    <div className="fade">
      <h2 className="pb-3 pt-1 font-[var(--font-display)] text-[18px] font-semibold" style={{ color: "var(--ink)" }}>
        Publier une annonce
      </h2>

      <div
        className="mb-4 flex items-start gap-2.5 rounded-[var(--radius-m)] p-3.5 text-[12px] leading-relaxed"
        style={{ background: "var(--clay-100)", color: "var(--clay)" }}
      >
        <ShieldAlert size={16} className="mt-0.5 flex-none" />
        <div>
          <strong>Articles strictement interdits :</strong> produits pharmaceutiques et médicaments, drogues et
          substances illicites, armes à feu et munitions. Toute annonce détectée sera refusée automatiquement.
        </div>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-1.5">
        {TYPE_OPTIONS.map((t) => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            className="rounded-[var(--radius-s)] border py-2 text-[11px] font-bold"
            style={
              type === t.id
                ? { background: "var(--teal-700)", color: "#fff", borderColor: "var(--teal-700)" }
                : { borderColor: "var(--line)", color: "var(--text-dim)" }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {type === "emploi" && (
        <div className="mb-4 grid grid-cols-2 gap-1.5">
          {(["offre", "recherche"] as JobKind[]).map((k) => (
            <button
              key={k}
              onClick={() => setJobKind(k)}
              className="rounded-[var(--radius-s)] border py-2 text-[11.5px] font-bold"
              style={
                jobKind === k
                  ? { background: "var(--good-100)", color: "var(--good)", borderColor: "var(--good)" }
                  : { borderColor: "var(--line)", color: "var(--text-dim)" }
              }
            >
              {k === "offre" ? "Offre d'emploi" : "Recherche d'emploi"}
            </button>
          ))}
        </div>
      )}

      {shopStatus.loading && needsShop ? (
        <LoadingState label="Vérification de votre boutique…" />
      ) : shopBlocked ? (
        <div
          className="rounded-[var(--radius-m)] border p-4 text-center"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          <p className="mb-3 text-[13px]" style={{ color: "var(--text-dim)" }}>
            Publier un bien, un service ou une offre d&apos;emploi nécessite un abonnement boutique actif
            (1 $/jour, jusqu&apos;à 10 annonces actives). La navigation et le téléchargement de l&apos;appli
            restent gratuits pour les acheteurs.
          </p>
          <LinkButton href="/shop" variant="amber">
            Activer ma boutique
          </LinkButton>
          <button onClick={() => setType("espace")} className="mt-2 text-[12px] font-semibold underline" style={{ color: "var(--teal-700)" }}>
            Publier un espace à louer à la place
          </button>
        </div>
      ) : shopFull ? (
        <div
          className="rounded-[var(--radius-m)] border p-4 text-center"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          <p className="mb-3 text-[13px]" style={{ color: "var(--text-dim)" }}>
            Vous avez atteint la limite de {shopStatus.data?.maxListings} annonces actives pour votre boutique.
          </p>
          <LinkButton href="/dashboard" variant="outline">
            Gérer mes annonces
          </LinkButton>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
              Titre de l&apos;annonce
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={titlePlaceholder}
              className="w-full rounded-[var(--radius-s)] border px-3 py-2.5 text-[13.5px]"
              style={{ borderColor: "var(--line)" }}
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
              Catégorie
            </label>
            {categories.loading && <LoadingState label="Chargement…" />}
            {categories.error && <ErrorState message={categories.error} onRetry={categories.reload} />}
            {categories.data && (
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-[var(--radius-s)] border px-3 py-2.5 text-[13.5px]"
                style={{ borderColor: "var(--line)" }}
              >
                <option value="" disabled>
                  Choisir une catégorie
                </option>
                {sortByKnownOrder(categories.data).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
              Description
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-[var(--radius-s)] border px-3 py-2.5 text-[13.5px]"
              style={{ borderColor: "var(--line)" }}
            />
          </div>

          {type === "espace" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
                  Surface (ex. 25 m²)
                </label>
                <input
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                  className="w-full rounded-[var(--radius-s)] border px-3 py-2.5 text-[13.5px]"
                  style={{ borderColor: "var(--line)" }}
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
                  Capacité (ex. 2 pers.)
                </label>
                <input
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full rounded-[var(--radius-s)] border px-3 py-2.5 text-[13.5px]"
                  style={{ borderColor: "var(--line)" }}
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
              {type === "espace" ? "Tarif par jour (FCFA)" : type === "emploi" ? (jobKind === "recherche" ? "Prétention salariale (FCFA)" : "Salaire proposé (FCFA)") : "Prix (FCFA)"}
            </label>
            <input
              required
              type="number"
              min={0}
              value={priceFcfa}
              onChange={(e) => setPriceFcfa(e.target.value)}
              className="w-full rounded-[var(--radius-s)] border px-3 py-2.5 font-[var(--font-mono)] text-[13.5px]"
              style={{ borderColor: "var(--line)" }}
            />
          </div>

          {submitError && (
            <p className="rounded-[var(--radius-s)] p-2.5 text-[12.5px]" style={{ background: "var(--clay-100)", color: "var(--clay)" }}>
              {submitError}
            </p>
          )}

          <Button type="submit" disabled={busy}>
            {busy ? "Publication…" : "Publier l'annonce"}
          </Button>
        </form>
      )}
    </div>
  );
}
