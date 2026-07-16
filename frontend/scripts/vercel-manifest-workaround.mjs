/**
 * Workaround for Vercel Git Integration finalization bug with Next.js 16
 * when the app lives in a subdirectory (Root Directory = frontend).
 *
 * After a successful build, Vercel sometimes looks for:
 *   /vercel/path0/.next/routes-manifest-deterministic.json
 * instead of:
 *   /vercel/path0/frontend/.next/routes-manifest.json
 *
 * See: https://community.vercel.com/t/git-integration-fails-after-build-looking-for-routes-manifest-in-repo-root/40519
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(appRoot, "..");
const source = path.join(appRoot, ".next", "routes-manifest.json");

if (!fs.existsSync(source)) {
  console.warn(
    "[vercel-manifest-workaround] Skip: .next/routes-manifest.json not found",
  );
  process.exit(0);
}

const targets = [
  path.join(appRoot, ".next", "routes-manifest-deterministic.json"),
  path.join(repoRoot, ".next", "routes-manifest.json"),
  path.join(repoRoot, ".next", "routes-manifest-deterministic.json"),
];

for (const target of targets) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  console.log(`[vercel-manifest-workaround] Wrote ${target}`);
}
