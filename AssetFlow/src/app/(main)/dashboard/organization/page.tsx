import { headers, cookies } from "next/headers";
import { OrganizationTabs } from "./_components/af-organization-tabs";
import { Building2 } from "lucide-react";

async function getOrganizationData() {
  const host = (await headers()).get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const cookieStore = await cookies();
  
  const options = {
    cache: "no-store" as RequestCache,
    headers: {
      cookie: cookieStore.toString(),
    },
  };

  const [deptRes, empRes] = await Promise.all([
    fetch(`${protocol}://${host}/api/af/organization/departments`, options),
    fetch(`${protocol}://${host}/api/af/organization/employees`, options)
  ]);
  
  if (!deptRes.ok || !empRes.ok) throw new Error("Failed to fetch organization data");
  
  const depts = await deptRes.json();
  const emps = await empRes.json();
  
  return {
    departments: depts.departments || [],
    employees: emps.employees || []
  };
}

export default async function OrganizationPage() {
  const data = await getOrganizationData();

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organization Setup</h1>
          <p className="text-muted-foreground mt-1">Manage departments, roles, and personnel</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
            <Building2 className="mr-2 h-4 w-4" />
            Add Department
          </button>
        </div>
      </div>
      
      <OrganizationTabs data={data} />
    </div>
  );
}
