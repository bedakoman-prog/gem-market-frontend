import type { MetadataRoute } from "next";
import { CATEGORY_ORDER } from "@/lib/categoryMeta";
import { API_URL } from "@/lib/api";

const SITE_URL = "https://market.agbatia.net";

// Régénéré au maximum une fois par heure : pas besoin de retaper le backend
// (offre gratuite Render, peut être en veille) à chaque passage d'un robot.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: "daily", priority: 0.8 },
    ...CATEGORY_ORDER.map((id) => ({
      url: `${SITE_URL}/category/${id}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];

  // Annonces actives (GET /listings, public, plafonné à 60 côté backend) —
  // si l'API ne répond pas (ex. instance Render endormie), le sitemap reste
  // valide avec les seules pages statiques plutôt que d'échouer entièrement.
  let listingEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/listings`, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const listings: { id: string; createdAt?: string }[] = await res.json();
      listingEntries = listings.map((l) => ({
        url: `${SITE_URL}/listings/${l.id}`,
        lastModified: l.createdAt ? new Date(l.createdAt) : undefined,
        changeFrequency: "daily" as const,
        priority: 0.6,
      }));
    }
  } catch {
    // volontairement silencieux — voir commentaire ci-dessus
  }

  return [...staticEntries, ...listingEntries];
}
