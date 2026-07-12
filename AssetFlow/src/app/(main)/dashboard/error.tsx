"use client";

import { AlertCircle, RotateCw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-2 py-8 sm:px-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>
          This page hit an unexpected error and could not render.
          {process.env.NODE_ENV === "development" && error?.message ? (
            <span className="mt-1 block font-mono text-xs">{error.message}</span>
          ) : null}
        </AlertDescription>
      </Alert>
      <div>
        <Button variant="outline" onClick={() => reset()}>
          <RotateCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
