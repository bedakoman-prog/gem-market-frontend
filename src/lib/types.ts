// Types miroir du schéma Prisma du backend (voir gem-market-backend/prisma/schema.prisma).
// Gardés volontairement simples/optionnels : le front ne doit jamais planter sur un champ
// manquant renvoyé par une API encore jeune.

export type ListingType = "bien" | "service" | "espace" | "emploi";
export type JobKind = "offre" | "recherche";
export type OrderStatus = "pending" | "paid_escrow" | "released" | "refunded" | "cancelled";
export type BookingStatus = "pending" | "paid" | "cancelled";

export interface SpecItem {
  icon: string;
  label: string;
}

export interface Category {
  id: string;
  label: string;
  icon?: string;
  subs?: string[];
}

export interface SellerSummary {
  id: string;
  name: string;
  city?: string | null;
  verified?: boolean;
  rating?: number | null;
  ratingsCount?: number | null;
  phone?: string | null;
  isSeller?: boolean;
  createdAt?: string;
}

export interface Listing {
  id: string;
  categoryId: string;
  category?: Category;
  type: ListingType;
  jobKind?: JobKind | null;
  jobSector?: string | null; // uniquement pour type "emploi" — voir lib/jobTaxonomy.ts
  title: string;
  description: string;
  priceFcfa: number;
  specs?: SpecItem[] | null;
  status?: string;
  views?: number;
  sellerId: string;
  seller?: SellerSummary;
  media?: { id: string; url: string; type?: "photo" | "video" }[];
  createdAt?: string;
}

export interface Booking {
  id: string;
  listingId: string;
  listing?: Listing;
  buyerId: string;
  startDate: string;
  endDate: string;
  amountFcfa: number;
  status?: BookingStatus;
  createdAt?: string;
}

export interface Order {
  id: string;
  listingId: string;
  listing?: Listing;
  buyerId: string;
  sellerId: string;
  seller?: SellerSummary;
  amountFcfa: number;
  platformFeeFcfa: number;
  status: OrderStatus;
  createdAt?: string;
  releasedAt?: string | null;
}

export interface Conversation {
  id: string;
  listingId: string;
  listing?: Listing;
  buyerId: string;
  sellerId: string;
  buyer?: SellerSummary;
  seller?: SellerSummary;
  messages?: Message[]; // uniquement le dernier message dans /conversations
  createdAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  authorId: string;
  body: string;
  sentAt: string;
  flagged?: boolean; // coordonnées de contact externes masquées par le serveur
}

export interface Me {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  isSeller?: boolean;
  verified?: boolean;
  rating?: number | null;
  ratingsCount?: number | null;
  isAdmin?: boolean;
  createdAt?: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  country: string;
  city: string;
  address: string;
}

export interface ShopStatus {
  active: boolean;
  endDate: string | null;
  maxListings: number;
  activeListingsCount: number;
}

export interface CheckoutResult {
  providerTransactionId: string;
  paymentUrl: string;
}

// Miroir de SellersService.findOne() (gem-market-backend/src/sellers/sellers.service.ts) —
// profil public d'un vendeur (ancienneté, note, boutique) — voir /app/sellers/[id].
export interface SellerProfile {
  id: string;
  name: string;
  city?: string | null;
  verified?: boolean;
  isSeller?: boolean;
  createdAt: string;
  rating?: number | null;
  ratingsCount?: number | null;
  activeListingsCount: number;
}

// Miroir de AdminService.findReports() (gem-market-backend/src/admin/admin.service.ts).
// Surface admin réelle et volontairement limitée à la modération de contenu : il n'existe
// aujourd'hui aucune route backend pour la finance, les vendeurs, le support ou la
// communauté — seuls les signalements et le rejet d'annonce sont exposés.
export type ReportStatus = "open" | "reviewed" | "dismissed";

export interface AdminReport {
  id: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
  reporter?: { id: string; name: string } | null;
  listingId?: string | null;
  listing?: Listing | null;
  sellerId?: string | null;
  seller?: { id: string; name: string; phone?: string | null; verified?: boolean } | null;
}
