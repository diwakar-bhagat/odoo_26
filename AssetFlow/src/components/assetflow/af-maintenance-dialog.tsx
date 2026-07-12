"use client";

import { useState } from "react";

import { Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FormOptions } from "@/server/af-data";

import { Field, FormDialog } from "./af-form";
import { useAfMutation } from "./use-af-mutation";

const PRIORITIES = ["Low", "Medium", "High", "Critical"];

export function ReportIssueDialog({ options }: { options: FormOptions }) {
  const { submit, loading } = useAfMutation();
  const [assetId, setAssetId] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");

  function reset() {
    setAssetId("");
    setDescription("");
    setPriority("Medium");
  }

  async function onSubmit() {
    return submit({
      url: "/api/af/maintenance",
      method: "POST",
      success: "Maintenance request submitted",
      body: { asset_id: assetId, description: description.trim(), priority },
    });
  }

  return (
    <FormDialog
      trigger={
        <Button>
          <Wrench className="mr-2 h-4 w-4" />
          Report Issue
        </Button>
      }
      title="Report Maintenance Issue"
      description="Log a repair or service request against an asset."
      submitLabel="Submit Request"
      loading={loading}
      disabled={!assetId || !description.trim()}
      onOpenChange={(open) => open && reset()}
      onSubmit={onSubmit}
    >
      <Field label="Asset" required>
        <Select value={assetId} onValueChange={setAssetId}>
          <SelectTrigger>
            <SelectValue placeholder="Select asset" />
          </SelectTrigger>
          <SelectContent>
            {options.assets.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.asset_tag} — {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Priority" required>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Description" required>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue…"
          rows={3}
        />
      </Field>
    </FormDialog>
  );
}
