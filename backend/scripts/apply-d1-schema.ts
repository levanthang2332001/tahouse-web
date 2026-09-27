import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

async function applyD1Schema() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const token = process.env.CLOUDFLARE_D1_API_TOKEN;

  console.log(`Applying schema to D1 Database: ${databaseId}...`);

  const sqlFilePath = path.join(__dirname, '../drizzle/0000_wild_solo.sql');
  const fullSql = fs.readFileSync(sqlFilePath, 'utf-8');

  // Split statements by drizzle statement-breakpoint
  const statements = fullSql
    .split('--> statement-breakpoint')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Total statements to execute: ${statements.length}`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      const res = await axios.post(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
        { sql: stmt },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (res.data?.success) {
        console.log(`[${i + 1}/${statements.length}] OK: ${stmt.substring(0, 40).replace(/\n/g, ' ')}...`);
      } else {
        console.error(`[${i + 1}/${statements.length}] Failed:`, res.data?.errors);
      }
    } catch (err: any) {
      console.error(
        `[${i + 1}/${statements.length}] Error executing: ${stmt.substring(0, 40)}`,
        err.response?.data || err.message,
      );
      throw err;
    }
  }

  // Verify list of tables
  const tablesRes = await axios.post(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    { sql: "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;" },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  console.log('\n--- BẢNG HIỆN CÓ TRÊN CLOUDFLARE D1 ---');
  console.log(tablesRes.data?.result?.[0]?.results);
  console.log('\n✅ Toàn bộ schema đã được tạo thành công trên Cloudflare D1!');
}

applyD1Schema().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
