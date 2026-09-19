"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  ChevronRight,
  User as UserIcon,
  ShoppingBag,
  Store,
  MessageCircle,
  CreditCard,
  Flag,
  LogOut,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { api, ApiError } from "@/lib/api";
import { useApiData } from "@/lib/useApi";
import { useToast } from "@/lib/toast";
import type { ShopStatus } from "@/lib/types";
import { LoadingState } from "@/components/LoadingState";

function MenuRow({ icon, label, trailing, onClick, href, danger }: {
  icon: React.ReactNode;
  label: string;
  trailing?: string;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
}) {
  const content = (
    <>
      <span
        className="flex h-9 w-9 flex-none items-center justify-center rounded-full"
        style={{ background: danger ? "var(--clay-100)" : "var(--surface-2)", color: danger ? "var(--clay)" : "var(--teal-700)" }}
      >
        {icon}
      </span>
      <span className="flex-1 text-[13.5px] font-semibold" style={{ color: danger ? "var(--clay)" : "var(--text)" }}>
        {label}
      </span>
      {trailing && (
        <span className="text-[11.5px]" style={{ color: "var(--text-faint)" }}>
          {trailing}
        </span>
      )}
      <ChevronRight size={16} color="var(--text-faint)" />
    </>
  );
  const cls = "flex w-full items-center gap-3 border-b py-3.5 text-left";
  const style = { borderColor: "var(--line)" };
  if (href) return <Link href={href} className={cls} style={style}>{content}</Link>;
  return (
    <button onClick={onClick} className={cls} style={style}>
      {content}
    </button>
  );
}

export default function ProfilePage() {
  const { ready } = useRequireAuth();
  const { me, logout, refreshMe } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [bootstrapping, setBootstrapping] = useState(false);
  const shopStatus = useApiData(() => (ready ? api.get<ShopStatus>("/shop/status") : Promise.resolve(null)), [ready]);

  function handleLogout() {
    logout();
    router.push("/");
  }

  // Bouton temporaire d'amorçage : premier compte à cliquer devient admin.
  // Ne fait plus rien (403 silencieux) dès qu'un admin existe déjà — sera
  // retiré une fois l'équipe de modération en place.
  async function handleBootstrapAdmin() {
    setBootstrapping(true);
    try {
      await api.post("/users/bootstrap-admin");
      await refreshMe();
      toast("Compte administrateur activé !");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Action impossible, réessayez.");
    } finally {
      setBootstrapping(false);
    }
  }

  if (!ready || !me) return <LoadingState label="Vérification de la connexion…" />;

  return (
    <div className="fade">
      <h2 className="pb-3 pt-1 font-[var(--font-display)] text-[18px] font-semibold" style={{ color: "var(--ink)" }}>
        Profil
      </h2>

      <div className="mb-5 flex items-center gap-3">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-full text-[18px] font-bold"
          style={{ background: "var(--teal-100)", color: "var(--teal-700)" }}
        >
          {me.name?.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <div className="text-[16px] font-bold" style={{ color: "var(--ink)" }}>{me.name}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[12px]" style={{ color: "var(--text-faint)" }}>
            <MapPin size={12} />
            {me.city || "Abidjan"}
          </div>
        </div>
      </div>

      <div>
        <MenuRow icon={<UserIcon size={16} />} label="Mes informations" href="/profile/edit" />
        <MenuRow icon={<ShoppingBag size={16} />} label="Mes achats" href="/orders" />
        <MenuRow icon={<Store size={16} />} label="Mon espace vendeur" href="/dashboard" />
        <MenuRow icon={<MessageCircle size={16} />} label="Messagerie" href="/messages" />
        <MenuRow
          icon={<CreditCard size={16} />}
          label="Paiement & boutique"
          trailing={shopStatus.data ? (shopStatus.data.active ? "Boutique active" : "Boutique inactive") : undefined}
          href="/shop"
        />
        <MenuRow icon={<Flag size={16} />} label="Signalements & sécurité" href="/report" />
        {me.isAdmin && <MenuRow icon={<ShieldCheck size={16} />} label="Modération (admin)" href="/admin" />}
        {!me.isAdmin && (
          <MenuRow
            icon={<KeyRound size={16} />}
            label={bootstrapping ? "Activation…" : "Activer le compte administrateur"}
            onClick={handleBootstrapAdmin}
          />
        )}
        <MenuRow icon={<LogOut size={16} />} label="Se déconnecter" onClick={handleLogout} danger />
      </div>

      <p className="mt-4 text-[11px]" style={{ color: "var(--text-faint)" }}>
        GEM Market examine les vendeurs signalés à plusieurs reprises et peut suspendre un compte en cas d&apos;abus avéré.
      </p>
    </div>
  );
}
