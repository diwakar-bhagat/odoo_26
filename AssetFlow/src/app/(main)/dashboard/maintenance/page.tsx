import { ReportIssueDialog } from "@/components/assetflow/af-maintenance-dialog";
import { getFormOptions, getMaintenance } from "@/server/af-data";

import { MaintenanceTable } from "./_components/af-maintenance-table";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const [maintenance, options] = await Promise.all([getMaintenance(), getFormOptions()]);

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Maintenance</h1>
          <p className="mt-1 text-muted-foreground">Track repairs and routine service requests</p>
        </div>
        <div className="flex items-center gap-2">
          <ReportIssueDialog options={options} />
        </div>
      </div>

      <MaintenanceTable maintenance={maintenance} />
    </div>
  );
}
