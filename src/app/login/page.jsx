"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import AuthShell from "@/components/auth/auth-shell";
import GoogleButton from "@/components/auth/google-button";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!email.includes("@") || password.length < 4) {
      setError("Enter a valid email and a password of at least 4 characters.");
      return;
    }
    setLoading(true);
    await login(email, password);
    router.push("/dashboard");
  }

  async function google() {
    setGLoading(true);
    await loginWithGoogle();
    router.push("/dashboard");
  }

  return (
    <AuthShell>
      <h1 className="font-display text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-1.5 text-sm text-soft">
        Log in to your Magic Script workspace.
      </p>

      <div className="mt-7">
        <GoogleButton onClick={google} loading={gLoading} />
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-faint">
        <span className="h-px flex-1 bg-[rgb(var(--border))]" />
        or with email
        <span className="h-px flex-1 bg-[rgb(var(--border))]" />
      </div>

      <form onSubmit={submit} className="space-y-3.5">
        <Field
          icon={Mail}
          type="email"
          placeholder="you@studio.com"
          value={email}
          onChange={setEmail}
          label="Email"
        />
        <Field
          icon={Lock}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
          label="Password"
        />

        {error && (
          <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5 text-sm disabled:opacity-70">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <>Log in <ArrowRight size={15} /></>}
        </button>
      </form>

      <p className="mt-3 text-center text-xs text-faint">
        Tip: log in with an email starting with <span className="text-cyan">admin@</span> to
        access the admin console.
      </p>

      <p className="mt-6 text-center text-sm text-soft">
        New to Magic Script?{" "}
        <Link href="/signup" className="font-semibold text-cyan hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

function Field({ icon: Icon, label, type, placeholder, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-soft">{label}</span>
      <span className="relative block">
        <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-cyan/55 focus:ring-2 focus:ring-cyan/20"
        />
      </span>
    </label>
  );
}
