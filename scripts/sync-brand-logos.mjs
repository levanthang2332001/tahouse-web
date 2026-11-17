#!/usr/bin/env node
/**
 * Script đồng bộ logo các thương hiệu lên Cloudflare R2 qua API https://api.tahouse.net
 * 
 * Cách chạy:
 *   node scripts/sync-brand-logos.mjs --user <admin_user> --pass <admin_pass>
 * hoặc:
 *   ADMIN_USER=<user> ADMIN_PASS=<pass> node scripts/sync-brand-logos.mjs
 * hoặc dùng token trực tiếp nếu đã đăng nhập:
 *   ADMIN_TOKEN=<jwt_token> node scripts/sync-brand-logos.mjs
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const BRANDS_DIR = path.join(ROOT_DIR, "frontend/public/brands");

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(path.join(ROOT_DIR, "frontend/.env.local"));
loadEnvFile(path.join(ROOT_DIR, "frontend/.env"));

const API_BASE = process.env.API_BASE || process.env.BACKEND_API_URL || "https://api.tahouse.net";

// Danh sách các thương hiệu và file logo nguồn
const BRAND_MAPPINGS = [
  { slug: "philips", name: "Philips", file: "philips.png" },
  { slug: "kassler", name: "Kassler", file: "kassler-2026.png" },
  { slug: "eurogold", name: "Eurogold", file: "eurogold-2026.jpg" },
  { slug: "grandx", name: "GrandX", file: "grandx-2026.png" },
  { slug: "eurosun", name: "Eurosun", file: "eurosun-2026.png" },
  { slug: "konox", name: "Konox", file: "konox-2026.png" },
  { slug: "kocher", name: "Kocher", file: "kocher-2026.png" },
  { slug: "malloca", name: "Malloca", file: "malloca-2026.png" },
  { slug: "bosch", name: "Bosch", file: "bosch.png" },
  { slug: "hubert", name: "Hubert", file: "hubert.png" },
  { slug: "kaadas", name: "Kaadas", file: "kaadas.png" },
  { slug: "demax", name: "Demax", file: "demax.png" },
  { slug: "nobinox", name: "Nobinox", file: "nobinox.png" },
  { slug: "hd-door", name: "HD Door", file: "hd-door.png" },
  { slug: "panasonic", name: "Panasonic", file: "panasonic.png" },
  { slug: "sharp", name: "Sharp", file: "sharp.png" },
  { slug: "hyundai", name: "Hyundai", file: "hyundai.png" },
  { slug: "fanlight", name: "Fanlight", file: "fanlight.png" },
  { slug: "karofi", name: "Karofi", file: "karofi.png" },
  { slug: "hafele", name: "Hafele", file: "hafele.png" },
  { slug: "kaff", name: "Kaff", file: "kaff.jpg" },
  { slug: "grob", name: "Grob", file: "grob.png" },
];

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    user: process.env.ADMIN_USER || "",
    pass: process.env.ADMIN_PASS || "",
    token: process.env.ADMIN_TOKEN || "",
    brand: "",
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--user" || args[i] === "-u") parsed.user = args[++i];
    else if (args[i] === "--pass" || args[i] === "-p") parsed.pass = args[++i];
    else if (args[i] === "--token" || args[i] === "-t") parsed.token = args[++i];
    else if (args[i] === "--brand" || args[i] === "-b") parsed.brand = args[++i];
  }
  return parsed;
}

async function login(username, password) {
  console.log(`\n🔑 Đang đăng nhập vào ${API_BASE} bằng tài khoản: ${username}...`);
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "TA House Admin Script/1.0",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(`Đăng nhập thất bại: ${data.message || res.statusText}`);
  }

  const token = data.data?.accessToken;
  if (!token) throw new Error("API không trả về accessToken");
  console.log("✅ Đăng nhập thành công!");
  return token;
}

async function uploadFileToR2(filePath, brandSlug, token) {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const mimeType = fileName.endsWith(".png")
    ? "image/png"
    : fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")
    ? "image/jpeg"
    : fileName.endsWith(".webp")
    ? "image/webp"
    : "application/octet-stream";

  const blob = new Blob([fileBuffer], { type: mimeType });
  const formData = new FormData();
  formData.append("file", blob, fileName);
  formData.append("folder", "brands");
  formData.append("brand", brandSlug);

  const res = await fetch(`${API_BASE}/admin/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "TA House Admin Script/1.0",
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(`Upload lỗi [${fileName}]: ${data.message || res.statusText}`);
  }

  return data.data?.url;
}

async function patchBrandLogo(brandSlug, brandName, logoUrl, token) {
  // Thử PATCH trước
  let res = await fetch(`${API_BASE}/admin/brands/${encodeURIComponent(brandSlug)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "TA House Admin Script/1.0",
    },
    body: JSON.stringify({ logo: logoUrl }),
  });

  if (res.status === 404) {
    // Nếu thương hiệu chưa tồn tại trong DB, tạo mới bằng POST
    console.log(`   ℹ️ Thương hiệu "${brandSlug}" chưa có trong cơ sở dữ liệu, đang tạo mới...`);
    res = await fetch(`${API_BASE}/admin/brands`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "TA House Admin Script/1.0",
      },
      body: JSON.stringify({
        name: brandName,
        slug: brandSlug,
        logo: logoUrl,
      }),
    });
  }

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(`Cập nhật brand lỗi [${brandSlug}]: ${data.message || res.statusText}`);
  }

  return true;
}

async function main() {
  const { user, pass, token: initialToken, brand: targetBrand } = parseArgs();

  let token = initialToken;
  if (!token) {
    if (!user || !pass) {
      console.log(`
========================================================================
🚀 HƯỚNG DẪN ĐỒNG BỘ LOGO THƯƠNG HIỆU LÊN CLOUDFLARE R2
========================================================================
Vui lòng chạy lệnh kèm tài khoản Admin để xác thực API:
  node scripts/sync-brand-logos.mjs --user <admin_user> --pass <admin_pass>

Hoặc nếu đã có Bearer token từ trình duyệt:
  node scripts/sync-brand-logos.mjs --token <access_token>
========================================================================
`);
      process.exit(1);
    }
    token = await login(user, pass);
  }

  console.log("\n📦 Bắt đầu upload logo thương hiệu lên Cloudflare R2 & cập nhật Database...");

  const results = [];
  const itemsToSync = targetBrand
    ? BRAND_MAPPINGS.filter(
        (m) =>
          m.slug.toLowerCase() === targetBrand.toLowerCase() ||
          m.name.toLowerCase() === targetBrand.toLowerCase()
      )
    : BRAND_MAPPINGS;

  if (itemsToSync.length === 0) {
    console.error(`❌ Không tìm thấy cấu hình cho thương hiệu "${targetBrand}"`);
    process.exit(1);
  }

  for (const item of itemsToSync) {
    let sourcePath = path.join(BRANDS_DIR, item.file);
    let tempPngPath = null;

    if (!fs.existsSync(sourcePath)) {
      console.warn(`⚠️  Bỏ qua ${item.name}: Không tìm thấy file ${sourcePath}`);
      continue;
    }

    try {
      // API R2 chặn SVG (chỉ nhận JPG/PNG/WebP/GIF qua magic bytes), tự động convert SVG -> PNG
      if (item.convertSvg || item.file.endsWith(".svg")) {
        tempPngPath = `/tmp/${item.slug}-logo.png`;
        execSync(`sips -s format png "${sourcePath}" --out "${tempPngPath}"`, { stdio: "ignore" });
        sourcePath = tempPngPath;
      }

      console.log(`\n⏳ [${item.name}] Đang upload ${path.basename(sourcePath)} lên R2...`);
      const r2Url = await uploadFileToR2(sourcePath, item.slug, token);
      console.log(`   🔗 R2 URL: ${r2Url}`);

      console.log(`   📝 Đang cập nhật logo trong DB cho brand "${item.slug}"...`);
      await patchBrandLogo(item.slug, item.name, r2Url, token);
      console.log(`   ✅ Hoàn tất ${item.name}!`);

      results.push({ brand: item.name, slug: item.slug, url: r2Url, success: true });
    } catch (err) {
      console.error(`   ❌ Thất bại: ${err.message}`);
      results.push({ brand: item.name, slug: item.slug, error: err.message, success: false });
    } finally {
      if (tempPngPath && fs.existsSync(tempPngPath)) {
        try { fs.unlinkSync(tempPngPath); } catch {}
      }
    }
  }

  console.log("\n========================================================================");
  console.log("🏁 BÁO CÁO KẾT QUẢ ĐỒNG BỘ LOGO THƯƠNG HIỆU LÊN R2");
  console.log("========================================================================");
  for (const r of results) {
    if (r.success) {
      console.log(`✓ ${r.brand} (${r.slug}): ${r.url}`);
    } else {
      console.log(`✗ ${r.brand} (${r.slug}): Lỗi - ${r.error}`);
    }
  }
}

main().catch((err) => {
  console.error("\n❌ Lỗi thực thi script:", err.message);
  process.exit(1);
});
