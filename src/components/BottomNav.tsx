"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, MessageCircle, User } from "lucide-react";

const TABS = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/search", label: "Recherche", icon: Search },
  { href: "/publish", label: "Publier", icon: Plus, isPublish: true },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/profile", label: "Profil", icon: User },
];

const NAV_ROUTES = ["/", "/search", "/publish", "/messages", "/profile"];

export function BottomNavGate() {
  const pathname = usePathname();
  if (!NAV_ROUTES.includes(pathname)) return null;
  return <BottomNav />;
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky bottom-0 z-40 flex items-center justify-around border-t bg-[var(--surface)] px-2 py-2"
      style={{ borderColor: "var(--line)" }}
    >
      {TABS.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        const Icon = tab.icon;
        if (tab.isPublish) {
          return (
            <Link key={tab.href} href={tab.href} className="flex flex-col items-center gap-1">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full"
                style={{
                  background: active ? "var(--amber)" : "var(--teal-700)",
                  color: active ? "#2a1c04" : "#fff",
                }}
              >
                <Icon size={20} />
              </span>
              <span
                className="text-[10px] font-semibold"
                style={{ color: active ? "var(--teal-700)" : "var(--text-faint)" }}
              >
                {tab.label}
              </span>
            </Link>
          );
        }
        return (
          <Link key={tab.href} href={tab.href} className="flex flex-col items-center gap-1 px-2 py-1">
            <Icon size={21} color={active ? "var(--teal-700)" : "var(--text-faint)"} />
            <span
              className="text-[10px] font-semibold"
              style={{ color: active ? "var(--teal-700)" : "var(--text-faint)" }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
