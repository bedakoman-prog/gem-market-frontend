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
}

export interface Listing {
  id: string;
  categoryId: string;
  category?: Category;
  type: ListingType;
  jobKind?: JobKind | null;
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
