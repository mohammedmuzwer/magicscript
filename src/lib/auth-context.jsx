"use client";

// Mock authentication + credits layer.
// Runs entirely client-side with localStorage so the full product is
// explorable with zero setup. Swap for Supabase Auth by wiring
// src/lib/supabase.js into login/signup/logout.

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "magicscript.session";

const PLAN_CREDITS = { free: 15, creator: 300, pro: 1500, enterprise: 99999 };

function makeUser({ name, email, provider = "email", plan = "creator" }) {
  return {
    id: "usr_" + Math.random().toString(36).slice(2, 10),
    name: name || email.split("@")[0].replace(/\b\w/g, (c) => c.toUpperCase()),
    email,
    provider,
    plan,
    role: email.toLowerCase().startsWith("admin") ? "admin" : "creator",
    avatarHue: Math.floor(Math.random() * 360),
    credits: PLAN_CREDITS[plan],
    creditsTotal: PLAN_CREDITS[plan],
    joinedAt: new Date().toISOString(),
    niche: "Health & Wellness",
    languagesUsed: ["en", "tanglish", "ta"],
  };
}

// Reads session from localStorage synchronously.
// Returns null on the server (window is undefined during SSR).
function readSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // Start identical on server and client to avoid hydration mismatch.
  // Real session is loaded from localStorage in the effect below, after mount.
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  const persist = useCallback((u) => {
    setUser(u);
    try {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const login = useCallback(
    async (email, _password) => {
      await new Promise((r) => setTimeout(r, 650));
      persist(makeUser({ email }));
      return { ok: true };
    },
    [persist]
  );

  const signup = useCallback(
    async ({ name, email }) => {
      await new Promise((r) => setTimeout(r, 750));
      persist(makeUser({ name, email }));
      return { ok: true };
    },
    [persist]
  );

  const loginWithGoogle = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 800));
    persist(
      makeUser({
        name: "Aarav Krishnan",
        email: "creator@gmail.com",
        provider: "google",
      })
    );
    return { ok: true };
  }, [persist]);

  const logout = useCallback(() => persist(null), [persist]);

  const updateUser = useCallback(
    (patch) => persist({ ...user, ...patch }),
    [user, persist]
  );

  const spendCredit = useCallback(
    (n = 1) => {
      if (!user) return false;
      const next = Math.max(0, user.credits - n);
      persist({ ...user, credits: next });
      return true;
    },
    [user, persist]
  );

  const changePlan = useCallback(
    (plan) => {
      if (!user) return;
      persist({
        ...user,
        plan,
        credits: PLAN_CREDITS[plan],
        creditsTotal: PLAN_CREDITS[plan],
      });
    },
    [user, persist]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateUser,
        spendCredit,
        changePlan,
        planCredits: PLAN_CREDITS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
