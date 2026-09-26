import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/lib/toast";
import { BottomNavGate } from "@/components/BottomNav";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const SITE_URL = "https://market.agbatia.net";
const SITE_NAME = "TROUVE TOUT";
const SITE_TITLE = "TROUVE TOUT — Achetez, vendez, louez";
const SITE_DESCRIPTION =
  "TROUVE TOUT : la place de marché multi-catégories — biens, services, espaces à louer et emplois, avec paiement sécurisé en séquestre.";

export const metadata: Metadata = {
  // Nécessaire pour que Next.js résolve les URLs relatives (og:image, canonical...)
  // en URLs absolues dans le HTML envoyé aux moteurs de recherche et réseaux sociaux.
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "TROUVE TOUT",
    "marketplace Côte d'Ivoire",
    "acheter vendre louer",
    "annonces Abidjan",
    "petites annonces",
    "espaces à louer",
    "offres d'emploi",
  ],
  alternates: { canonical: "/" },
  // Autorise explicitement l'indexation (le détail des pages privées est
  // exclu via robots.ts) — évite qu'un défaut restrictif de l'hébergeur
  // masque le site des moteurs de recherche.
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_NAME,
  },
};

// Balisage Organization + WebSite (schema.org) : aide Google à afficher
// "TROUVE TOUT" comme nom officiel du site dans les résultats (au lieu du
// titre de page seul) et prépare l'éligibilité à la boîte de recherche
// sitelinks. Injecté en JSON-LD, invisible pour les visiteurs.
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
    },
    {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "fr",
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export const viewport: Viewport = {
  // Pas de maximumScale : on autorise le pincer-zoomer partout (notamment sur les photos
  // d'annonces), demande explicite des utilisateurs qui veulent pouvoir zoomer les images.
  width: "device-width",
  initialScale: 1,
  themeColor: "#146356",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className="flex min-h-screen flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <ServiceWorkerRegister />
        <AuthProvider>
          <ToastProvider>
            <div
              className="mx-auto flex w-full max-w-[560px] flex-1 flex-col sm:max-w-[680px] md:max-w-[860px] lg:max-w-[1080px] xl:max-w-[1280px]"
              style={{ background: "var(--surface)", boxShadow: "var(--shadow)" }}
            >
              <main className="flex-1 px-4 pb-4 pt-3">{children}</main>
              <BottomNavGate />
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
