"use client";

import { useState } from "react";

import { format } from "date-fns";

import { useAfMutation } from "@/components/assetflow/use-af-mutation";
import { Button } from "@/components/ui/button";

export function TransfersTable({ transfers }: { transfers: any[] }) {
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const { submit } = useAfMutation();

  const filteredTransfers = transfers.filter(
    (t) =>
      t.asset_name.toLowerCase().includes(search.toLowerCase()) ||
      t.asset_tag.toLowerCase().includes(search.toLowerCase()),
  );

  async function decide(id: string, action: "approve" | "reject") {
    setBusyId(id);
    await submit({
      url: `/api/af/transfers/${id}/approve`,
      method: "POST",
      body: { action },
      success: action === "approve" ? "Transfer approved" : "Transfer rejected",
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
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">From</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">To</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Requested At</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No transfer requests found.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle">
                      <div className="font-semibold text-primary">{t.asset_tag}</div>
                      <div className="text-muted-foreground text-xs">{t.asset_name}</div>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">{t.from_name}</td>
                    <td className="p-4 align-middle font-medium">{t.to_name}</td>
                    <td className="p-4 align-middle">
                      {t.requested_at ? format(new Date(t.requested_at), "MMM d, yyyy") : "-"}
                    </td>
                    <td className="p-4 align-middle">
                      <div
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                          t.status === "Pending"
                            ? "border-transparent bg-amber-500 text-white"
                            : t.status === "Approved"
                              ? "border-transparent bg-emerald-500 text-white"
                              : "border-transparent bg-destructive text-destructive-foreground"
                        }`}
                      >
                        {t.status}
                      </div>
                    </td>
                    <td className="space-x-2 p-4 text-right align-middle">
                      {t.status === "Pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                            disabled={busyId === t.id}
                            onClick={() => decide(t.id, "approve")}
                          >
                            {busyId === t.id ? "…" : "Approve"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            disabled={busyId === t.id}
                            onClick={() => decide(t.id, "reject")}
                          >
                            Reject
                          </Button>
                        </>
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
