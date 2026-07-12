import { AllocateAssetDialog } from "@/components/assetflow/af-allocation-dialog";
import { getAllocations, getFormOptions } from "@/server/af-data";

import { AllocationsTable } from "./_components/af-allocations-table";

export const dynamic = "force-dynamic";

export default async function AllocationsPage() {
  const [allocations, options] = await Promise.all([getAllocations(), getFormOptions()]);

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Active Allocations</h1>
          <p className="mt-1 text-muted-foreground">Track where assets are currently assigned</p>
        </div>
        <div className="flex items-center gap-2">
          <AllocateAssetDialog options={options} />
        </div>
      </div>

      <AllocationsTable allocations={allocations} />
    </div>
  );
}
