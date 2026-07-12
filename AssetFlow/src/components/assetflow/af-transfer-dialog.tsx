"use client";

import { useState } from "react";

import { ArrowRightLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FormOptions } from "@/server/af-data";

import { Field, FormDialog } from "./af-form";
import { useAfMutation } from "./use-af-mutation";

export function RequestTransferDialog({ options }: { options: FormOptions }) {
  const { submit, loading } = useAfMutation();
  const [assetId, setAssetId] = useState("");
  const [toEmployeeId, setToEmployeeId] = useState("");
  const [reason, setReason] = useState("");

  // Only allocated assets can be transferred (they must have an active custody).
  const allocatedAssets = options.assets.filter((a) => a.status === "Allocated");

  function reset() {
    setAssetId("");
    setToEmployeeId("");
    setReason("");
  }

  async function onSubmit() {
    return submit({
      url: "/api/af/transfers",
      method: "POST",
      success: "Transfer requested",
      body: { asset_id: assetId, to_employee_id: toEmployeeId, reason: reason.trim() || null },
    });
  }

  return (
    <FormDialog
      trigger={
        <Button>
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          Request Transfer
        </Button>
      }
      title="Request Asset Transfer"
      description="Move custody of an allocated asset to another employee."
      submitLabel="Request Transfer"
      loading={loading}
      disabled={!assetId || !toEmployeeId}
      onOpenChange={(open) => open && reset()}
      onSubmit={onSubmit}
    >
      <Field
        label="Asset"
        required
        hint={allocatedAssets.length === 0 ? "No allocated assets available to transfer." : undefined}
      >
        <Select value={assetId} onValueChange={setAssetId}>
          <SelectTrigger>
            <SelectValue placeholder="Select allocated asset" />
          </SelectTrigger>
          <SelectContent>
            {allocatedAssets.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.asset_tag} — {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Transfer to" required>
        <Select value={toEmployeeId} onValueChange={setToEmployeeId}>
          <SelectTrigger>
            <SelectValue placeholder="Select employee" />
          </SelectTrigger>
          <SelectContent>
            {options.users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name} ({u.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Reason">
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why is this transfer needed?"
          rows={2}
        />
      </Field>
    </FormDialog>
  );
}
