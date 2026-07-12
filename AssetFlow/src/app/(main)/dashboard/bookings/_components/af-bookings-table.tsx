"use client";

import { useState } from "react";
import { format } from "date-fns";

export function BookingsTable({ bookings }: { bookings: any[] }) {
  const [search, setSearch] = useState("");

  const filteredBookings = bookings.filter((booking) => 
    booking.asset_name.toLowerCase().includes(search.toLowerCase()) || 
    booking.user_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="p-4 border-b">
        <input 
          type="text" 
          placeholder="Search by resource or user..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-9 w-full md:w-[300px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                  <tr key={booking.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium text-primary">{booking.asset_name}</td>
                    <td className="p-4 align-middle font-medium">{booking.user_name}</td>
                    <td className="p-4 align-middle">
                      {format(new Date(booking.start_time), "MMM d, yyyy h:mm a")}
                    </td>
                    <td className="p-4 align-middle">
                      <span className={new Date(booking.end_time) < new Date() && booking.status === 'Ongoing' ? 'text-destructive font-medium' : ''}>
                        {format(new Date(booking.end_time), "MMM d, yyyy h:mm a")}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground max-w-[200px] truncate" title={booking.purpose || ""}>
                      {booking.purpose || "-"}
                    </td>
                    <td className="p-4 align-middle">
                      <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 
                        ${booking.status === 'Upcoming' ? 'border-transparent bg-blue-500 text-white' : 
                          booking.status === 'Ongoing' ? 'border-transparent bg-amber-500 text-white' : 
                          booking.status === 'Completed' ? 'border-transparent bg-emerald-500 text-white' : 
                          'border-transparent bg-slate-500 text-white'}`}>
                        {booking.status}
                      </div>
                    </td>
                    <td className="p-4 align-middle text-right">
                      {booking.status === 'Upcoming' && (
                        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-destructive hover:bg-destructive/10 h-8 px-3">
                          Cancel
                        </button>
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
