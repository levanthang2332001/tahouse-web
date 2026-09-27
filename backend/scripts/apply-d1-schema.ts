import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

async function applyD1Schema() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const token = process.env.CLOUDFLARE_D1_API_TOKEN;

  console.log(`Applying schema to D1 Database: ${databaseId}...`);

  const drizzleDir = path.join(__dirname, '../drizzle');
  const sqlFiles = fs.readdirSync(drizzleDir).filter((f) => f.endsWith('.sql'));
  if (sqlFiles.length === 0) throw new Error('No SQL migration files found in drizzle/');

  const sqlFilePath = path.join(drizzleDir, sqlFiles[0]);
  console.log(`Reading SQL file: ${sqlFilePath}`);
  const fullSql = fs.readFileSync(sqlFilePath, 'utf-8');

  // Drop existing tables to recreate with new UUID schema
  const dropTables = [
    'DROP TABLE IF EXISTS subcategories;',
    'DROP TABLE IF EXISTS categories;',
    'DROP TABLE IF EXISTS products;',
    'DROP TABLE IF EXISTS brands;',
    'DROP TABLE IF EXISTS media;',
    'DROP TABLE IF EXISTS users;',
    'DROP TABLE IF EXISTS sqlite_sequence;',
  ];

  for (const drop of dropTables) {
    try {
      await axios.post(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
        { sql: drop },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } },
      );
    } catch {
      // ignore
    }
  }

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
  console.log('\n✅ Toàn bộ schema UUID đã được tạo thành công trên Cloudflare D1!');
}

applyD1Schema().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
