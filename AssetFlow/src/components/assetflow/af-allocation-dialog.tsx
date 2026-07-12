"use client";

import { useState } from "react";

import { ArrowRightLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FormOptions } from "@/server/af-data";

import { Field, FormDialog } from "./af-form";
import { useAfMutation } from "./use-af-mutation";

export function AllocateAssetDialog({ options }: { options: FormOptions }) {
  const { submit, loading } = useAfMutation();
  const [assetId, setAssetId] = useState("");
  const [target, setTarget] = useState<"user" | "department">("user");
  const [userId, setUserId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("");
  const [notes, setNotes] = useState("");

  const availableAssets = options.assets.filter((a) => a.status === "Available");

  function reset() {
    setAssetId("");
    setTarget("user");
    setUserId("");
    setDepartmentId("");
    setExpectedReturn("");
    setNotes("");
  }

  const valid = Boolean(assetId && (target === "user" ? userId : departmentId));

  async function onSubmit() {
    return submit({
      url: "/api/af/allocations",
      method: "POST",
      success: "Asset allocated",
      body: {
        asset_id: assetId,
        user_id: target === "user" ? userId : null,
        department_id: target === "department" ? departmentId : null,
        expected_return: expectedReturn || null,
        notes: notes.trim() || null,
      },
    });
  }

  return (
    <FormDialog
      trigger={
        <Button>
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          Allocate Asset
        </Button>
      }
      title="Allocate Asset"
      description="Check out an available asset to an employee or department."
      submitLabel="Allocate"
      loading={loading}
      disabled={!valid}
      onOpenChange={(open) => open && reset()}
      onSubmit={onSubmit}
    >
      <Field
        label="Asset"
        required
        hint={availableAssets.length === 0 ? "No available assets to allocate." : undefined}
      >
        <Select value={assetId} onValueChange={setAssetId}>
          <SelectTrigger>
            <SelectValue placeholder="Select an available asset" />
          </SelectTrigger>
          <SelectContent>
            {availableAssets.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.asset_tag} — {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Assign to" required>
        <Select value={target} onValueChange={(v) => setTarget(v as "user" | "department")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Employee</SelectItem>
            <SelectItem value="department">Department</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      {target === "user" ? (
        <Field label="Employee" required>
          <Select value={userId} onValueChange={setUserId}>
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
      ) : (
        <Field label="Department" required>
          <Select value={departmentId} onValueChange={setDepartmentId}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {options.departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}

      <Field label="Expected Return" htmlFor="af-alloc-return">
        <Input
          id="af-alloc-return"
          type="date"
          value={expectedReturn}
          onChange={(e) => setExpectedReturn(e.target.value)}
        />
      </Field>

      <Field label="Notes" htmlFor="af-alloc-notes">
        <Textarea
          id="af-alloc-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes…"
          rows={2}
        />
      </Field>
    </FormDialog>
  );
}
