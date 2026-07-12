"use client";

import { useState } from "react";

import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FormOptions } from "@/server/af-data";

import { Field, FormDialog } from "./af-form";
import { useAfMutation } from "./use-af-mutation";

export function NewBookingDialog({ options }: { options: FormOptions }) {
  const { submit, loading } = useAfMutation();
  const [resourceId, setResourceId] = useState("");
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  function reset() {
    setResourceId("");
    setTitle("");
    setStart("");
    setEnd("");
  }

  const valid = Boolean(resourceId && title.trim() && start && end);

  async function onSubmit() {
    return submit({
      url: "/api/af/bookings",
      method: "POST",
      success: "Booking created",
      body: {
        resource_id: resourceId,
        title: title.trim(),
        start_time: new Date(start).toISOString(),
        end_time: new Date(end).toISOString(),
      },
    });
  }

  return (
    <FormDialog
      trigger={
        <Button>
          <CalendarDays className="mr-2 h-4 w-4" />
          New Booking
        </Button>
      }
      title="New Booking"
      description="Reserve a bookable resource for a time window."
      submitLabel="Create Booking"
      loading={loading}
      disabled={!valid}
      onOpenChange={(open) => open && reset()}
      onSubmit={onSubmit}
    >
      <Field
        label="Resource"
        required
        hint={options.bookableAssets.length === 0 ? "No bookable resources exist yet." : undefined}
      >
        <Select value={resourceId} onValueChange={setResourceId}>
          <SelectTrigger>
            <SelectValue placeholder="Select resource" />
          </SelectTrigger>
          <SelectContent>
            {options.bookableAssets.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.asset_tag} — {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Title" htmlFor="af-booking-title" required>
        <Input
          id="af-booking-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sprint planning"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Start" htmlFor="af-booking-start" required>
          <Input id="af-booking-start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
        </Field>
        <Field label="End" htmlFor="af-booking-end" required>
          <Input id="af-booking-end" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        </Field>
      </div>
    </FormDialog>
  );
}
