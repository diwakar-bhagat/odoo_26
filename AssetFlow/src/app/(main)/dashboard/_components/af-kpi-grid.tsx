import { AlertTriangle, Box, CheckCircle2, Clock } from "lucide-react";

interface KPIGridProps {
  kpis: {
    total_assets: number;
    available_assets: number;
    allocated_assets: number;
    maintenance_assets: number;
    active_bookings: number;
    overdue_returns: number;
    overdue_bookings: number;
    pending_maintenance: number;
    pending_transfers: number;
    overdue_total: number;
  };
}

export function KPIGrid({ kpis }: KPIGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">Total Assets</h3>
          <Box className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="p-6 pt-0">
          <div className="text-2xl font-bold">{kpis.total_assets}</div>
          <p className="text-xs text-muted-foreground mt-1">Across all categories</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">Available Assets</h3>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="p-6 pt-0">
          <div className="text-2xl font-bold">{kpis.available_assets}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {kpis.total_assets > 0 ? Math.round((kpis.available_assets / kpis.total_assets) * 100) : 0}% of total
            inventory
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">Active Bookings</h3>
          <Clock className="h-4 w-4 text-blue-500" />
        </div>
        <div className="p-6 pt-0">
          <div className="text-2xl font-bold">{kpis.active_bookings}</div>
          <p className="text-xs text-muted-foreground mt-1">Resources currently booked</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">Overdue Items</h3>
          <AlertTriangle
            className={`h-4 w-4 ${kpis.overdue_total > 0 ? "text-destructive" : "text-muted-foreground"}`}
          />
        </div>
        <div className="p-6 pt-0">
          <div className={`text-2xl font-bold ${kpis.overdue_total > 0 ? "text-destructive" : ""}`}>
            {kpis.overdue_total}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {kpis.overdue_returns} returns, {kpis.overdue_bookings} bookings
          </p>
        </div>
      </div>
    </div>
  );
}
