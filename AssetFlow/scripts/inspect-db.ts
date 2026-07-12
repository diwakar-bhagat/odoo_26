import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { sql } from "../src/lib/db";

async function main() {
  try {
    const tables = [
      "af_users",
      "af_departments",
      "af_asset_categories",
      "af_assets",
      "af_allocations",
      "af_transfers",
      "af_bookings",
      "af_maintenance",
      "af_audits",
      "af_notifications",
      "settings",
    ];
    for (const table of tables) {
      try {
        const res = await sql.query(`SELECT COUNT(*)::int as count FROM public.${table}`);
        console.log(`- ${table}: ${res[0].count} rows`);
      } catch (err) {
        console.log(`- ${table}: Error / Not created:`, (err as Error).message);
      }
    }
  } catch (err) {
    console.error("Failed to inspect database:", err);
  }
}

main();
