"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await api.signIn(email, password);
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Email or password is incorrect.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-lg border border-line bg-white p-7 shadow-card">
        <h1 className="font-display text-xl font-bold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-ink-soft">Use your work email to continue.</p>

        <div className="mt-6 space-y-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                   onKeyDown={(e) => e.key === "Enter" && submit()}
                   className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                   onKeyDown={(e) => e.key === "Enter" && submit()}
                   className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm" />
          </label>
        </div>

        {error && <p className="mt-3 text-sm font-medium text-crit">{error}</p>}

        <button onClick={submit} disabled={busy}
                className="mt-5 w-full rounded-lg bg-ink py-2.5 text-sm font-medium text-white
                           hover:bg-ink-2 disabled:opacity-50">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </div>
  );
}
