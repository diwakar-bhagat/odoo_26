import { neon, neonConfig } from "@neondatabase/serverless";

// Configure Neon to use HTTP fetch
neonConfig.fetchConnectionCache = true;

let hasWarnedMissingDatabase = false;

const mockSqlFn = async (_first: TemplateStringsArray | string, ..._values: any[]) => {
  if (!hasWarnedMissingDatabase && process.env.NODE_ENV === "development") {
    console.warn("[DB] DATABASE_URL not configured");
    hasWarnedMissingDatabase = true;
  }
  return [];
};

const mockSql = Object.assign(mockSqlFn, {
  query: async (_query: string, _params?: any[]) => {
    if (!hasWarnedMissingDatabase && process.env.NODE_ENV === "development") {
      console.warn("[DB] DATABASE_URL not configured");
      hasWarnedMissingDatabase = true;
    }
    return [];
  },
});

type NeonQuery = {
  (strings: TemplateStringsArray, ...params: any[]): Promise<any>;
  query(query: string, params?: any[]): Promise<any>;
};
export const sql = (process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : mockSql) as unknown as NeonQuery;
