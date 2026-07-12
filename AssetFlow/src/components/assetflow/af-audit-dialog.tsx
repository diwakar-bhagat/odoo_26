"use client";

import { useState } from "react";

import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { Field, FormDialog } from "./af-form";
import { useAfMutation } from "./use-af-mutation";

export function StartAuditDialog() {
  const { submit, loading } = useAfMutation();
  const [notes, setNotes] = useState("");

  async function onSubmit() {
    return submit({
      url: "/api/af/audits",
      method: "POST",
      success: "Audit cycle started",
      body: { notes: notes.trim() || null },
    });
  }

  return (
    <FormDialog
      trigger={
        <Button>
          <ShieldCheck className="mr-2 h-4 w-4" />
          Start Audit
        </Button>
      }
      title="Start Audit Cycle"
      description="Open a new inventory audit run. You can record findings as you verify assets."
      submitLabel="Start Audit"
      loading={loading}
      onOpenChange={(open) => open && setNotes("")}
      onSubmit={onSubmit}
    >
      <Field label="Notes" htmlFor="af-audit-notes">
        <Textarea
          id="af-audit-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Scope of this audit (e.g. Floor 2 hardware)…"
          rows={3}
        />
      </Field>
    </FormDialog>
  );
}
