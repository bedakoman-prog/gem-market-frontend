import { ReactNode } from "react";

type ChipVariant = "neutral" | "verified" | "espace" | "service" | "bien" | "emploi" | "secure" | "pro" | "danger" | "good";

const VARIANT_STYLES: Record<ChipVariant, { bg: string; fg: string }> = {
  neutral: { bg: "var(--surface-2)", fg: "var(--text-dim)" },
  verified: { bg: "var(--good-100)", fg: "var(--good)" },
  espace: { bg: "var(--teal-100)", fg: "var(--teal-700)" },
  service: { bg: "var(--amber-100)", fg: "var(--amber-600)" },
  bien: { bg: "var(--surface-2)", fg: "var(--text-dim)" },
  emploi: { bg: "var(--good-100)", fg: "var(--good)" },
  secure: { bg: "var(--teal-100)", fg: "var(--teal-700)" },
  pro: { bg: "var(--ink)", fg: "var(--bg)" },
  danger: { bg: "var(--clay-100)", fg: "var(--clay)" },
  good: { bg: "var(--good-100)", fg: "var(--good)" },
};

export function Chip({ variant = "neutral", icon, children }: { variant?: ChipVariant; icon?: ReactNode; children: ReactNode }) {
  const s = VARIANT_STYLES[variant];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold"
      style={{ background: s.bg, color: s.fg }}
    >
      {icon}
      {children}
    </span>
  );
}

export function typeChipProps(listing: { type: string; jobKind?: string | null }): { variant: ChipVariant; label: string } {
  if (listing.type === "espace") return { variant: "espace", label: "Espace" };
  if (listing.type === "emploi")
    return { variant: "emploi", label: listing.jobKind === "recherche" ? "Recherche d'emploi" : "Offre d'emploi" };
  if (listing.type === "service") return { variant: "service", label: "Service" };
  return { variant: "bien", label: "Bien" };
}
