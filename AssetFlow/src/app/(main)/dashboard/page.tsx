import { headers, cookies } from "next/headers";
import { AssetFlowDashboard } from "./_components/af-dashboard-client";

async function getDashboardData() {
  const host = (await headers()).get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const cookieStore = await cookies();
  
  const res = await fetch(`${protocol}://${host}/api/af/dashboard/kpis`, {
    cache: "no-store",
    headers: {
      cookie: cookieStore.toString(),
    },
  });
  
  if (!res.ok) {
    const text = await res.text();
    console.error("Dashboard API Error:", res.status, text.slice(0, 100));
    throw new Error(`Failed to fetch dashboard data: ${res.status}`);
  }
  return res.json();
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  
  return (
    <AssetFlowDashboard data={data} />
  );
}

