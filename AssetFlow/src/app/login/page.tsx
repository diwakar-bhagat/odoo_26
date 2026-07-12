import { Suspense } from "react";

import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to AssetFlow",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-background via-background to-muted/40 px-4">
      <Suspense fallback={<div className="animate-pulse text-muted-foreground text-sm">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
