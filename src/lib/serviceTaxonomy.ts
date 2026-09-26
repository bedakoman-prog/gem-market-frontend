// Miroir front de gem-market-backend/src/listings/service-types.ts —
// sous-catégorisation des annonces de la catégorie "services". Référentiel
// volontairement simple (id + label), appelé à s'enrichir.

export interface ServiceType {
  id: string;
  label: string;
}

export const SERVICE_TYPES: ServiceType[] = [
  { id: "electricite", label: "Électricité" },
  { id: "plomberie", label: "Plomberie" },
  { id: "mecanique", label: "Mécanique" },
  { id: "electromenager", label: "Électroménager" },
];

export function serviceTypeLabel(id?: string | null): string | undefined {
  return SERVICE_TYPES.find((s) => s.id === id)?.label;
}
