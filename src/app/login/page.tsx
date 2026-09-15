"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Phone, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/Button";
import { TopBar } from "@/components/TopBar";
import { LoadingState } from "@/components/LoadingState";

function LoginForm() {
  const { requestOtp, verifyOtp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/profile";

  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await requestOtp(phone.trim());
      setExpiresIn(res.expiresInSeconds);
      setStep("code");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer le code. Vérifiez le numéro.");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await verifyOtp(phone.trim(), code.trim(), name.trim() || undefined);
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Code invalide ou expiré.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fade">
      <TopBar title="Connexion" />

      <div className="mb-5 flex flex-col items-center gap-2 py-4 text-center">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "linear-gradient(155deg, var(--teal-700), var(--teal-900))", color: "var(--amber)" }}
        >
          <ShieldCheck size={26} />
        </span>
        <p className="max-w-[260px] text-[13px]" style={{ color: "var(--text-dim)" }}>
          Connectez-vous par SMS — aucun mot de passe à retenir.
        </p>
      </div>

      {step === "phone" ? (
        <form onSubmit={handleRequestOtp} className="space-y-3.5">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
              Numéro de téléphone
            </label>
            <div
              className="flex items-center gap-2 rounded-[var(--radius-s)] border px-3 py-3"
              style={{ borderColor: "var(--line)" }}
            >
              <Phone size={16} color="var(--text-faint)" />
              <input
                required
                type="tel"
                placeholder="+225 07 58 12 34 56"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 bg-transparent text-[14px] outline-none"
              />
            </div>
          </div>
          {error && <p className="text-[12.5px]" style={{ color: "var(--clay)" }}>{error}</p>}
          <Button type="submit" disabled={busy || !phone.trim()}>
            {busy ? "Envoi du code…" : "Recevoir le code par SMS"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-3.5">
          <p className="text-[13px]" style={{ color: "var(--text-dim)" }}>
            Code envoyé au <strong>{phone}</strong>
            {expiresIn ? ` — valable ${Math.round(expiresIn / 60)} min.` : "."}
          </p>
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
              Code reçu par SMS
            </label>
            <input
              required
              inputMode="numeric"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-[var(--radius-s)] border px-3 py-3 text-center font-[var(--font-mono)] text-[18px] tracking-[0.3em] outline-none"
              style={{ borderColor: "var(--line)" }}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
              Votre nom (première connexion uniquement)
            </label>
            <input
              placeholder="Awa Koné"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-[var(--radius-s)] border px-3 py-3 text-[14px] outline-none"
              style={{ borderColor: "var(--line)" }}
            />
          </div>
          {error && <p className="text-[12.5px]" style={{ color: "var(--clay)" }}>{error}</p>}
          <Button type="submit" disabled={busy || code.trim().length < 4}>
            {busy ? "Vérification…" : "Confirmer"}
          </Button>
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="w-full text-center text-[12.5px] font-semibold"
            style={{ color: "var(--teal-700)" }}
          >
            Changer de numéro
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <LoginForm />
    </Suspense>
  );
}
