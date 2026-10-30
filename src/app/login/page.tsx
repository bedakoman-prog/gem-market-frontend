"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User, MapPin, Building2, Phone, ShieldCheck, Eye, EyeOff, KeyRound, Hash } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/Button";
import { TopBar } from "@/components/TopBar";
import { LoadingState } from "@/components/LoadingState";
import { COUNTRY_DIAL_CODES, DEFAULT_COUNTRY_ISO } from "@/lib/countryDialCodes";

// Compose un numéro au format international (E.164) à partir de l'indicatif
// choisi et du numéro local saisi — l'indicatif est désormais obligatoire à
// l'inscription (demande utilisateur : un numéro sans indicatif casse le
// lien WhatsApp "Contacter le vendeur", voir listings/[id]/page.tsx qui
// construit le lien wa.me à partir de ce champ).
function buildE164Phone(dialIso: string, localNumber: string): string {
  const dial = COUNTRY_DIAL_CODES.find((c) => c.iso === dialIso)?.dial || "";
  const digits = localNumber.replace(/\D/g, "").replace(/^0+/, "");
  return `${dial}${digits}`;
}

function TextField({
  label,
  icon,
  type,
  ...props
}: {
  label: string;
  icon?: React.ReactNode;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const isPassword = type === "password";
  const [revealed, setRevealed] = useState(false);

  return (
    <div>
      <label className="mb-1 block text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
        {label}
      </label>
      <div
        className="flex items-center gap-2 rounded-[var(--radius-s)] border px-3 py-3"
        style={{ borderColor: "var(--line)" }}
      >
        {icon}
        <input
          {...props}
          type={isPassword ? (revealed ? "text" : "password") : type}
          className="flex-1 bg-transparent text-[14px] outline-none"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="flex-none"
            style={{ color: "var(--text-faint)" }}
          >
            {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

function LoginForm() {
  const { login, register, requestPasswordReset, resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/profile";

  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Connexion
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Inscription
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // Indicatif du pays, obligatoire (voir buildE164Phone) — Côte d'Ivoire par
  // défaut, modifiable par le vendeur.
  const [dialIso, setDialIso] = useState(DEFAULT_COUNTRY_ISO);
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("Côte d'Ivoire");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  // Mot de passe oublié (2 étapes : demande du code, puis confirmation —
  // corrige l'ancienne faille où phone+email seuls suffisaient à changer le
  // mot de passe de n'importe qui).
  const [forgotStep, setForgotStep] = useState<"request" | "confirm">("request");
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function switchMode(next: "login" | "register" | "forgot") {
    setMode(next);
    setError(null);
    setNotice(null);
    setForgotStep("request");
    setForgotCode("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(loginEmail.trim(), loginPassword);
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Email ou mot de passe incorrect.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: buildE164Phone(dialIso, phone),
        password,
        country: country.trim(),
        city: city.trim(),
        address: address.trim(),
      });
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de créer le compte.");
    } finally {
      setBusy(false);
    }
  }

  // Au moins quelques chiffres significatifs dans le numéro local — la
  // validation stricte au format E.164 est faite côté backend (voir
  // RegisterDto.phone) une fois l'indicatif concaténé.
  const localPhoneDigitsCount = phone.replace(/\D/g, "").length;

  // Étape 1/2 : demande l'envoi du code par SMS.
  async function handleForgotRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await requestPasswordReset(forgotPhone.trim(), forgotEmail.trim());
      setNotice("Si ce compte existe, un code a été envoyé par SMS au numéro renseigné.");
      setForgotStep("confirm");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer le code, réessayez.");
    } finally {
      setBusy(false);
    }
  }

  // Étape 2/2 : confirme avec le code reçu et change le mot de passe.
  async function handleForgotConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      setBusy(false);
      return;
    }
    try {
      await resetPassword(forgotPhone.trim(), forgotEmail.trim(), forgotCode.trim(), newPassword);
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Code invalide ou expiré.");
    } finally {
      setBusy(false);
    }
  }

  const title = mode === "login" ? "Connexion" : mode === "register" ? "Créer un compte" : "Mot de passe oublié";

  return (
    <div className="fade">
      <TopBar title={title} />

      <div className="mb-5 flex flex-col items-center gap-2 py-4 text-center">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "linear-gradient(155deg, var(--teal-700), var(--teal-900))", color: "var(--amber)" }}
        >
          {mode === "forgot" ? <KeyRound size={26} /> : <ShieldCheck size={26} />}
        </span>
        <p className="max-w-[280px] text-[13px]" style={{ color: "var(--text-dim)" }}>
          {mode === "login" && "Connectez-vous avec votre email et votre mot de passe."}
          {mode === "register" && "Créez votre compte TROUVE TOUT pour acheter, vendre ou louer."}
          {mode === "forgot" &&
            forgotStep === "request" &&
            "Confirmez votre téléphone et votre email d'inscription : nous vous envoyons un code par SMS."}
          {mode === "forgot" &&
            forgotStep === "confirm" &&
            "Saisissez le code reçu par SMS et choisissez un nouveau mot de passe."}
        </p>
      </div>

      {mode !== "forgot" && (
        <div
          className="mb-5 flex rounded-full border p-1 text-[12.5px] font-semibold"
          style={{ borderColor: "var(--line)" }}
        >
          <button
            type="button"
            onClick={() => switchMode("login")}
            className="flex-1 rounded-full py-2"
            style={
              mode === "login"
                ? { background: "var(--teal-700)", color: "#fff" }
                : { color: "var(--text-dim)" }
            }
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className="flex-1 rounded-full py-2"
            style={
              mode === "register"
                ? { background: "var(--teal-700)", color: "#fff" }
                : { color: "var(--text-dim)" }
            }
          >
            Créer un compte
          </button>
        </div>
      )}

      {mode === "login" && (
        <form onSubmit={handleLogin} className="space-y-3.5">
          <TextField
            label="Email"
            icon={<Mail size={16} color="var(--text-faint)" />}
            required
            type="email"
            placeholder="vous@exemple.com"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
          />
          <TextField
            label="Mot de passe"
            icon={<Lock size={16} color="var(--text-faint)" />}
            required
            type="password"
            placeholder="••••••••"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => switchMode("forgot")}
              className="text-[12px] font-semibold"
              style={{ color: "var(--teal-700)" }}
            >
              Mot de passe oublié ?
            </button>
          </div>
          {error && <p className="text-[12.5px]" style={{ color: "var(--clay)" }}>{error}</p>}
          <Button type="submit" disabled={busy || !loginEmail.trim() || !loginPassword}>
            {busy ? "Connexion…" : "Se connecter"}
          </Button>
        </form>
      )}

      {mode === "register" && (
        <form onSubmit={handleRegister} className="space-y-3.5">
          <TextField
            label="Nom complet"
            icon={<User size={16} color="var(--text-faint)" />}
            required
            placeholder="Awa Koné"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Email"
            icon={<Mail size={16} color="var(--text-faint)" />}
            required
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div>
            <label
              className="mb-1 block text-[12px] font-bold uppercase tracking-wide"
              style={{ color: "var(--text-faint)" }}
            >
              Téléphone
            </label>
            <div className="flex items-stretch gap-2">
              <div
                className="flex items-center rounded-[var(--radius-s)] border px-2 py-3"
                style={{ borderColor: "var(--line)" }}
              >
                <select
                  aria-label="Indicatif du pays"
                  required
                  value={dialIso}
                  onChange={(e) => setDialIso(e.target.value)}
                  className="max-w-[118px] bg-transparent text-[14px] outline-none"
                >
                  {COUNTRY_DIAL_CODES.map((c) => (
                    <option key={c.iso} value={c.iso}>
                      {c.dial} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div
                className="flex flex-1 items-center gap-2 rounded-[var(--radius-s)] border px-3 py-3"
                style={{ borderColor: "var(--line)" }}
              >
                <Phone size={16} color="var(--text-faint)" />
                <input
                  type="tel"
                  required
                  placeholder="07 58 12 34 56"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 bg-transparent text-[14px] outline-none"
                />
              </div>
            </div>
            <p className="mt-1 text-[11px]" style={{ color: "var(--text-faint)" }}>
              L&apos;indicatif du pays est obligatoire pour que les acheteurs puissent vous contacter sur WhatsApp.
            </p>
          </div>
          <TextField
            label="Mot de passe"
            icon={<Lock size={16} color="var(--text-faint)" />}
            required
            type="password"
            placeholder="6 caractères minimum"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Pays"
              icon={<Building2 size={16} color="var(--text-faint)" />}
              required
              placeholder="Côte d'Ivoire"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
            <TextField
              label="Ville"
              icon={<MapPin size={16} color="var(--text-faint)" />}
              required
              placeholder="Abidjan"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <TextField
            label="Adresse"
            icon={<MapPin size={16} color="var(--text-faint)" />}
            required
            placeholder="Cocody, Rue des Jardins"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          {error && <p className="text-[12.5px]" style={{ color: "var(--clay)" }}>{error}</p>}
          <Button
            type="submit"
            disabled={
              busy ||
              !name.trim() ||
              !email.trim() ||
              !dialIso ||
              localPhoneDigitsCount < 4 ||
              password.length < 6 ||
              !country.trim() ||
              !city.trim() ||
              !address.trim()
            }
          >
            {busy ? "Création du compte…" : "Créer mon compte"}
          </Button>
        </form>
      )}

      {mode === "forgot" && forgotStep === "request" && (
        <form onSubmit={handleForgotRequest} className="space-y-3.5">
          <TextField
            label="Téléphone (utilisé à l'inscription)"
            icon={<Phone size={16} color="var(--text-faint)" />}
            required
            type="tel"
            placeholder="+225 07 58 12 34 56"
            value={forgotPhone}
            onChange={(e) => setForgotPhone(e.target.value)}
          />
          <TextField
            label="Email (utilisé à l'inscription)"
            icon={<Mail size={16} color="var(--text-faint)" />}
            required
            type="email"
            placeholder="vous@exemple.com"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
          />
          {error && <p className="text-[12.5px]" style={{ color: "var(--clay)" }}>{error}</p>}
          <Button type="submit" disabled={busy || !forgotPhone.trim() || !forgotEmail.trim()}>
            {busy ? "Envoi du code…" : "Recevoir un code par SMS"}
          </Button>
          <button
            type="button"
            onClick={() => switchMode("login")}
            className="w-full text-center text-[12.5px] font-semibold"
            style={{ color: "var(--teal-700)" }}
          >
            Retour à la connexion
          </button>
        </form>
      )}

      {mode === "forgot" && forgotStep === "confirm" && (
        <form onSubmit={handleForgotConfirm} className="space-y-3.5">
          {notice && <p className="text-[12.5px]" style={{ color: "var(--good)" }}>{notice}</p>}
          <TextField
            label="Code reçu par SMS"
            icon={<Hash size={16} color="var(--text-faint)" />}
            required
            inputMode="numeric"
            placeholder="123456"
            maxLength={6}
            value={forgotCode}
            onChange={(e) => setForgotCode(e.target.value)}
          />
          <TextField
            label="Nouveau mot de passe"
            icon={<Lock size={16} color="var(--text-faint)" />}
            required
            type="password"
            placeholder="6 caractères minimum"
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            label="Confirmer le mot de passe"
            icon={<Lock size={16} color="var(--text-faint)" />}
            required
            type="password"
            placeholder="6 caractères minimum"
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <p className="text-[12.5px]" style={{ color: "var(--clay)" }}>{error}</p>}
          <Button
            type="submit"
            disabled={busy || forgotCode.trim().length < 4 || newPassword.length < 6 || !confirmPassword}
          >
            {busy ? "Mise à jour…" : "Réinitialiser le mot de passe"}
          </Button>
          <button
            type="button"
            onClick={() => setForgotStep("request")}
            className="w-full text-center text-[12.5px] font-semibold"
            style={{ color: "var(--teal-700)" }}
          >
            Je n&apos;ai pas reçu de code, recommencer
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
