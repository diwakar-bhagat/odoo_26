import { NewBookingDialog } from "@/components/assetflow/af-booking-dialog";
import { getBookings, getFormOptions } from "@/server/af-data";

import { BookingsTable } from "./_components/af-bookings-table";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const [bookings, options] = await Promise.all([getBookings(), getFormOptions()]);

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Resource Bookings</h1>
          <p className="mt-1 text-muted-foreground">Manage reservations for bookable assets like conference rooms</p>
        </div>
        <div className="flex items-center gap-2">
          <NewBookingDialog options={options} />
        </div>
      </div>

      <BookingsTable bookings={bookings} />
    </div>
  );
}
