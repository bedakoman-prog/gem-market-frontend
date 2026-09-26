export function money(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return n.toLocaleString("fr-FR") + " FCFA";
}

export function usd(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return n.toFixed(2).replace(".", ",");
}

// Le prototype fixe le prix des espaces en USD/jour ; le backend stocke tout en FCFA.
// On dérive un affichage "≈ X $/jour" à partir du taux indicatif utilisé côté serveur
// (voir shop-subscriptions.service.ts : 1 $ ≈ 615 FCFA) pour rester cohérent avec le design.
const USD_TO_FCFA = 615;

export function fcfaToUsd(fcfa: number): number {
  return fcfa / USD_TO_FCFA;
}

export function priceOf(listing: { type: string; priceFcfa: number; jobKind?: string | null }): string {
  if (listing.type === "espace") {
    return `${usd(fcfaToUsd(listing.priceFcfa))} $ / jour (≈ ${money(listing.priceFcfa)})`;
  }
  return money(listing.priceFcfa);
}

export function priceOfCard(listing: { type: string; priceFcfa: number }): string {
  if (listing.type === "espace") {
    return `${usd(fcfaToUsd(listing.priceFcfa))} $/jour`;
  }
  return money(listing.priceFcfa);
}

export function formatDate(iso?: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

// Un vendeur peut renseigner un nom de boutique (User.shopName) affiché aux
// acheteurs à la place de son nom personnel — sur les annonces, sa fiche
// boutique et dans la messagerie. `name` reste l'identité réelle, encore
// utilisée telle quelle côté admin/support.
export function sellerDisplayName(seller?: { name?: string | null; shopName?: string | null } | null): string {
  return seller?.shopName?.trim() || seller?.name || "";
}

// La plateforme s'ouvre au-delà de la Côte d'Ivoire : afficher seulement la
// ville, comme avant, suffisait tant que tous les vendeurs étaient dans le
// même pays. On ajoute désormais le pays quand il diffère de celui de la
// plateforme, pour qu'un acheteur repère tout de suite un vendeur à
// l'étranger. Retourne "" (au lieu d'un faux "Abidjan" par défaut) quand
// aucune donnée n'est disponible.
const HOME_COUNTRY_ALIASES = ["côte d'ivoire", "cote d'ivoire", "cote d ivoire", "côte d ivoire", "ci"];

export function sellerLocation(seller?: { city?: string | null; country?: string | null } | null): string {
  const city = seller?.city?.trim();
  const country = seller?.country?.trim();
  const isForeign = !!country && !HOME_COUNTRY_ALIASES.includes(country.toLowerCase());
  if (isForeign) return city ? `${city}, ${country}` : country!;
  return city || country || "";
}

// Ancienneté du vendeur (section "nouvelles demandes" — point 1), affichée sur son
// profil public et sur la fiche d'une annonce. Le backend renvoie createdAt en ISO.
export function memberSince(iso?: string | null): string {
  if (!iso) return "";
  try {
    return "Vendeur depuis " + new Date(iso).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  } catch {
    return "";
  }
}
