/**
 * Workaround for Vercel Git Integration finalization bug with Next.js 16
 * when the app lives in a subdirectory (Root Directory = frontend).
 *
 * After Build Completed in /vercel/output, the platform still lstats:
 *   /vercel/path0/.next/routes-manifest-deterministic.json
 * while the real output is under:
 *   /vercel/path0/frontend/.next/
 *
 * See:
 * https://community.vercel.com/t/git-integration-fails-after-build-looking-for-routes-manifest-in-repo-root/40519
 * https://github.com/vercel/vercel/issues/15937
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const cwd = process.cwd();
const nextDir = path.join(appRoot, ".next");
const sourceManifest = path.join(nextDir, "routes-manifest.json");

console.log("[vercel-manifest-workaround] cwd =", cwd);
console.log("[vercel-manifest-workaround] appRoot =", appRoot);
console.log("[vercel-manifest-workaround] VERCEL =", process.env.VERCEL ?? "(unset)");

if (!fs.existsSync(sourceManifest)) {
  console.warn(
    "[vercel-manifest-workaround] Skip: .next/routes-manifest.json not found",
  );
  process.exit(0);
}

// Always create the deterministic filename next to the real manifest.
const localDeterministic = path.join(
  nextDir,
  "routes-manifest-deterministic.json",
);
fs.copyFileSync(sourceManifest, localDeterministic);
console.log("[vercel-manifest-workaround] Wrote", localDeterministic);

// Candidates for the wrongly-resolved "repo root" that Vercel finalizes against.
const bridgeRoots = new Set([
  path.resolve(appRoot, ".."),
  "/vercel/path0",
]);

for (const bridgeRoot of bridgeRoots) {
  if (!bridgeRoot || bridgeRoot === appRoot) continue;
  if (!fs.existsSync(path.dirname(bridgeRoot))) continue;

  // Prefer a full .next symlink so later lookups also resolve.
  const bridgeNext = path.join(bridgeRoot, ".next");
  try {
    fs.rmSync(bridgeNext, { recursive: true, force: true });
  } catch {
    // ignore
  }

  try {
    fs.symlinkSync(nextDir, bridgeNext, "dir");
    console.log(
      `[vercel-manifest-workaround] Symlinked ${bridgeNext} -> ${nextDir}`,
    );
  } catch (error) {
    // Fallback: copy the manifests only.
    fs.mkdirSync(bridgeNext, { recursive: true });
    fs.copyFileSync(
      sourceManifest,
      path.join(bridgeNext, "routes-manifest.json"),
    );
    fs.copyFileSync(
      sourceManifest,
      path.join(bridgeNext, "routes-manifest-deterministic.json"),
    );
    console.warn(
      `[vercel-manifest-workaround] Symlink failed (${error instanceof Error ? error.message : error}); copied manifests to ${bridgeNext}`,
    );
  }

  // Some finalizers also resolve node_modules from the repo root.
  const appNodeModules = path.join(appRoot, "node_modules");
  const bridgeNodeModules = path.join(bridgeRoot, "node_modules");
  if (fs.existsSync(appNodeModules) && !fs.existsSync(bridgeNodeModules)) {
    try {
      fs.symlinkSync(appNodeModules, bridgeNodeModules, "dir");
      console.log(
        `[vercel-manifest-workaround] Symlinked ${bridgeNodeModules} -> ${appNodeModules}`,
      );
    } catch (error) {
      console.warn(
        `[vercel-manifest-workaround] node_modules symlink skipped: ${
          error instanceof Error ? error.message : error
        }`,
      );
    }
  }
}

console.log("[vercel-manifest-workaround] Done");
