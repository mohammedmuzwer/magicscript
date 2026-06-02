"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Loader2, ArrowRight, Check } from "lucide-react";
import AuthShell from "@/components/auth/auth-shell";
import GoogleButton from "@/components/auth/google-button";
import { useAuth } from "@/lib/auth-context";

const PERKS = ["15 free generations / month", "All 7 languages", "Full verification engine"];

export default function SignupPage() {
  const router = useRouter();
  const { signup, loginWithGoogle } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (form.name.trim().length < 2) return setError("Please enter your name.");
    if (!form.email.includes("@")) return setError("Please enter a valid email.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    await signup(form);
    router.push("/dashboard");
  }

  async function google() {
    setGLoading(true);
    await loginWithGoogle();
    router.push("/dashboard");
  }

  return (
    <AuthShell>
      <h1 className="font-display text-2xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-1.5 text-sm text-soft">Start generating verified content in minutes.</p>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
        {PERKS.map((p) => (
          <li key={p} className="flex items-center gap-1.5 text-xs text-soft">
            <Check size={13} className="text-emerald-400" /> {p}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <GoogleButton onClick={google} loading={gLoading} label="Sign up with Google" />
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-faint">
        <span className="h-px flex-1 bg-[rgb(var(--border))]" />
        or with email
        <span className="h-px flex-1 bg-[rgb(var(--border))]" />
      </div>

      <form onSubmit={submit} className="space-y-3.5">
        <Field icon={User} label="Full name" placeholder="Aarav Krishnan" value={form.name} onChange={set("name")} />
        <Field icon={Mail} type="email" label="Email" placeholder="you@studio.com" value={form.email} onChange={set("email")} />
        <Field icon={Lock} type="password" label="Password" placeholder="At least 6 characters" value={form.password} onChange={set("password")} />

        {error && (
          <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5 text-sm disabled:opacity-70">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <>Create account <ArrowRight size={15} /></>}
        </button>
      </form>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-faint">
        By creating an account you agree to use generated content responsibly. Magic Script
        does not provide medical advice.
      </p>

      <p className="mt-5 text-center text-sm text-soft">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-cyan hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}

function Field({ icon: Icon, label, type = "text", placeholder, value, onChange }) {
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
