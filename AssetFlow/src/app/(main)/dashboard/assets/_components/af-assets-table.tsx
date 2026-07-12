"use client";

import { useState } from "react";

import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { AssetDialog } from "@/components/assetflow/af-asset-dialog";
import { useAfMutation } from "@/components/assetflow/use-af-mutation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FormOptions } from "@/server/af-data";

export function AssetsTable({
  assets,
  options,
}: {
  assets: any[];
  options: Pick<FormOptions, "categories" | "departments">;
}) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<any | null>(null);
  const { submit, loading } = useAfMutation();

  const filteredAssets = assets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.asset_tag.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleDelete() {
    if (!deleting) return;
    const ok = await submit({
      url: `/api/af/assets/${deleting.id}`,
      method: "DELETE",
      success: `Asset "${deleting.asset_tag}" deleted`,
    });
    if (ok) setDeleting(null);
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="border-b p-4">
        <input
          type="text"
          placeholder="Search by name or tag..."
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
                  <tr
                    key={asset.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle font-semibold text-primary">{asset.asset_tag}</td>
                    <td className="p-4 align-middle font-medium">
                      {asset.name}
                      {asset.is_bookable && (
                        <span className="ml-2 inline-flex items-center rounded-md border bg-blue-100 px-2 py-0.5 font-semibold text-[10px] text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          Bookable
                        </span>
                      )}
                    </td>
                    <td className="p-4 align-middle">{asset.category_name}</td>
                    <td className="p-4 align-middle text-muted-foreground">{asset.serial_number || "-"}</td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {asset.acquisition_date ? format(new Date(asset.acquisition_date), "MMM d, yyyy") : "-"}
                    </td>
                    <td className="p-4 align-middle">
                      <div
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                          asset.status === "Available"
                            ? "border-transparent bg-emerald-500 text-white hover:bg-emerald-600"
                            : asset.status === "Allocated"
                              ? "border-transparent bg-blue-500 text-white hover:bg-blue-600"
                              : asset.status === "Under Maintenance"
                                ? "border-transparent bg-amber-500 text-white hover:bg-amber-600"
                                : "text-foreground"
                        }`}
                      >
                        {asset.status}
                      </div>
                    </td>
                    <td className="p-4 text-right align-middle">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditing(asset)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleting(asset)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing ? (
        <AssetDialog
          mode="edit"
          asset={editing}
          options={options}
          open={Boolean(editing)}
          onOpenChange={(open) => !open && setEditing(null)}
        />
      ) : null}

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete asset?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes <span className="font-semibold">{deleting?.asset_tag}</span> — {deleting?.name}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
