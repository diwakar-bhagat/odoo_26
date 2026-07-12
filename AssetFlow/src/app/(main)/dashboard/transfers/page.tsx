import { RequestTransferDialog } from "@/components/assetflow/af-transfer-dialog";
import { getFormOptions, getTransfers } from "@/server/af-data";

import { TransfersTable } from "./_components/af-transfers-table";

export const dynamic = "force-dynamic";

export default async function TransfersPage() {
  const [transfers, options] = await Promise.all([getTransfers(), getFormOptions()]);

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Asset Transfers</h1>
          <p className="mt-1 text-muted-foreground">Manage cross-department asset movement requests</p>
        </div>
        <div className="flex items-center gap-2">
          <RequestTransferDialog options={options} />
        </div>
      </div>

      <TransfersTable transfers={transfers} />
    </div>
  );
}
