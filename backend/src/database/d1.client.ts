import { drizzle } from 'drizzle-orm/sqlite-proxy';
import axios from 'axios';
import * as schema from './schema';

export interface D1Config {
  accountId?: string;
  databaseId?: string;
  apiToken?: string;
}

export type DrizzleD1Client = ReturnType<typeof createD1Client>;
export type D1Database = DrizzleD1Client;

export function createD1Client(config: D1Config) {
  const { accountId, databaseId, apiToken } = config;

  return drizzle(
    async (sql, params, method) => {
      if (!accountId || !databaseId || !apiToken) {
        // Mock / placeholder fallback when D1 credentials are not configured yet
        return { rows: [] };
      }

      try {
        const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;
        const res = await axios.post(
          url,
          { sql, params },
          {
            headers: {
              Authorization: `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          },
        );

        const data = res.data?.result?.[0];
        const rows = data?.results || [];

        if (method === 'all' || method === 'values') {
          return { rows: rows.map((r: any) => Object.values(r)) };
        } else if (method === 'get') {
          return { rows: Object.values(rows[0] || {}) };
        } else if (method === 'run') {
          return { rows: [] };
        }
        return { rows: [] };
      } catch (error: any) {
        const errDetails = error?.response?.data || error?.message;
        console.error('Cloudflare D1 Query Execution Error:', errDetails);
        throw new Error(
          `Cloudflare D1 Error: ${typeof errDetails === 'object' ? JSON.stringify(errDetails) : errDetails}`,
        );
      }
    },
    { schema },
  );
}
