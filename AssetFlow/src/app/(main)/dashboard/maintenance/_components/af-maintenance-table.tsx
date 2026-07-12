"use client";

import { useState } from "react";

import { format } from "date-fns";

import { useAfMutation } from "@/components/assetflow/use-af-mutation";
import { Button } from "@/components/ui/button";

export function MaintenanceTable({ maintenance }: { maintenance: any[] }) {
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const { submit } = useAfMutation();

  const filteredMaintenance = maintenance.filter(
    (m) =>
      m.asset_name.toLowerCase().includes(search.toLowerCase()) ||
      m.asset_tag.toLowerCase().includes(search.toLowerCase()),
  );

  async function runAction(id: string, action: "approve" | "resolve") {
    setBusyId(id);
    await submit({
      url: `/api/af/maintenance/${id}/${action}`,
      method: "POST",
      body: action === "approve" ? { assigned_to: null } : { resolution: null },
      success: action === "approve" ? "Request approved" : "Request resolved",
    });
    setBusyId(null);
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="border-b p-4">
        <input
          type="text"
          placeholder="Search by asset..."
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
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Asset</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Reported By</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date Reported</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Description</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Priority</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filteredMaintenance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No maintenance records found.
                  </td>
                </tr>
              ) : (
                filteredMaintenance.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle">
                      <div className="font-semibold text-primary">{m.asset_tag}</div>
                      <div className="text-muted-foreground text-xs">{m.asset_name}</div>
                    </td>
                    <td className="p-4 align-middle font-medium">{m.requested_by_name}</td>
                    <td className="p-4 align-middle">
                      {m.requested_at ? format(new Date(m.requested_at), "MMM d, yyyy") : "-"}
                    </td>
                    <td
                      className="max-w-[250px] truncate p-4 align-middle text-muted-foreground"
                      title={m.description || ""}
                    >
                      {m.description || "-"}
                    </td>
                    <td className="p-4 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold text-xs ${
                          m.priority === "Critical"
                            ? "border-transparent bg-red-500 text-white"
                            : m.priority === "High"
                              ? "border-transparent bg-orange-500 text-white"
                              : m.priority === "Low"
                                ? "border-transparent bg-slate-400 text-white"
                                : "border-transparent bg-yellow-500 text-white"
                        }`}
                      >
                        {m.priority}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <div
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                          m.status === "Pending"
                            ? "border-transparent bg-amber-500 text-white"
                            : m.status === "In Progress" || m.status === "Approved"
                              ? "border-transparent bg-blue-500 text-white"
                              : m.status === "Resolved"
                                ? "border-transparent bg-emerald-500 text-white"
                                : "border-transparent bg-slate-500 text-white"
                        }`}
                      >
                        {m.status}
                      </div>
                    </td>
                    <td className="p-4 text-right align-middle">
                      {m.status === "Pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          disabled={busyId === m.id}
                          onClick={() => runAction(m.id, "approve")}
                        >
                          {busyId === m.id ? "…" : "Approve"}
                        </Button>
                      )}
                      {(m.status === "Approved" || m.status === "In Progress") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-2 h-8 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                          disabled={busyId === m.id}
                          onClick={() => runAction(m.id, "resolve")}
                        >
                          {busyId === m.id ? "…" : "Resolve"}
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
