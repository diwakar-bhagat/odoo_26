import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { POST } from "../src/app/api/setup/assetflow/route";

async function main() {
  try {
    console.log("Starting database bootstrap and seeding...");
    const res = await POST();
    const data = await res.json();
    console.log("Result:", data);
  } catch (err) {
    console.error("Bootstrap failed:", err);
  }
}

main();
