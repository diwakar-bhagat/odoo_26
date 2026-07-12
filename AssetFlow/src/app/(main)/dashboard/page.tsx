import { getDashboardData } from "@/server/af-data";

import { AssetFlowDashboard } from "./_components/af-dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return <AssetFlowDashboard data={data} />;
}
