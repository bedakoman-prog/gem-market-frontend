"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { api, clearTokens, getAccessToken, setTokens } from "./api";
import type { Me } from "./types";

interface AuthContextValue {
  me: Me | null;
  loading: boolean;
  isAuthenticated: boolean;
  requestOtp: (phone: string) => Promise<{ sent: true; expiresInSeconds: number }>;
  verifyOtp: (phone: string, code: string, name?: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    if (!getAccessToken()) {
      setMe(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.get<Me>("/users/me");
      setMe(data);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const requestOtp = useCallback(async (phone: string) => {
    return api.post<{ sent: true; expiresInSeconds: number }>("/auth/otp/request", { phone }, false);
  }, []);

  const verifyOtp = useCallback(async (phone: string, code: string, name?: string) => {
    const data = await api.post<{ accessToken: string; refreshToken: string; userId: string }>(
      "/auth/otp/verify",
      { phone, code, name },
      false,
    );
    setTokens(data.accessToken, data.refreshToken);
    await refreshMe();
  }, [refreshMe]);

  const logout = useCallback(() => {
    clearTokens();
    setMe(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ me, loading, isAuthenticated: !!me, requestOtp, verifyOtp, logout, refreshMe }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé sous <AuthProvider>");
  return ctx;
}
