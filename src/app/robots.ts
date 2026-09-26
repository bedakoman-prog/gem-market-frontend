import type { MetadataRoute } from "next";

const SITE_URL = "https://market.agbatia.net";

// Autorise l'indexation des pages publiques (accueil, recherche, catégories,
// annonces, fiches boutique) et exclut les pages privées/compte qui n'ont
// aucun intérêt dans les résultats de recherche.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/messages",
          "/orders",
          "/profile",
          "/publish",
          "/report",
          "/admin",
          "/login",
          "/shop",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
