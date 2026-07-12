import { neon, neonConfig } from "@neondatabase/serverless";

// Configure Neon to use HTTP fetch
neonConfig.fetchConnectionCache = true;

let hasWarnedMissingDatabase = false;

// Define a placeholder SQL executor if the database URL isn't present.
// Routes should return 503 before hitting this function.
const mockSql = async (first: TemplateStringsArray | string, ...values: any[]) => {
  if (!hasWarnedMissingDatabase && process.env.NODE_ENV === "development") {
    console.warn("[DB] DATABASE_URL not configured");
    hasWarnedMissingDatabase = true;
  }
  return [];
};

type NeonQuery = {
  (strings: TemplateStringsArray, ...params: any[]): Promise<any>;
  (query: string, params?: any[]): Promise<any>;
};
export const sql = (process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : mockSql) as unknown as NeonQuery;
