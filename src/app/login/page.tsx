"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User, MapPin, Building2, Phone, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/Button";
import { TopBar } from "@/components/TopBar";
import { LoadingState } from "@/components/LoadingState";

function TextField({
  label,
  icon,
  ...props
}: {
  label: string;
  icon?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
        {label}
      </label>
      <div
        className="flex items-center gap-2 rounded-[var(--radius-s)] border px-3 py-3"
        style={{ borderColor: "var(--line)" }}
      >
        {icon}
        <input
          {...props}
          className="flex-1 bg-transparent text-[14px] outline-none"
        />
      </div>
    </div>
  );
}

function LoginForm() {
  const { login, register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/profile";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connexion
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Inscription
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("Côte d'Ivoire");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

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
        phone: phone.trim(),
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

  return (
    <div className="fade">
      <TopBar title={mode === "login" ? "Connexion" : "Créer un compte"} />

      <div className="mb-5 flex flex-col items-center gap-2 py-4 text-center">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "linear-gradient(155deg, var(--teal-700), var(--teal-900))", color: "var(--amber)" }}
        >
          <ShieldCheck size={26} />
        </span>
        <p className="max-w-[280px] text-[13px]" style={{ color: "var(--text-dim)" }}>
          {mode === "login"
            ? "Connectez-vous avec votre email et votre mot de passe."
            : "Créez votre compte GEM Market pour acheter, vendre ou louer."}
        </p>
      </div>

      <div
        className="mb-5 flex rounded-full border p-1 text-[12.5px] font-semibold"
        style={{ borderColor: "var(--line)" }}
      >
        <button
          type="button"
          onClick={() => { setMode("login"); setError(null); }}
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
          onClick={() => { setMode("register"); setError(null); }}
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

      {mode === "login" ? (
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
          {error && <p className="text-[12.5px]" style={{ color: "var(--clay)" }}>{error}</p>}
          <Button type="submit" disabled={busy || !loginEmail.trim() || !loginPassword}>
            {busy ? "Connexion…" : "Se connecter"}
          </Button>
        </form>
      ) : (
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
          <TextField
            label="Téléphone"
            icon={<Phone size={16} color="var(--text-faint)" />}
            required
            type="tel"
            placeholder="+225 07 58 12 34 56"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
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
              !phone.trim() ||
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
