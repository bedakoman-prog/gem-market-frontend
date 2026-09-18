"use client";

import { useState } from "react";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { api } from "@/lib/api";
import { useApiData } from "@/lib/useApi";
import type { Listing, Category } from "@/lib/types";
import { sortByKnownOrder } from "@/lib/categoryMeta";
import { JOB_SECTORS } from "@/lib/jobTaxonomy";
import { ListingGridCard } from "@/components/ListingCard";
import { LoadingState, ErrorState, EmptyState } from "@/components/LoadingState";

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
  const [showFilters, setShowFilters] = useState(false);

  const categories = useApiData(() => api.get<Category[]>("/categories", false), []);
  const results = useApiData(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (type) params.set("type", type);
    if (type === "emploi" && jobSector) params.set("sub", jobSector);
    return api.get<Listing[]>(`/search?${params.toString()}`, false);
  }, [q, category, type, jobSector]);

  const filterActive = category || type || jobSector;

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

      <button
        onClick={() => setShowFilters((v) => !v)}
        className="mb-3 flex w-full items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[12.5px] font-semibold"
        style={{ borderColor: "var(--line)", background: "var(--surface)", color: "var(--text)" }}
      >
        <SlidersHorizontal size={14} color="var(--teal-700)" />
        <span className="flex-1 text-left">
          {filterActive
            ? [
                TYPES.find((t) => t.id === type)?.label,
                categories.data?.find((c) => c.id === category)?.label,
                JOB_SECTORS.find((s) => s.id === jobSector)?.label,
              ]
                .filter(Boolean)
                .join(" · ")
            : "Toutes les catégories"}
        </span>
        {filterActive && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setCategory("");
              setType("");
              setJobSector("");
            }}
            className="font-bold"
            style={{ color: "var(--clay)" }}
          >
            Réinitialiser
          </span>
        )}
      </button>

      {showFilters && (
        <div
          className="sheetup mb-4 space-y-3 rounded-[var(--radius-m)] border p-3.5"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          <div>
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
              Type
            </div>
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
          </div>
          {type === "emploi" && (
            <div>
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
                Secteur
              </div>
              <select
                value={jobSector}
                onChange={(e) => setJobSector(e.target.value)}
                className="w-full rounded-[var(--radius-s)] border px-3 py-2.5 text-[13px]"
                style={{ borderColor: "var(--line)", background: "var(--bg)", color: "var(--text)" }}
              >
                <option value="">Tous les secteurs</option>
                {JOB_SECTORS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
              Catégorie
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-[var(--radius-s)] border px-3 py-2.5 text-[13px]"
              style={{ borderColor: "var(--line)", background: "var(--bg)", color: "var(--text)" }}
            >
              <option value="">Toutes les catégories</option>
              {categories.data &&
                sortByKnownOrder(categories.data).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
            </select>
          </div>
        </div>
      )}

      {results.loading && <LoadingState />}
      {results.error && <ErrorState message={results.error} onRetry={results.reload} />}
      {results.data && (
        results.data.length ? (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
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
