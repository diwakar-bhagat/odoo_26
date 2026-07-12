import { StartAuditDialog } from "@/components/assetflow/af-audit-dialog";
import { getAudits } from "@/server/af-data";

import { AuditsTable } from "./_components/af-audits-table";

export const dynamic = "force-dynamic";

export default async function AuditsPage() {
  const audits = await getAudits();

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">System Audits</h1>
          <p className="mt-1 text-muted-foreground">Verify asset inventory and detect discrepancies</p>
        </div>
        <div className="flex items-center gap-2">
          <StartAuditDialog />
        </div>
      </div>

      <AuditsTable audits={audits} />
    </div>
  );
}
