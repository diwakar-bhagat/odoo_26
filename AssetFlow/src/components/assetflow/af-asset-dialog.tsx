"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FormOptions } from "@/server/af-data";

import { Field } from "./af-form";
import { useAfMutation } from "./use-af-mutation";

const CONDITIONS = ["Excellent", "Good", "Fair", "Poor"];
const STATUSES = ["Available", "Allocated", "Reserved", "Under Maintenance", "Lost", "Retired", "Disposed"];
const NONE = "__none__";

type AssetDialogProps = {
  mode: "create" | "edit";
  options: Pick<FormOptions, "categories" | "departments">;
  asset?: any;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function AssetDialog({ mode, options, asset, trigger, open: openProp, onOpenChange }: AssetDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const { submit, loading } = useAfMutation();

  const [form, setForm] = useState(() => initialForm(asset));

  function set<K extends keyof ReturnType<typeof initialForm>>(key: K, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleOpenChange(next: boolean) {
    if (next) setForm(initialForm(asset));
    setOpen(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok =
      mode === "create"
        ? await submit({
            url: "/api/af/assets",
            method: "POST",
            success: `Asset "${form.asset_tag}" registered`,
            body: {
              name: form.name.trim(),
              asset_tag: form.asset_tag.trim(),
              serial_number: emptyToNull(form.serial_number),
              category_id: noneToNull(form.category_id),
              department_id: noneToNull(form.department_id),
              location: emptyToNull(form.location),
              purchase_cost: form.purchase_cost ? Number(form.purchase_cost) : null,
              condition: form.condition,
              is_bookable: form.is_bookable,
              notes: emptyToNull(form.notes),
            },
          })
        : await submit({
            url: `/api/af/assets/${asset.id}`,
            method: "PATCH",
            success: `Asset "${asset.asset_tag}" updated`,
            body: {
              name: form.name.trim(),
              location: emptyToNull(form.location),
              condition: form.condition,
              status: form.status,
              department_id: noneToNull(form.department_id),
              is_bookable: form.is_bookable,
              notes: emptyToNull(form.notes),
            },
          });
    if (ok) setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger == null ? null : <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[560px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Register Asset" : `Edit ${asset?.asset_tag ?? "Asset"}`}</DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Add a new asset to the registry."
                : "Update this asset's details and lifecycle status."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid max-h-[60vh] gap-4 overflow-y-auto py-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name" htmlFor="af-name" required>
                <Input
                  id="af-name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder='MacBook Pro 16"'
                  required
                />
              </Field>
              <Field label="Asset Tag" htmlFor="af-tag" required>
                <Input
                  id="af-tag"
                  value={form.asset_tag}
                  onChange={(e) => set("asset_tag", e.target.value)}
                  placeholder="AF-0016"
                  required
                  disabled={mode === "edit"}
                />
              </Field>
            </div>

            {mode === "create" ? (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Serial Number" htmlFor="af-serial">
                  <Input
                    id="af-serial"
                    value={form.serial_number}
                    onChange={(e) => set("serial_number", e.target.value)}
                    placeholder="SN-…"
                  />
                </Field>
                <Field label="Category">
                  <Select value={form.category_id} onValueChange={(v) => set("category_id", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Uncategorized</SelectItem>
                      {options.categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-4">
              <Field label="Department">
                <Select value={form.department_id} onValueChange={(v) => set("department_id", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Unassigned</SelectItem>
                    {options.departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Condition">
                <Select value={form.condition} onValueChange={(v) => set("condition", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Location" htmlFor="af-loc">
                <Input
                  id="af-loc"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="Floor 2, Desk 12"
                />
              </Field>
              {mode === "create" ? (
                <Field label="Purchase Cost" htmlFor="af-cost">
                  <Input
                    id="af-cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.purchase_cost}
                    onChange={(e) => set("purchase_cost", e.target.value)}
                    placeholder="2499.00"
                  />
                </Field>
              ) : (
                <Field label="Status">
                  <Select value={form.status} onValueChange={(v) => set("status", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </div>

            <Field label="Notes" htmlFor="af-notes">
              <Textarea
                id="af-notes"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Optional notes…"
                rows={2}
              />
            </Field>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_bookable}
                onChange={(e) => set("is_bookable", e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              Bookable resource (e.g. conference room)
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !form.name.trim() || !form.asset_tag.trim()}>
              {loading ? "Saving…" : mode === "create" ? "Register Asset" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function initialForm(asset?: any) {
  return {
    name: asset?.name ?? "",
    asset_tag: asset?.asset_tag ?? "",
    serial_number: asset?.serial_number ?? "",
    category_id: asset?.category_id ?? NONE,
    department_id: asset?.department_id ?? NONE,
    location: asset?.location ?? "",
    purchase_cost: asset?.purchase_cost != null ? String(asset.purchase_cost) : "",
    condition: asset?.condition ?? "Good",
    status: asset?.status ?? "Available",
    notes: asset?.notes ?? "",
    is_bookable: Boolean(asset?.is_bookable),
  };
}

function emptyToNull(v: string) {
  const t = v.trim();
  return t === "" ? null : t;
}

function noneToNull(v: string) {
  return v === NONE || v === "" ? null : v;
}
