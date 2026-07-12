"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

type SubmitOptions = {
  url: string;
  method?: "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  success: string;
  onSuccess?: () => void;
};

/**
 * Shared client-side mutation helper for AssetFlow CRUD actions.
 * Handles the fetch → error-toast → success-toast → router.refresh() cycle so
 * every dialog and action button behaves consistently.
 */
export function useAfMutation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function submit(opts: SubmitOptions): Promise<boolean> {
    setLoading(true);
    try {
      const res = await fetch(opts.url, {
        method: opts.method ?? "POST",
        headers: opts.body ? { "Content-Type": "application/json" } : undefined,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
      toast.success(opts.success);
      opts.onSuccess?.();
      router.refresh();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading };
}
