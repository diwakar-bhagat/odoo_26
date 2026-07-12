"use client";

import { useState } from "react";
import { format } from "date-fns";

export function AssetsTable({ assets }: { assets: any[] }) {
  const [search, setSearch] = useState("");

  const filteredAssets = assets.filter((asset) => 
    asset.name.toLowerCase().includes(search.toLowerCase()) || 
    asset.asset_tag.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="p-4 border-b">
        <input 
          type="text" 
          placeholder="Search by name or tag..." 
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
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Asset Tag</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Serial No.</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Acquired</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No assets found.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-semibold text-primary">{asset.asset_tag}</td>
                    <td className="p-4 align-middle font-medium">
                      {asset.name}
                      {asset.is_bookable && (
                        <span className="ml-2 inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Bookable</span>
                      )}
                    </td>
                    <td className="p-4 align-middle">{asset.category_name}</td>
                    <td className="p-4 align-middle text-muted-foreground">{asset.serial_number || "-"}</td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {asset.acquisition_date ? format(new Date(asset.acquisition_date), "MMM d, yyyy") : "-"}
                    </td>
                    <td className="p-4 align-middle">
                      <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 
                        ${asset.status === 'Available' ? 'border-transparent bg-emerald-500 text-white hover:bg-emerald-600' : 
                          asset.status === 'Allocated' ? 'border-transparent bg-blue-500 text-white hover:bg-blue-600' : 
                          asset.status === 'Under Maintenance' ? 'border-transparent bg-amber-500 text-white hover:bg-amber-600' : 
                          'text-foreground'}`}>
                        {asset.status}
                      </div>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9">
                        <span className="sr-only">Open menu</span>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><path d="M8.625 2.5C8.625 3.12132 8.12132 3.625 7.5 3.625C6.87868 3.625 6.375 3.12132 6.375 2.5C6.375 1.87868 6.87868 1.375 7.5 1.375C8.12132 1.375 8.625 1.87868 8.625 2.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM7.5 13.625C8.12132 13.625 8.625 13.1213 8.625 12.5C8.625 11.8787 8.12132 11.375 7.5 11.375C6.87868 11.375 6.375 11.8787 6.375 12.5C6.375 13.1213 6.87868 13.625 7.5 13.625Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                      </button>
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
