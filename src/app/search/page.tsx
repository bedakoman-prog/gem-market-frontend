"use client";

import { useState } from "react";
import { Search as SearchIcon, ChevronDown, X } from "lucide-react";
import { api } from "@/lib/api";
import { useApiData } from "@/lib/useApi";
import type { Listing, Category } from "@/lib/types";
import { sortByKnownOrder } from "@/lib/categoryMeta";
import { JOB_SECTORS } from "@/lib/jobTaxonomy";
import { SERVICE_TYPES } from "@/lib/serviceTaxonomy";
import { ListingGridCard } from "@/components/ListingCard";
import { LoadingState, ErrorState, EmptyState } from "@/components/LoadingState";

// Une section de filtre repliable — chaque filtre (Type, Catégorie…) s'ouvre
// et se ferme indépendamment des autres (pas un accordéon "un seul ouvert à
// la fois" classique, mais une fenêtre déroulante par filtre).
function FilterSection({
  label,
  value,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  value?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-m)] border" style={{ borderColor: "var(--line)" }}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left"
        style={{ background: "var(--surface)" }}
      >
        <span className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
          {label}
        </span>
        <span className="flex-1 truncate text-[12.5px] font-semibold" style={{ color: value ? "var(--teal-700)" : "var(--text-dim)" }}>
          {value || "Tous"}
        </span>
        <ChevronDown
          size={16}
          color="var(--text-faint)"
          style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .15s ease" }}
        />
      </button>
      {isOpen && (
        <div className="sheetup border-t p-3" style={{ borderColor: "var(--line)", background: "var(--bg)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

const TYPES: { id: string; label: string }[] = [
  { id: "", label: "Tous" },
  { id: "bien", label: "Biens" },
  { id: "service", label: "Services" },
  { id: "espace", label: "Espaces" },
  { id: "emploi", label: "Emploi" },
];

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [jobSector, setJobSector] = useState("");
  const [serviceType, setServiceType] = useState("");
  // Chaque filtre s'ouvre/se ferme indépendamment — plusieurs peuvent être
  // ouverts en même temps.
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  function toggleSection(key: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const categories = useApiData(() => api.get<Category[]>("/categories", false), []);
  // Sous-filtre contextuel : secteur de métier pour "Emploi", type de
  // prestation pour la catégorie "Services" — un seul est pertinent à la fois.
  const sub = type === "emploi" ? jobSector : category === "services" ? serviceType : "";
  const results = useApiData(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (type) params.set("type", type);
    if (sub) params.set("sub", sub);
    return api.get<Listing[]>(`/search?${params.toString()}`, false);
  }, [q, category, type, sub]);

  const filterActive = category || type || sub;
  function resetFilters() {
    setCategory("");
    setType("");
    setJobSector("");
    setServiceType("");
  }

  return (
    <div className="fade">
      <h2 className="pb-3 pt-1 font-[var(--font-display)] text-[18px] font-semibold" style={{ color: "var(--ink)" }}>
        Rechercher
      </h2>
      <div
        className="mb-3 flex items-center gap-2 rounded-full border px-3.5 py-2.5"
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
      >
        <SearchIcon size={16} color="var(--text-faint)" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="iPhone, studio, riz, plombier…"
          className="flex-1 bg-transparent text-[13.5px] outline-none"
          style={{ color: "var(--text)" }}
        />
        {q && (
          <button onClick={() => setQ("")} aria-label="Effacer">
            <X size={15} color="var(--text-faint)" />
          </button>
        )}
      </div>

      {filterActive && (
        <div className="mb-2 flex justify-end">
          <button
            onClick={resetFilters}
            className="text-[12px] font-bold"
            style={{ color: "var(--clay)" }}
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      <div className="mb-4 space-y-2">
        <FilterSection
          label="Type"
          value={type ? TYPES.find((t) => t.id === type)?.label : undefined}
          isOpen={openSections.has("type")}
          onToggle={() => toggleSection("type")}
        >
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setType(t.id);
                  if (t.id !== "emploi") setJobSector("");
                }}
                className="rounded-full border px-3 py-1.5 text-[12px] font-semibold"
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
        </FilterSection>

        <FilterSection
          label="Catégorie"
          value={categories.data?.find((c) => c.id === category)?.label}
          isOpen={openSections.has("category")}
          onToggle={() => toggleSection("category")}
        >
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              if (e.target.value !== "services") setServiceType("");
            }}
            className="w-full rounded-[var(--radius-s)] border px-3 py-2.5 text-[13px]"
            style={{ borderColor: "var(--line)", background: "var(--surface)", color: "var(--text)" }}
          >
            <option value="">Toutes les catégories</option>
            {categories.data &&
              sortByKnownOrder(categories.data).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
          </select>
        </FilterSection>

        {type === "emploi" && (
          <FilterSection
            label="Secteur"
            value={JOB_SECTORS.find((s) => s.id === jobSector)?.label}
            isOpen={openSections.has("sub")}
            onToggle={() => toggleSection("sub")}
          >
            <select
              value={jobSector}
              onChange={(e) => setJobSector(e.target.value)}
              className="w-full rounded-[var(--radius-s)] border px-3 py-2.5 text-[13px]"
              style={{ borderColor: "var(--line)", background: "var(--surface)", color: "var(--text)" }}
            >
              <option value="">Tous les secteurs</option>
              {JOB_SECTORS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </FilterSection>
        )}

        {type !== "emploi" && category === "services" && (
          <FilterSection
            label="Prestation"
            value={SERVICE_TYPES.find((s) => s.id === serviceType)?.label}
            isOpen={openSections.has("sub")}
            onToggle={() => toggleSection("sub")}
          >
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full rounded-[var(--radius-s)] border px-3 py-2.5 text-[13px]"
              style={{ borderColor: "var(--line)", background: "var(--surface)", color: "var(--text)" }}
            >
              <option value="">Tous les types de prestation</option>
              {SERVICE_TYPES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </FilterSection>
        )}
      </div>

      {results.loading && <LoadingState />}
      {results.error && <ErrorState message={results.error} onRetry={results.reload} />}
      {results.data && (
        results.data.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {results.data.map((l) => (
              <ListingGridCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <EmptyState>
            Aucun résultat pour cette recherche.
            <br />
            Essayez un autre mot-clé ou ajustez le filtre.
          </EmptyState>
        )
      )}
    </div>
  );
}
