import {
  Building2,
  Hotel,
  Briefcase,
  Stethoscope,
  Smartphone,
  Shirt,
  Sofa,
  Car,
  ShoppingBasket,
  Wrench,
  Baby,
  Dumbbell,
  Trees,
  PawPrint,
  Boxes,
  type LucideIcon,
} from "lucide-react";

// Mappe chaque id de catégorie (venant du backend, seedé depuis le prototype) à une icône
// Lucide + une teinte de la palette GEM Market — reprend la logique de rotation de teintes
// (teal/amber/good/clay) du prototype original plutôt que d'inventer de nouvelles couleurs.
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  espace: Building2,
  hotel: Hotel,
  emploi: Briefcase,
  medical: Stethoscope,
  electro: Smartphone,
  mode: Shirt,
  maison: Sofa,
  vehicule: Car,
  alim: ShoppingBasket,
  services: Wrench,
  bebe: Baby,
  sport: Dumbbell,
  bricolage: Trees,
  animalerie: PawPrint,
  divers: Boxes,
};

export const CATEGORY_ORDER = [
  "espace", "hotel", "emploi", "medical", "electro", "mode", "maison", "vehicule",
  "alim", "services", "bebe", "sport", "bricolage", "animalerie", "divers",
];

const TINTS = [
  { bg: "var(--teal-100)", fg: "var(--teal-700)" },
  { bg: "var(--amber-100)", fg: "var(--amber-600)" },
  { bg: "var(--good-100)", fg: "var(--good)" },
  { bg: "var(--clay-100)", fg: "var(--clay)" },
];

export function categoryTint(categoryId: string) {
  const idx = CATEGORY_ORDER.indexOf(categoryId);
  return TINTS[(idx < 0 ? 0 : idx) % TINTS.length];
}

export function categoryIcon(categoryId: string): LucideIcon {
  return CATEGORY_ICONS[categoryId] || Boxes;
}

export function sortByKnownOrder<T extends { id: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a.id);
    const ib = CATEGORY_ORDER.indexOf(b.id);
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
  });
}
