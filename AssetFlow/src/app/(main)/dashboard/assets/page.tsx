import { headers, cookies } from "next/headers";
import { AssetsTable } from "./_components/af-assets-table";
import { Plus } from "lucide-react";

async function getAssets() {
  const host = (await headers()).get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const cookieStore = await cookies();
  
  const res = await fetch(`${protocol}://${host}/api/af/assets`, {
    cache: "no-store",
    headers: {
      cookie: cookieStore.toString(),
    },
  });
  
  if (!res.ok) throw new Error("Failed to fetch assets");
  const data = await res.json();
  return data.assets;
}

export default async function AssetsPage() {
  const assets = await getAssets();

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Asset Registry</h1>
          <p className="text-muted-foreground mt-1">Manage and track all company assets</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
            <Plus className="mr-2 h-4 w-4" />
            Register Asset
          </button>
        </div>
      </div>
      
      <AssetsTable assets={assets} />
    </div>
  );
}
