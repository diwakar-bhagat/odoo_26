import { Plus } from "lucide-react";

import { AssetDialog } from "@/components/assetflow/af-asset-dialog";
import { Button } from "@/components/ui/button";
import { getAssets, getFormOptions } from "@/server/af-data";

import { AssetsTable } from "./_components/af-assets-table";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const [assets, options] = await Promise.all([getAssets(), getFormOptions()]);

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Asset Registry</h1>
          <p className="mt-1 text-muted-foreground">Manage and track all company assets</p>
        </div>
        <div className="flex items-center gap-2">
          <AssetDialog
            mode="create"
            options={options}
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Register Asset
              </Button>
            }
          />
        </div>
      </div>

      <AssetsTable assets={assets} options={options} />
    </div>
  );
}
