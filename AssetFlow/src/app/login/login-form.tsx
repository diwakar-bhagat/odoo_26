"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo / Brand */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <ShieldCheck className="size-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">AssetFlow</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enterprise Asset Management
        </p>
      </div>

      {/* Card */}
      <div className="rounded-xl border bg-card p-8 shadow-lg">
        <h2 className="mb-6 text-center text-lg font-semibold">Sign in to your account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@assetflow.dev"
              required
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogIn className="size-4" />
            )}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 rounded-lg border border-dashed bg-muted/50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Demo Accounts
          </p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p><span className="font-medium text-foreground">Admin:</span> admin@assetflow.dev</p>
            <p><span className="font-medium text-foreground">Asset Mgr:</span> manager@assetflow.dev</p>
            <p><span className="font-medium text-foreground">Dept Head:</span> head@assetflow.dev</p>
            <p><span className="font-medium text-foreground">Employee:</span> employee@assetflow.dev</p>
            <p className="mt-2 font-medium text-foreground">Password for all: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
