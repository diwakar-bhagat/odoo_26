import { format } from "date-fns";

export function RecentActivity({ allocations }: { allocations: any[] }) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="font-semibold leading-none tracking-tight">Recent Allocations</h3>
        <p className="text-sm text-muted-foreground">Latest asset assignments</p>
      </div>
      <div className="p-6 pt-0">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Asset Tag</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Asset Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Assigned To</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {allocations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    No recent activity.
                  </td>
                </tr>
              ) : (
                allocations.map((alloc) => (
                  <tr key={alloc.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium">{alloc.asset_tag}</td>
                    <td className="p-4 align-middle">{alloc.asset_name}</td>
                    <td className="p-4 align-middle">{alloc.user_name || "Department"}</td>
                    <td className="p-4 align-middle">
                      {format(new Date(alloc.allocated_at), "MMM d, yyyy")}
                    </td>
                    <td className="p-4 align-middle">
                      <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${alloc.status === 'Active' ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80' : 'text-foreground'}`}>
                        {alloc.status}
                      </div>
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
