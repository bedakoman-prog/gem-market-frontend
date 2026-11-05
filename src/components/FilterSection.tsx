"use client";

import { ChevronDown } from "lucide-react";

// Une section de filtre repliable — « fenêtre déroulante » : fermée par
// défaut, elle s'ouvre/se ferme indépendamment des autres sections. Utilisée
// sur /search (filtres Type, Catégorie…) et sur l'accueil (liste des
// catégories), pour ne pas occuper tout l'écran avant même d'avoir vu les
// annonces.
export function FilterSection({
  label,
  value,
  showPlaceholder = true,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  value?: string;
  // false pour une section de navigation pure (ex. liste de catégories sur
  // l'accueil), qui n'a pas de "valeur sélectionnée" à rappeler à côté du
  // libellé — true (défaut) garde le comportement existant de /search, qui
  // affiche "Tous" tant qu'aucune valeur n'est choisie.
  showPlaceholder?: boolean;
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
        {showPlaceholder ? (
          <span className="flex-1 truncate text-[12.5px] font-semibold" style={{ color: value ? "var(--teal-700)" : "var(--text-dim)" }}>
            {value || "Tous"}
          </span>
        ) : (
          <span className="flex-1" />
        )}
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
