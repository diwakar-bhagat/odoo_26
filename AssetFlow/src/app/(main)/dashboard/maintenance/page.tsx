import { headers, cookies } from "next/headers";
import { MaintenanceTable } from "./_components/af-maintenance-table";
import { Wrench } from "lucide-react";

async function getMaintenance() {
  const host = (await headers()).get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const cookieStore = await cookies();
  
  const res = await fetch(`${protocol}://${host}/api/af/maintenance`, {
    cache: "no-store",
    headers: {
      cookie: cookieStore.toString(),
    },
  });
  
  if (!res.ok) throw new Error("Failed to fetch maintenance records");
  const data = await res.json();
  return data.maintenance;
}

export default async function MaintenancePage() {
  const maintenance = await getMaintenance();

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground mt-1">Track repairs and routine service requests</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
            <Wrench className="mr-2 h-4 w-4" />
            Report Issue
          </button>
        </div>
      </div>
      
      <MaintenanceTable maintenance={maintenance} />
    </div>
  );
}
