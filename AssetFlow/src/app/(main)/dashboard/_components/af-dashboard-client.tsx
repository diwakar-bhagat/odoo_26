import { KPIGrid } from "./af-kpi-grid";
import { RecentActivity } from "./af-recent-activity";

interface DashboardData {
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
  charts: {
    status_breakdown: { status: string; count: number }[];
    category_breakdown: { category: string; count: number }[];
  };
  recent_allocations: any[];
}

export function AssetFlowDashboard({ data }: { data: DashboardData }) {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <div className="flex items-center gap-2">
          {/* We can put a Register Asset button here, but typically it goes on the Registry page */}
        </div>
      </div>

      <KPIGrid kpis={data.kpis} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity allocations={data.recent_allocations} />
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="font-semibold leading-none tracking-tight mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <a
                href="/dashboard/assets"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
              >
                Register New Asset
              </a>
              <a
                href="/dashboard/allocations"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                Allocate Asset
              </a>
              <a
                href="/dashboard/bookings"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                Book a Resource
              </a>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="font-semibold leading-none tracking-tight mb-4">Asset Status</h3>
            <div className="space-y-4">
              {data.charts.status_breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center">
                  <div className="w-full flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.status}</span>
                      <span className="text-sm text-muted-foreground">{item.count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full ${item.status === "Available" ? "bg-emerald-500" : item.status === "Allocated" ? "bg-blue-500" : item.status === "Under Maintenance" ? "bg-amber-500" : "bg-slate-500"}`}
                        style={{ width: `${Math.max(2, (item.count / data.kpis.total_assets) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
