"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { format } from "date-fns";
import { toast } from "sonner";

export function AllocationsTable({ allocations }: { allocations: any[] }) {
  const [search, setSearch] = useState("");
  const [returning, setReturning] = useState<string | null>(null);
  const router = useRouter();

  const filteredAllocations = allocations.filter(
    (alloc) =>
      alloc.asset_tag.toLowerCase().includes(search.toLowerCase()) ||
      alloc.asset_name.toLowerCase().includes(search.toLowerCase()) ||
      (alloc.user_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (alloc.department_name || "").toLowerCase().includes(search.toLowerCase()),
  );

  const handleReturn = async (id: string) => {
    setReturning(id);
    try {
      const res = await fetch(`/api/af/allocations/${id}/return`, {
        method: "POST",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to return asset");
      }
      toast.success("Asset returned successfully!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setReturning(null);
    }
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search allocations..."
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
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Asset</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Assigned To</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Allocated By</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Expected Return</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filteredAllocations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No active allocations found.
                  </td>
                </tr>
              ) : (
                filteredAllocations.map((alloc) => (
                  <tr
                    key={alloc.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle">
                      <div className="font-semibold text-primary">{alloc.asset_tag}</div>
                      <div className="text-xs text-muted-foreground">{alloc.asset_name}</div>
                    </td>
                    <td className="p-4 align-middle">
                      {alloc.user_name ? (
                        <div>
                          <span className="font-medium">{alloc.user_name}</span>
                          <span className="ml-2 inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold">
                            User
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="font-medium">{alloc.department_name}</span>
                          <span className="ml-2 inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold">
                            Dept
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">{alloc.allocator_name}</td>
                    <td className="p-4 align-middle">{format(new Date(alloc.allocated_at), "MMM d, yyyy")}</td>
                    <td className="p-4 align-middle">
                      {alloc.expected_return ? (
                        <span
                          className={
                            new Date(alloc.expected_return) < new Date() && alloc.status === "Active"
                              ? "text-destructive font-medium"
                              : ""
                          }
                        >
                          {format(new Date(alloc.expected_return), "MMM d, yyyy")}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-4 align-middle">
                      <div
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 
                        ${
                          alloc.status === "Active"
                            ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                            : alloc.status === "Returned"
                              ? "border-transparent bg-emerald-500 text-white hover:bg-emerald-600"
                              : "text-foreground"
                        }`}
                      >
                        {alloc.status}
                      </div>
                    </td>
                    <td className="p-4 align-middle text-right">
                      {alloc.status === "Active" && (
                        <button
                          onClick={() => handleReturn(alloc.id)}
                          disabled={returning === alloc.id}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3"
                        >
                          {returning === alloc.id ? "Returning..." : "Return"}
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
