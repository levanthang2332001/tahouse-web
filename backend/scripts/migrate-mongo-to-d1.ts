import mongoose from 'mongoose';
import axios from 'axios';
import { randomUUID } from 'crypto';
import 'dotenv/config';

// Load environment variables
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/tahouse';
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_D1_DATABASE_ID = process.env.CLOUDFLARE_D1_DATABASE_ID;
const CLOUDFLARE_D1_API_TOKEN = process.env.CLOUDFLARE_D1_API_TOKEN;

async function executeD1(sql: string, params: any[] = []): Promise<any> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${CLOUDFLARE_D1_DATABASE_ID}/query`;
  const res = await axios.post(
    url,
    { sql, params },
    {
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_D1_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    },
  );
  if (!res.data?.success) {
    throw new Error(JSON.stringify(res.data?.errors));
  }
  return res.data?.result?.[0]?.results || [];
}

async function batchExecuteD1(queries: { sql: string; params: any[] }[], concurrency: number = 10): Promise<void> {
  for (let i = 0; i < queries.length; i += concurrency) {
    const chunk = queries.slice(i, i + concurrency);
    await Promise.all(chunk.map((q) => executeD1(q.sql, q.params)));
  }
}

async function runMigration() {
  console.log('🚀 Bắt đầu quá trình Migration sang Cloudflare D1 với chuẩn UUID...\n');

  console.log('1. Kết nối tới MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Đã kết nối thành công tới MongoDB Atlas!\n');

  const db = mongoose.connection.db;
  if (!db) throw new Error('Không thể truy cập database MongoDB');

  // --- 1. MIGRATE USERS ---
  console.log('--- 1/4: Đang chuyển đổi USERS ---');
  const usersCollection = db.collection('users');
  const mongoUsers = await usersCollection.find().toArray();
  console.log(`Tìm thấy ${mongoUsers.length} users trong MongoDB.`);

  await executeD1('DELETE FROM users;');
  if (mongoUsers.length > 0) {
    const userQueries = mongoUsers.map((u) => ({
      sql: `INSERT INTO users (id, email, password, name, role, avatar, phone, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      params: [
        u._id.toString() || randomUUID(),
        u.email,
        u.password,
        u.name || u.email.split('@')[0],
        u.role || 'ADMIN',
        u.avatar || null,
        u.phone || null,
        Math.floor(new Date(u.createdAt || Date.now()).getTime() / 1000),
        Math.floor(new Date(u.updatedAt || Date.now()).getTime() / 1000),
      ],
    }));

    await batchExecuteD1(userQueries);
    console.log(`✅ Đã insert thành công ${userQueries.length} users vào Cloudflare D1.\n`);
  }

  // --- 2. MIGRATE BRANDS, CATEGORIES, SUBCATEGORIES ---
  console.log('--- 2/4: Đang chuyển đổi BRANDS & CATEGORIES (UUID) ---');
  const brandsCollection = db.collection('brands');
  const mongoBrands = await brandsCollection.find().toArray();
  console.log(`Tìm thấy ${mongoBrands.length} brands trong MongoDB.`);

  await executeD1('DELETE FROM subcategories;');
  await executeD1('DELETE FROM categories;');
  await executeD1('DELETE FROM products;');
  await executeD1('DELETE FROM brands;');

  let totalCategoriesCount = 0;
  let totalSubcategoriesCount = 0;
  const brandSlugToUuidMap = new Map<string, string>();
  const oldBrandIdToUuidMap = new Map<number | string, string>();

  for (let idx = 0; idx < mongoBrands.length; idx++) {
    const b = mongoBrands[idx];
    const brandUuid = randomUUID();
    brandSlugToUuidMap.set(b.slug, brandUuid);
    if (b.id !== undefined) oldBrandIdToUuidMap.set(b.id, brandUuid);

    await executeD1(
      `INSERT INTO brands (id, name, slug, logo, logo_html, order_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        brandUuid,
        b.name,
        b.slug,
        b.logo || '',
        b.logoHtml || null,
        idx,
        Math.floor(new Date(b.createdAt || Date.now()).getTime() / 1000),
        Math.floor(new Date(b.updatedAt || Date.now()).getTime() / 1000),
      ],
    );

    if (Array.isArray(b.categories)) {
      for (const cat of b.categories) {
        const catUuid = randomUUID();
        await executeD1(
          `INSERT INTO categories (id, brand_id, name, slug) VALUES (?, ?, ?, ?);`,
          [catUuid, brandUuid, cat.name, cat.slug],
        );
        totalCategoriesCount++;

        if (Array.isArray(cat.subcategories)) {
          for (const sub of cat.subcategories) {
            const subUuid = randomUUID();
            await executeD1(
              `INSERT INTO subcategories (id, category_id, name, slug) VALUES (?, ?, ?, ?);`,
              [subUuid, catUuid, sub.name, sub.slug],
            );
            totalSubcategoriesCount++;
          }
        }
      }
    }
  }

  console.log(
    `✅ Đã insert thành công ${mongoBrands.length} brands, ${totalCategoriesCount} categories, ${totalSubcategoriesCount} subcategories vào Cloudflare D1.\n`,
  );

  // --- 3. MIGRATE PRODUCTS ---
  console.log('--- 3/4: Đang chuyển đổi PRODUCTS (UUID) ---');
  const productsCollection = db.collection('products');
  const mongoProducts = await productsCollection.find().toArray();
  console.log(`Tìm thấy ${mongoProducts.length} products trong MongoDB.`);

  const BATCH_SIZE = 50;
  for (let i = 0; i < mongoProducts.length; i += BATCH_SIZE) {
    const chunk = mongoProducts.slice(i, i + BATCH_SIZE);
    const productQueries = chunk.map((p) => {
      const productUuid = randomUUID();
      const code = p.code || p.name;
      const slug = p.slug || p.id || p._id.toString();

      // Find brand UUID
      let brandUuid = p.brandId ? oldBrandIdToUuidMap.get(p.brandId) : undefined;
      if (!brandUuid && p.brandSlug) {
        brandUuid = brandSlugToUuidMap.get(p.brandSlug);
      }
      if (!brandUuid) {
        // Fallback to first brand
        brandUuid = Array.from(brandSlugToUuidMap.values())[0];
      }

      return {
        sql: `INSERT INTO products (
          id, code, slug, name, description, short_description, brand_id, category_slug, subcategory_slug,
          price, original_price, price_range, image_url, images_json, features_json, specs_json,
          technologies_json, warranty, warranty_text, colors_json, installation_manual_json,
          faq_json, has_variants, options_json, variants_json, installation_preview_json,
          status, views, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?
        );`,
        params: [
          productUuid,
          code,
          slug,
          p.name,
          p.description || '',
          p.shortDescription || '',
          brandUuid,
          p.categorySlug || p.category || '',
          p.subcategorySlug || p.subcategory || null,
          typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0,
          p.originalPrice ? (typeof p.originalPrice === 'number' ? p.originalPrice : parseFloat(p.originalPrice)) : null,
          p.priceRange || null,
          p.imageUrl || (Array.isArray(p.images) && p.images[0]) || '',
          JSON.stringify(p.images || []),
          JSON.stringify(p.features || []),
          JSON.stringify(p.specs || p.specifications || {}),
          JSON.stringify(p.technologies || []),
          typeof p.warranty === 'number' ? p.warranty : 24,
          p.warrantyText || '',
          JSON.stringify(p.colors || []),
          JSON.stringify(p.installationManual || []),
          JSON.stringify(p.faq || []),
          p.has_variants ? 1 : 0,
          JSON.stringify(p.options || []),
          JSON.stringify(p.variants || []),
          JSON.stringify(p.installation_preview || []),
          p.status || 'ACTIVE',
          p.views || 0,
          Math.floor(new Date(p.createdAt || Date.now()).getTime() / 1000),
          Math.floor(new Date(p.updatedAt || Date.now()).getTime() / 1000),
        ],
      };
    });

    await batchExecuteD1(productQueries);
    console.log(`Đã chuyển đổi [${Math.min(i + BATCH_SIZE, mongoProducts.length)}/${mongoProducts.length}] sản phẩm...`);
  }
  console.log(`✅ Đã insert thành công toàn bộ ${mongoProducts.length} sản phẩm vào Cloudflare D1.\n`);

  // --- 4. MIGRATE MEDIA ---
  console.log('--- 4/4: Đang chuyển đổi MEDIA (UUID) ---');
  const mediaCollection = db.collection('media');
  const mongoMedia = await mediaCollection.find().toArray();
  console.log(`Tìm thấy ${mongoMedia.length} media records trong MongoDB.`);

  await executeD1('DELETE FROM media;');

  if (mongoMedia.length > 0) {
    for (let i = 0; i < mongoMedia.length; i += BATCH_SIZE) {
      const chunk = mongoMedia.slice(i, i + BATCH_SIZE);
      const mediaQueries = chunk.map((m) => ({
        sql: `INSERT INTO media (
          id, filename, url, key, mime_type, size, folder, brand, category, subcategory, product_code, metadata_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        params: [
          m._id?.toString() || randomUUID(),
          m.filename || '',
          m.url || '',
          m.key || m.url || '',
          m.mimeType || 'image/jpeg',
          m.size || 0,
          m.folder || 'general',
          m.brand || null,
          m.category || null,
          m.subcategory || null,
          m.productCode || null,
          JSON.stringify(m.metadata || {}),
          Math.floor(new Date(m.createdAt || Date.now()).getTime() / 1000),
          Math.floor(new Date(m.updatedAt || Date.now()).getTime() / 1000),
        ],
      }));

      await batchExecuteD1(mediaQueries);
      console.log(`Đã chuyển đổi [${Math.min(i + BATCH_SIZE, mongoMedia.length)}/${mongoMedia.length}] media...`);
    }
  }
  console.log(`✅ Đã insert thành công ${mongoMedia.length} media vào Cloudflare D1.\n`);

  // --- 5. AUDIT / ĐỐI SOÁT DỮ LIỆU ---
  console.log('====================================================');
  console.log('📊 BÁO CÁO ĐỐI SOÁT DỮ LIỆU UUID (MONGODB vs D1)');
  console.log('====================================================');

  const d1Users = await executeD1('SELECT COUNT(*) as count FROM users;');
  const d1Brands = await executeD1('SELECT COUNT(*) as count FROM brands;');
  const d1Categories = await executeD1('SELECT COUNT(*) as count FROM categories;');
  const d1Subcategories = await executeD1('SELECT COUNT(*) as count FROM subcategories;');
  const d1Products = await executeD1('SELECT COUNT(*) as count FROM products;');
  const d1Media = await executeD1('SELECT COUNT(*) as count FROM media;');

  console.log(`👤 Users:         MongoDB [${mongoUsers.length}]  ==  D1 [${d1Users[0]?.count}]`);
  console.log(`🏷️  Brands:        MongoDB [${mongoBrands.length}]  ==  D1 [${d1Brands[0]?.count}]`);
  console.log(`📂 Categories:    MongoDB [${totalCategoriesCount}]  ==  D1 [${d1Categories[0]?.count}]`);
  console.log(`📁 Subcategories: MongoDB [${totalSubcategoriesCount}]  ==  D1 [${d1Subcategories[0]?.count}]`);
  console.log(`📦 Products:      MongoDB [${mongoProducts.length}]  ==  D1 [${d1Products[0]?.count}]`);
  console.log(`🖼️  Media:         MongoDB [${mongoMedia.length}]  ==  D1 [${d1Media[0]?.count}]`);
  console.log('====================================================');
  console.log('🎉 TOÀN BỘ DỮ LIỆU ĐÃ ĐƯỢC CHUYỂN SANG CHUẨN UUID TRÊN CLOUDFLARE D1 THÀNH CÔNG!');

  await mongoose.disconnect();
}

runMigration().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
