"use client";

import { useState } from "react";

import { format } from "date-fns";

import { useAfMutation } from "@/components/assetflow/use-af-mutation";
import { Button } from "@/components/ui/button";

export function BookingsTable({ bookings }: { bookings: any[] }) {
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const { submit } = useAfMutation();

  const filteredBookings = bookings.filter(
    (booking) =>
      (booking.resource_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (booking.booked_by_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (booking.title || "").toLowerCase().includes(search.toLowerCase()),
  );

  async function cancelBooking(id: string) {
    setBusyId(id);
    await submit({
      url: `/api/af/bookings/${id}/cancel`,
      method: "POST",
      success: "Booking cancelled",
    });
    setBusyId(null);
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="border-b p-4">
        <input
          type="text"
          placeholder="Search by resource or title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:w-[300px]"
        />
      </div>
      <div className="p-0">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Resource</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Booked By</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Start Time</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">End Time</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Purpose</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle">
                      <div className="font-medium text-primary">{booking.resource_name}</div>
                      <div className="text-muted-foreground text-xs">{booking.asset_tag}</div>
                    </td>
                    <td className="p-4 align-middle font-medium">{booking.booked_by_name}</td>
                    <td className="p-4 align-middle">{format(new Date(booking.start_time), "MMM d, yyyy h:mm a")}</td>
                    <td className="p-4 align-middle">
                      <span
                        className={
                          new Date(booking.end_time) < new Date() && booking.status === "Ongoing"
                            ? "font-medium text-destructive"
                            : ""
                        }
                      >
                        {format(new Date(booking.end_time), "MMM d, yyyy h:mm a")}
                      </span>
                    </td>
                    <td
                      className="max-w-[200px] truncate p-4 align-middle text-muted-foreground"
                      title={booking.title || ""}
                    >
                      {booking.title || "-"}
                    </td>
                    <td className="p-4 align-middle">
                      <div
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                          booking.status === "Upcoming"
                            ? "border-transparent bg-blue-500 text-white"
                            : booking.status === "Ongoing"
                              ? "border-transparent bg-amber-500 text-white"
                              : booking.status === "Completed"
                                ? "border-transparent bg-emerald-500 text-white"
                                : "border-transparent bg-slate-500 text-white"
                        }`}
                      >
                        {booking.status}
                      </div>
                    </td>
                    <td className="p-4 text-right align-middle">
                      {(booking.status === "Upcoming" || booking.status === "Ongoing") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={busyId === booking.id}
                          onClick={() => cancelBooking(booking.id)}
                        >
                          {busyId === booking.id ? "…" : "Cancel"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
