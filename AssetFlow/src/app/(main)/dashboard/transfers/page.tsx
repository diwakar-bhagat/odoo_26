import { headers, cookies } from "next/headers";
import { TransfersTable } from "./_components/af-transfers-table";
import { ArrowRightLeft } from "lucide-react";

async function getTransfers() {
  const host = (await headers()).get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const cookieStore = await cookies();
  
  const res = await fetch(`${protocol}://${host}/api/af/transfers`, {
    cache: "no-store",
    headers: {
      cookie: cookieStore.toString(),
    },
  });
  
  if (!res.ok) throw new Error("Failed to fetch transfers");
  const data = await res.json();
  return data.transfers;
}

export default async function TransfersPage() {
  const transfers = await getTransfers();

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Asset Transfers</h1>
          <p className="text-muted-foreground mt-1">Manage cross-department asset movement requests</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Request Transfer
          </button>
        </div>
      </div>
      
      <TransfersTable transfers={transfers} />
    </div>
  );
}
