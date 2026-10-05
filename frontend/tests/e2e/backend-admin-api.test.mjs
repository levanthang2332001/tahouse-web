import test, { describe, before } from "node:test";
import assert from "node:assert/strict";
import { fetch as undiciFetch, Agent } from "undici";

const BACKEND_URL = process.env.BACKEND_API_URL || "https://tahouse-backend.onrender.com";
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "Admin@123456";

// Dedicated undici agent with generous timeouts for Render backend
const backendAgent = new Agent({
  connect: {
    timeout: 60_000,
    keepAlive: true,
  },
  headersTimeout: 60_000,
  bodyTimeout: 60_000,
  pipelining: 0,
});

describe("TA House Backend & Admin API End-to-End Suite", { timeout: 120_000 }, () => {
  let accessToken = "";
  let refreshToken = "";
  let createdProductId = "";
  let testBrandSlug = `test-brand-${Date.now()}`;
  let testCategorySlug = `cat-test-${Date.now()}`;
  let testSubcategorySlug = `sub-test-${Date.now()}`;
  let uploadedFileId = "";
  let uploadedFileUrl = "";

  before(async () => {
    console.log(`Connecting to Backend at: ${BACKEND_URL}`);
  });

  // ----------------------------------------------------
  // 1. AUTHENTICATION & PROFILE
  // ----------------------------------------------------
  test("1.1 Auth: POST /auth/login returns accessToken & refreshToken", async () => {
    const res = await undiciFetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: ADMIN_USER,
        password: ADMIN_PASS,
      }),
      dispatcher: backendAgent,
    });

    const data = await res.json();
    assert.ok([200, 201].includes(res.status), `Login failed: ${JSON.stringify(data)}`);
    assert.equal(data.success, true);
    assert.ok(data.data?.accessToken, "Missing accessToken");
    assert.ok(data.data?.refreshToken, "Missing refreshToken");

    accessToken = data.data.accessToken;
    refreshToken = data.data.refreshToken;
  });

  test("1.2 Auth: GET /auth/me retrieves current admin profile", async () => {
    assert.ok(accessToken, "Access token required");

    const res = await undiciFetch(`${BACKEND_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      dispatcher: backendAgent,
    });

    const data = await res.json();
    assert.equal(res.status, 200, `GET /auth/me failed: ${JSON.stringify(data)}`);
    assert.equal(data.success, true);
    assert.equal(data.data.username, "admin");
    assert.ok(data.data.fullName);
    assert.ok(data.data.email);
  });

  test("1.3 Auth: PATCH /auth/me updates admin profile info", async () => {
    assert.ok(accessToken, "Access token required");

    const res = await undiciFetch(`${BACKEND_URL}/auth/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: "Quản Trị Viên TA HOUSE (Verified)",
        email: "admin@tahouse.vn",
      }),
      dispatcher: backendAgent,
    });

    const data = await res.json();
    assert.equal(res.status, 200, `PATCH /auth/me failed: ${JSON.stringify(data)}`);
    assert.equal(data.success, true);
    assert.equal(data.data.fullName, "Quản Trị Viên TA HOUSE (Verified)");
  });

  test("1.4 Auth: POST /auth/refresh generates new accessToken", async () => {
    assert.ok(refreshToken, "Refresh token required");

    const res = await undiciFetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken,
      }),
      dispatcher: backendAgent,
    });

    const data = await res.json();
    assert.ok([200, 201].includes(res.status), `POST /auth/refresh failed: ${JSON.stringify(data)}`);
    assert.equal(data.success, true);
    assert.ok(data.data?.accessToken);
    // Keep updated accessToken
    accessToken = data.data.accessToken;
  });

  // ----------------------------------------------------
  // 2. PRODUCT CRUD & BUSINESS LOGIC
  // ----------------------------------------------------
  test("2.1 Products: GET /admin/products returns paginated catalog", async () => {
    assert.ok(accessToken);

    const res = await undiciFetch(`${BACKEND_URL}/admin/products?page=1&limit=5`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      dispatcher: backendAgent,
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.data?.items));
    assert.ok(typeof data.data?.total === "number");
  });

  test("2.2 Products: POST /admin/products creates a full product with content & variants", async () => {
    assert.ok(accessToken);

    const testCode = `E2E-${Date.now()}`;
    const payload = {
      code: testCode,
      name: `Khóa Cửa Điện Tử Test E2E ${testCode}`,
      brand: "Bosch",
      brandSlug: "bosch",
      category: "khoa-dien-tu",
      categoryName: "Khóa điện tử",
      price: 12500000,
      originalPrice: 15000000,
      priceRange: "12.500.000 đ",
      imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80",
      features: ["Nhận diện khuôn mặt 3D Face ID", "Vân tay FPC Thụy Điển"],
      priority: 95,
      content: "<h3>Đặc điểm sản phẩm</h3><p>Đây là bài viết mô tả chi tiết được kiểm thử tự động.</p>",
      description: "Mô tả tóm tắt sản phẩm kiểm thử tự động",
      has_variants: true,
      variants: [
        {
          id: `${testCode}-black`,
          label: "Màu Đen Ánh Kim",
          attributes: { color: "Đen" },
          price: 12500000,
          priceRange: "12.500.000 đ",
          is_default: true,
        },
        {
          id: `${testCode}-gold`,
          label: "Màu Vàng Đồng Amber",
          attributes: { color: "Vàng Đồng" },
          price: 13500000,
          priceRange: "13.500.000 đ",
          is_default: false,
        },
      ],
      installation: {
        images: ["https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80"],
        videos: [],
      },
    };

    const res = await undiciFetch(`${BACKEND_URL}/admin/products`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      dispatcher: backendAgent,
    });

    const data = await res.json();
    assert.equal(res.status, 201, `Create product failed: ${JSON.stringify(data)}`);
    assert.equal(data.success, true);
    assert.ok(data.data?.id || data.data?._id);

    createdProductId = data.data.id || data.data._id;
  });

  test("2.3 Products: GET /admin/products/:id retrieves created product and preserves fields", async () => {
    assert.ok(createdProductId, "Created product ID required");

    const res = await undiciFetch(`${BACKEND_URL}/admin/products/${encodeURIComponent(createdProductId)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      dispatcher: backendAgent,
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.data.price, 12500000);
    assert.ok(data.data.content?.includes("Đặc điểm sản phẩm"));
    assert.equal(data.data.variants?.length, 2);
  });

  test("2.4 Products: PATCH /admin/products/:id updates product information", async () => {
    assert.ok(createdProductId);

    const updatePayload = {
      price: 13000000,
      priceRange: "13.000.000 đ",
      priority: 99,
      content: "<h3>Nội dung đã được cập nhật qua PATCH API</h3>",
    };

    const res = await undiciFetch(`${BACKEND_URL}/admin/products/${encodeURIComponent(createdProductId)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
      dispatcher: backendAgent,
    });

    const data = await res.json();
    assert.equal(res.status, 200, `Update product failed: ${JSON.stringify(data)}`);
    assert.equal(data.success, true);
    assert.equal(data.data.price, 13000000);
    assert.equal(data.data.priority, 99);
  });

  test("2.5 Products: DELETE /admin/products/:id removes the test product", async () => {
    assert.ok(createdProductId);

    const res = await undiciFetch(`${BACKEND_URL}/admin/products/${encodeURIComponent(createdProductId)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      dispatcher: backendAgent,
    });

    const data = await res.json();
    assert.equal(res.status, 200, `Delete product failed: ${JSON.stringify(data)}`);
    assert.equal(data.success, true);
  });

  // ----------------------------------------------------
  // 3. BRANDS & HIERARCHICAL CATEGORIES
  // ----------------------------------------------------
  test("3.1 Brands: GET /admin/brands retrieves all partner brands", async () => {
    assert.ok(accessToken);

    const res = await undiciFetch(`${BACKEND_URL}/admin/brands`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      dispatcher: backendAgent,
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.data));
  });

  test("3.2 Brands: POST /admin/brands creates a new brand", async () => {
    assert.ok(accessToken);

    const res = await undiciFetch(`${BACKEND_URL}/admin/brands`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `Thương Hiệu E2E ${Date.now()}`,
        slug: testBrandSlug,
        logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300",
        categories: [],
      }),
      dispatcher: backendAgent,
    });

    const data = await res.json();
    assert.equal(res.status, 201, `Create brand failed: ${JSON.stringify(data)}`);
    assert.equal(data.success, true);
    assert.equal(data.data.slug, testBrandSlug);
  });

  test("3.3 Brands: POST /admin/brands/:slug/categories adds a category to the brand", async () => {
    assert.ok(accessToken);

    const res = await undiciFetch(`${BACKEND_URL}/admin/brands/${testBrandSlug}/categories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slug: testCategorySlug,
        name: "Thiết bị thông minh Test",
      }),
      dispatcher: backendAgent,
    });

    const data = await res.json();
    assert.equal(res.status, 201, `Add category failed: ${JSON.stringify(data)}`);
    assert.equal(data.success, true);
    const addedCat = data.data.categories?.find((c) => c.slug === testCategorySlug);
    assert.ok(addedCat, "Category not found in brand after creation");
  });

  test("3.4 Brands: PATCH /admin/brands/:slug/categories/:catSlug updates category name", async () => {
    assert.ok(accessToken);

    const res = await undiciFetch(`${BACKEND_URL}/admin/brands/${testBrandSlug}/categories/${testCategorySlug}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Thiết bị thông minh Cao Cấp (Updated)",
      }),
      dispatcher: backendAgent,
    });

    const data = await res.json();
    assert.equal(res.status, 200, `Patch category failed: ${JSON.stringify(data)}`);
    assert.equal(data.success, true);
  });

  test("3.5 Brands: POST .../subcategories adds a subcategory", async () => {
    assert.ok(accessToken);

    const res = await undiciFetch(
      `${BACKEND_URL}/admin/brands/${testBrandSlug}/categories/${testCategorySlug}/subcategories`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: testSubcategorySlug,
          name: "Khóa Cổng Ngoài Trời",
        }),
        dispatcher: backendAgent,
      },
    );

    const data = await res.json();
    assert.equal(res.status, 201, `Add subcategory failed: ${JSON.stringify(data)}`);
    assert.equal(data.success, true);
  });

  test("3.6 Brands: DELETE .../subcategories removes the subcategory", async () => {
    assert.ok(accessToken);

    const res = await undiciFetch(
      `${BACKEND_URL}/admin/brands/${testBrandSlug}/categories/${testCategorySlug}/subcategories/${testSubcategorySlug}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        dispatcher: backendAgent,
      },
    );

    const data = await res.json();
    assert.equal(res.status, 200, `Delete subcategory failed: ${JSON.stringify(data)}`);
    assert.equal(data.success, true);
  });

  test("3.7 Brands: DELETE /admin/brands/:slug/categories/:catSlug removes category", async () => {
    assert.ok(accessToken);

    const res = await undiciFetch(`${BACKEND_URL}/admin/brands/${testBrandSlug}/categories/${testCategorySlug}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      dispatcher: backendAgent,
    });

    const data = await res.json();
    assert.equal(res.status, 200, `Delete category failed: ${JSON.stringify(data)}`);
    assert.equal(data.success, true);
  });

  test("3.8 Brands: DELETE /admin/brands/:slug removes the test brand", async () => {
    assert.ok(accessToken);

    const res = await undiciFetch(`${BACKEND_URL}/admin/brands/${testBrandSlug}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      dispatcher: backendAgent,
    });

    const data = await res.json();
    assert.equal(res.status, 200, `Delete brand failed: ${JSON.stringify(data)}`);
    assert.equal(data.success, true);
  });

  // ----------------------------------------------------
  // 4. CLOUDFLARE R2 UPLOAD & MEDIA API
  // ----------------------------------------------------
  test("4.1 Media: GET /admin/upload lists files", async () => {
    assert.ok(accessToken);

    const res = await undiciFetch(`${BACKEND_URL}/admin/upload?page=1&limit=5`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      dispatcher: backendAgent,
    });

    const data = await res.json();
    assert.equal(res.status, 200, `GET /admin/upload failed: ${JSON.stringify(data)}`);
    assert.ok(Array.isArray(data.items || data.data?.items));
  });

  test("4.2 Media: POST /admin/upload uploads file and DELETE cleans it up", async () => {
    assert.ok(accessToken);

    // Create a 1x1 transparent PNG blob for testing upload
    const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const pngBuffer = Buffer.from(pngBase64, "base64");
    const file = new File([pngBuffer], `test-e2e-${Date.now()}.png`, { type: "image/png" });

    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "general");

    const res = await fetch(`${BACKEND_URL}/admin/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: fd,
    });

    const data = await res.json();
    assert.equal(res.status, 201, `Upload failed: ${JSON.stringify(data)}`);
    assert.ok(data.data?.url || data.url, "Upload succeeded but missing url");
    uploadedFileId = data.data?.id || data.data?._id || data.id || data._id;
    uploadedFileUrl = data.data?.url || data.url;

    // Now test DELETE
    if (uploadedFileId || uploadedFileUrl) {
      const delRes = await undiciFetch(`${BACKEND_URL}/admin/upload`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: uploadedFileId,
          url: uploadedFileUrl,
        }),
        dispatcher: backendAgent,
      });

      assert.ok([200, 204].includes(delRes.status), "DELETE /admin/upload status check");
    }
  });

  // ----------------------------------------------------
  // 5. AI CHATBOT CONSULTATION API
  // ----------------------------------------------------
  test("5.1 Chatbot: POST /rag/chat responds to product question", async () => {
    const res = await undiciFetch(`${BACKEND_URL}/rag/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Cho tôi biết khóa cửa điện tử Bosch có những loại nào?",
        history: [],
      }),
      dispatcher: backendAgent,
    });

    assert.ok([200, 201].includes(res.status), `POST /rag/chat failed with status ${res.status}`);
    const text = await res.text();
    assert.ok(text.length > 0, "Chatbot response should not be empty");
  });
});
