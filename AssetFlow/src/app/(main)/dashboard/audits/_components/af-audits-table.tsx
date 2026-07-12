"use client";

import { useState } from "react";
import { format } from "date-fns";

export function AuditsTable({ audits }: { audits: any[] }) {
  const [search, setSearch] = useState("");

  const filteredAudits = audits.filter((a) => 
    a.auditor_name.toLowerCase().includes(search.toLowerCase()) ||
    (a.notes || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="p-4 border-b">
        <input 
          type="text" 
          placeholder="Search audits..." 
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
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Started Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Auditor</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Assets Checked</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Notes</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filteredAudits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No audits found.
                  </td>
                </tr>
              ) : (
                filteredAudits.map((a) => (
                  <tr key={a.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium">#{a.id.substring(0, 8)}</td>
                    <td className="p-4 align-middle">
                      {format(new Date(a.started_at), "MMM d, yyyy")}
                    </td>
                    <td className="p-4 align-middle font-medium">{a.auditor_name}</td>
                    <td className="p-4 align-middle">
                      {a.status === 'Completed' ? a.total_assets : '0'} / {a.total_assets}
                    </td>
                    <td className="p-4 align-middle text-muted-foreground max-w-[200px] truncate" title={a.notes || ""}>
                      {a.notes || "-"}
                    </td>
                    <td className="p-4 align-middle">
                      <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 
                        ${a.status === 'In Progress' ? 'border-transparent bg-amber-500 text-white' : 
                          a.status === 'Completed' ? 'border-transparent bg-emerald-500 text-white' : 
                          'border-transparent bg-slate-500 text-white'}`}>
                        {a.status}
                      </div>
                    </td>
                    <td className="p-4 align-middle text-right">
                      {a.status === 'In Progress' && (
                        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-emerald-50 text-emerald-600 shadow-sm hover:bg-emerald-100 hover:text-emerald-700 h-8 px-3">
                          Complete Audit
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
