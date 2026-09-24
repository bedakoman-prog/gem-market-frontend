import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/lib/toast";
import { BottomNavGate } from "@/components/BottomNav";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "TROUVE TOUT — Achetez, vendez, louez à Abidjan",
  description:
    "TROUVE TOUT : la place de marché multi-catégories d'Abidjan — biens, services, espaces à louer et emplois, avec paiement sécurisé en séquestre.",
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
    title: "TROUVE TOUT",
  },
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
