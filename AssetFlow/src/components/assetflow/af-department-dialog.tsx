"use client";

import { useState } from "react";

import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FormOptions } from "@/server/af-data";

import { Field, FormDialog } from "./af-form";
import { useAfMutation } from "./use-af-mutation";

const NONE = "__none__";

export function AddDepartmentDialog({ options }: { options: FormOptions }) {
  const { submit, loading } = useAfMutation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [headId, setHeadId] = useState(NONE);

  function reset() {
    setName("");
    setDescription("");
    setHeadId(NONE);
  }

  async function onSubmit() {
    return submit({
      url: "/api/af/organization/departments",
      method: "POST",
      success: `Department "${name.trim()}" created`,
      body: {
        name: name.trim(),
        description: description.trim() || null,
        head_id: headId === NONE ? null : headId,
      },
    });
  }

  return (
    <FormDialog
      trigger={
        <Button>
          <Building2 className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      }
      title="Add Department"
      description="Create a new organizational division."
      submitLabel="Create Department"
      loading={loading}
      disabled={!name.trim()}
      onOpenChange={(open) => open && reset()}
      onSubmit={onSubmit}
    >
      <Field label="Name" htmlFor="af-dept-name" required>
        <Input id="af-dept-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Engineering" />
      </Field>

      <Field label="Description" htmlFor="af-dept-desc">
        <Textarea
          id="af-dept-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What this department does…"
          rows={2}
        />
      </Field>

      <Field label="Department Head">
        <Select value={headId} onValueChange={setHeadId}>
          <SelectTrigger>
            <SelectValue placeholder="Select head" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>Unassigned</SelectItem>
            {options.users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name} ({u.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </FormDialog>
  );
}
