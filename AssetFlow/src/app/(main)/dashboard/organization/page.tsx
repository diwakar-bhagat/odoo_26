import { AddDepartmentDialog } from "@/components/assetflow/af-department-dialog";
import { getFormOptions, getOrganization } from "@/server/af-data";

import { OrganizationTabs } from "./_components/af-organization-tabs";

export const dynamic = "force-dynamic";

export default async function OrganizationPage() {
  const [data, options] = await Promise.all([getOrganization(), getFormOptions()]);

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Organization Setup</h1>
          <p className="mt-1 text-muted-foreground">Manage departments, roles, and personnel</p>
        </div>
        <div className="flex items-center gap-2">
          <AddDepartmentDialog options={options} />
        </div>
      </div>

      <OrganizationTabs data={data} />
    </div>
  );
}
