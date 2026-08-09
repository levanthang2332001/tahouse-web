# Tài Liệu API Products & Brands (Tối Ưu Mapping Frontend)

Tài liệu mô tả các endpoint API đã được chuẩn hóa để **ánh xạ 1:1** với cấu trúc dữ liệu Frontend hiện tại, không cần tầng chuyển đổi trung gian.

---

## 📌 Nguyên Tắc Ánh Xạ (Mapping Principles)

Frontend (Next.js) sử dụng interface `Product` tại [products.ts](file:///d:/my-project/tahouse-web/frontend/data/products.ts). Các nguyên tắc thiết kế API:

1. **Category slug khớp FE:** Trả về đúng slug FE đang dùng (`cua-go`, `dai-sanh`, `Kitchen`, `Water`, `Cabinet`, `Smart`,...).
2. **`imageUrl` tách biệt:** Tách sẵn ảnh đại diện ra, `ProductCard` gán trực tiếp mà không cần `images[0]`.
3. **`specs` dạng phẳng:** `Record<string, string>` — FE render bằng `Object.entries()`, không cần mảng phức tạp.
4. **`originalPrice` từ BE:** BE quản lý giá gốc thực tế, FE không tự nhân cứng `price × 1.18`.
5. **`subcategory` lọc tại DB:** Tránh FE phải tìm kiếm chuỗi ký tự tiếng Việt trong tên sản phẩm.

---

## 💾 TypeScript Interface Đồng Bộ FE–BE

```typescript
// Dùng chung cho cả danh sách và chi tiết sản phẩm
export interface IProduct {
  // ─── Định danh ─────────────────────────────────────────────────────────────
  id: string;               // ID dạng slug (ví dụ: "ta-9800") — khớp với URL /product/[id] của FE
  code: string;             // Mã sản phẩm (ví dụ: "TA-9800 PREMIUM")

  // ─── Thương hiệu & Danh mục ────────────────────────────────────────────────
  brand: string;            // Tên thương hiệu hiển thị (ví dụ: "Kassler")
  brandSlug: string;        // Slug dùng để lọc (ví dụ: "kassler") — khớp BRANDS[].id ở FE
  category: string;         // Slug danh mục chính (ví dụ: "cua-go", "Kitchen", "Smart")
  categoryName: string;     // Tên danh mục hiển thị (ví dụ: "Khóa cửa gỗ")
  subcategory?: string;     // Slug danh mục con (ví dụ: "bep-tu", "ket-mini") — tùy chọn
  subcategoryName?: string; // Tên danh mục con hiển thị — tùy chọn

  // ─── Tên & Mô tả ───────────────────────────────────────────────────────────
  name: string;             // Tên đầy đủ sản phẩm
  description: string;      // Mô tả chi tiết (dùng ở trang /product/[id])
  shortDescription: string; // Mô tả ngắn (dùng cho SEO / meta description)

  // ─── Hình ảnh ──────────────────────────────────────────────────────────────
  imageUrl: string;         // Ảnh đại diện chính = images[0] (dùng ở ProductCard)
  images: string[];         // Toàn bộ ảnh chi tiết (dùng ở gallery trang chi tiết)

  // ─── Giá ───────────────────────────────────────────────────────────────────
  price: number;            // Giá bán hiện tại (VND) — FE dùng để lọc, sắp xếp, tính %
  originalPrice?: number;   // Giá gốc trước giảm giá (nếu có) — FE dùng để hiển thị gạch ngang
  priceRange: string;       // Giá đã format sẵn (ví dụ: "18.500.000 VNĐ") — dùng để render
                            // Với variants giá khác nhau: "12.800.000 – 15.400.000 VNĐ"

  // ─── Tính năng & Kỹ thuật ──────────────────────────────────────────────────
  features: string[];       // Tính năng nổi bật (FE hiển thị 2 đầu tiên ở ProductCard)
  specs: Record<string, string>; // Thông số kỹ thuật Key-Value — FE render bằng Object.entries()
  technologies: string[];   // Danh sách công nghệ áp dụng

  // ─── Bảo hành & Màu sắc ────────────────────────────────────────────────────
  warranty: number;         // Thời hạn bảo hành (tháng, ví dụ: 24, 36)
  warrantyText: string;     // Chuỗi hiển thị (ví dụ: "36 Tháng (1 đổi 1 trong 12 tháng)")
  colors: string[];         // Danh sách màu sắc (ví dụ: ["Đen nhám", "Đồng đỏ"])

  // ─── Nội dung bổ sung (chỉ có ở API chi tiết) ──────────────────────────────
  installationManual?: string[]; // Các bước lắp đặt (render ở tab "Lắp đặt")
  faq?: { question: string; answer: string }[]; // Câu hỏi thường gặp

  // ─── Biến thể (chỉ có ở API chi tiết) ─────────────────────────────────────
  has_variants: boolean;    // true nếu sản phẩm có nhiều màu/cấu hình
  options?: { name: string; values: string[] }[];
  variants?: {
    id: string;
    label: string;
    attributes: Record<string, string>;
    price: number;
    priceRange: string;
    is_default: boolean;
  }[];

  // ─── Preview lắp đặt (chỉ có ở API chi tiết) ───────────────────────────────
  installation_preview?: string[]; // Tối đa 3 ảnh lắp đặt thực tế (preview nhanh)
}

// Response cho API danh sách
export interface IProductsListResponse {
  items: IProduct[];
  total: number;
  page: number;
  limit: number;
}

// Interface Brand
export interface IBrand {
  id: number;
  name: string;
  slug: string;             // Dùng để lọc qua query param ?brand=kassler
  logo: string;             // Đường dẫn file ảnh logo
  logoHtml?: string;        // HTML styled logo (tùy chọn — FE dùng dangerouslySetInnerHTML)
  categories: {
    // Không có trường id — FE chỉ cần slug để filter
    slug: string;           // Slug danh mục (khớp với category slug của sản phẩm)
    name: string;
  }[];
}
```

> [!NOTE]
> **Trường nào trả về ở đâu?**
>
> | Trường | Danh sách | Chi tiết |
> | :--- | :---: | :---: |
> | id, code, name, brand, brandSlug, category, categoryName | ✔️ | ✔️ |
> | imageUrl, price, originalPrice, priceRange, has_variants | ✔️ | ✔️ |
> | features *(chỉ 2 phần tử đầu)* | ✔️ | ✔️ *(đầy đủ)* |
> | images, description, shortDescription, specs, technologies | ❌ | ✔️ |
> | warranty, warrantyText, colors | ❌ | ✔️ |
> | installationManual, faq, options, variants, installation_preview | ❌ | ✔️ |

---

## ⚡ Chi Tiết Các Endpoint API

### 1. GET `/products/locks` — Danh Sách Sản Phẩm

**Query Parameters:**

| Tham số | Kiểu | Mặc định | Mô tả |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Số trang (bắt đầu từ 1) |
| `limit` | `number` | `10` | Số sản phẩm mỗi trang (tối đa 500) |
| `category` | `string` | — | Slug danh mục chính:<br>`lock-parent` (toàn bộ khóa) \| `dai-sanh` \| `cua-go` \| `cua-kinh` \| `xingfa-sat` \| `cua-cong` \| `khach-san` \| `Kitchen` \| `Water` \| `Cabinet` \| `Smart` |
| `subcategory` | `string` | — | Slug danh mục con:<br>`bep-tu` \| `may-hut-mui` \| `chau-rua` \| `voi-rua` \| `lo-nuong` \| `may-rua-chen` \| `ket-mini` \| `ket-gia-dinh` \| `ket-van-phong` \| `may-loc-nuoc-ro` \| `may-loc-nuoc-ion-kiem` \| `loc-tong-sinh-hoat` \| `loi-loc-phu-kien` |
| `brand` | `string` | — | Slug thương hiệu: `kassler` \| `philips` \| `bosch` \| `sharp` \| `hubert` \| `hyundai` |
| `search` | `string` | — | Từ khóa (tìm không dấu trong: tên, mã, mô tả, tính năng) |
| `minPrice` | `number` | — | Giá tối thiểu (VND) |
| `maxPrice` | `number` | — | Giá tối đa (VND) |
| `sortBy` | `string` | `newest` | `newest` \| `price-asc` \| `price-desc` — **không hỗ trợ `name`** |

**Response `200 OK`:**

```json
{
  "items": [
    {
      "id": "ta-9800",
      "code": "TA-9800 PREMIUM",
      "name": "Khóa Thông Minh FaceID 3D TA-9800",
      "brand": "Kassler",
      "brandSlug": "kassler",
      "category": "dai-sanh",
      "categoryName": "Khóa đại sảnh",
      "imageUrl": "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1000",
      "price": 18500000,
      "originalPrice": 21800000,
      "priceRange": "18.500.000 VNĐ",
      "features": [
        "Face ID 3D nhận diện sinh trắc học chống sao chép giả mạo",
        "Màn hình màu LCD sắc nét mặt trong hiển thị toàn cảnh ngoài cửa"
      ],
      "has_variants": true
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10
}
```

> [!NOTE]
> - `images` **không** trả về trong danh sách (đã có `imageUrl` đủ dùng cho `ProductCard`) — giảm payload.
> - `features` chỉ trả về **2 phần tử đầu** — đủ để `ProductCard` hiển thị bullet points.
> - `originalPrice` chỉ có khi sản phẩm đang giảm giá. FE kiểm tra `if (originalPrice)` trước khi render nhãn giảm giá.

---

### 2. GET `/products/locks/:id` — Chi Tiết Sản Phẩm

**Path Parameter:**
- `:id` — ID hoặc mã sản phẩm (không phân biệt hoa/thường, khoảng trắng).
  Ví dụ: `ta-9800`, `TA-9800 PREMIUM`, `ta-9800-premium` đều hợp lệ.

**Response `200 OK`:**

```json
{
  "id": "ta-9800",
  "code": "TA-9800 PREMIUM",
  "name": "Khóa Thông Minh FaceID 3D TA-9800",
  "brand": "Kassler",
  "brandSlug": "kassler",
  "category": "dai-sanh",
  "categoryName": "Khóa đại sảnh",
  "imageUrl": "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1000",
  "images": [
    "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1000",
    "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1000",
    "https://images.unsplash.com/photo-1481277542470-605612bd2d61?q=80&w=1000"
  ],
  "price": 18500000,
  "originalPrice": 21800000,
  "priceRange": "18.500.000 VNĐ",
  "description": "Khóa thông minh phân khúc Luxury tích hợp camera chuông hình, nhận diện khuôn mặt FaceID 3D siêu tốc và kết nối App Wifi điều khiển từ xa.",
  "shortDescription": "Khóa thông minh phân khúc Luxury tích hợp camera chuông hình, nhận diện khuôn mặt FaceID 3D.",
  "features": [
    "Face ID 3D nhận diện sinh trắc học chống sao chép giả mạo",
    "Màn hình màu LCD sắc nét mặt trong hiển thị toàn cảnh ngoài cửa",
    "Gửi thông báo có hình ảnh người bấm chuông về app điện thoại",
    "Vân tay bán dẫn FPC siêu nhạy từ Thụy Điển kích hoạt < 0.3 giây"
  ],
  "specs": {
    "Chất liệu": "Hợp kim kẽm hàng không CNC nguyên khối, mặt kính cường lực chịu lực",
    "Chế độ mở khóa": "Face ID, Vân tay, Mật mã, Điện thoại, Thẻ từ, Chìa cơ khẩn cấp",
    "Nguồn cấp năng lượng": "Pin sạc Lithium 5000mAh bền bỉ lên đến 12 tháng",
    "Độ dày cửa tương thích": "Cửa gỗ, cửa chống cháy có độ dày từ 38mm - 120mm"
  },
  "technologies": [
    "AI Face Recognition",
    "FPC Swedish Sensor",
    "Tuya Mobile IoT",
    "Anti-Peep PIN Code"
  ],
  "warranty": 36,
  "warrantyText": "36 Tháng (1 đổi 1 trong 12 tháng)",
  "colors": [
    "Space Gray (Xám Không Gian)",
    "Champagne Gold (Vàng Thượng Hạng)"
  ],
  "installationManual": [
    "Khảo sát đố cửa (độ dày cửa gỗ >= 38mm, đố cửa rộng >= 100mm).",
    "Sử dụng dưỡng khoan đục lỗ đố cửa chuẩn xác theo sơ đồ kích thước.",
    "Lắp đặt hộp ruột khóa tự động Inox 304 vào đố cửa.",
    "Luồn dây cáp kết nối từ mặt trước ra mặt sau qua lỗ khoan cốt trung tâm.",
    "Cố định chắc chắn hai mặt ốp trong/ngoài của khóa bằng vít chuyên dụng.",
    "Lắp pin Lithium vào khay chứa, cài đặt cấu hình mã số Admin và liên kết App Tuya."
  ],
  "faq": [
    {
      "question": "Dung lượng pin sạc Lithium dùng được bao lâu?",
      "answer": "Pin Lithium 5000mAh có thể hoạt động bền bỉ từ 8 đến 12 tháng với tần suất mở cửa trung bình."
    },
    {
      "question": "Công nghệ Face ID 3D có nhận diện được trong bóng tối không?",
      "answer": "Có, khóa sử dụng camera hồng ngoại quét đa chiều, nhận diện chính xác kể cả trong môi trường tối."
    }
  ],
  "options": [
    {
      "name": "Màu sắc",
      "values": ["Space Gray (Xám Không Gian)", "Champagne Gold (Vàng Thượng Hạng)"]
    }
  ],
  "variants": [
    {
      "id": "v1",
      "label": "TA-9800 Màu Xám Không Gian",
      "attributes": { "color": "Space Gray (Xám Không Gian)" },
      "price": 18500000,
      "priceRange": "18.500.000 VNĐ",
      "is_default": true
    },
    {
      "id": "v2",
      "label": "TA-9800 Màu Vàng Thượng Hạng",
      "attributes": { "color": "Champagne Gold (Vàng Thượng Hạng)" },
      "price": 19200000,
      "priceRange": "19.200.000 VNĐ",
      "is_default": false
    }
  ],
  "has_variants": true,
  "installation_preview": [
    "/installation/ta-9800/img1.jpg",
    "/installation/ta-9800/img2.jpg",
    "/installation/ta-9800/img3.jpg"
  ]
}
```

**Response `404 Not Found`:**
```json
{
  "message": "Không tìm thấy sản phẩm với ID hoặc mã: TA-UNKNOWN",
  "error": "Not Found",
  "statusCode": 404
}
```

> [!IMPORTANT]
> - `installation_preview` tối đa **3 ảnh** — đủ để preview nhanh. Toàn bộ ảnh/video xem qua API riêng `GET /products/locks/:id/installation`.
> - Khi `has_variants = true`, `price` ở level gốc là giá của variant **mặc định** (`is_default: true`). FE cập nhật giá khi người dùng chọn variant khác.
> - Khi `has_variants = false`, `options` và `variants` trả về mảng rỗng `[]`, không phải `null`.

---

### 3. GET `/products/locks/:id/installation` — Ảnh & Video Lắp Đặt

**Query Parameters:**

| Tham số | Kiểu | Mặc định | Mô tả |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Số trang |
| `limit` | `number` | `12` | Số media mỗi trang (tối đa 50) |
| `type` | `string` | `all` | `all` \| `images` \| `videos` |

**Response `200 OK`:**

```json
{
  "product_id": "ta-9800",
  "product_name": "Khóa Thông Minh FaceID 3D TA-9800",
  "items": [
    { "url": "/installation/ta-9800/IMG_0627.jpg", "type": "image" },
    { "url": "/installation/ta-9800/IMG_0636.MOV", "type": "video" }
  ],
  "total": 18,
  "total_images": 17,
  "total_videos": 1,
  "page": 1,
  "limit": 12
}
```

> [!NOTE]
> `product_id` thay cho `product_code` — đồng bộ quy ước ID-based trong toàn hệ thống. FE có thể dùng để link ngược lại trang sản phẩm `/product/[id]`.

---

### 4. GET `/brands` — Danh Sách Thương Hiệu

**Response `200 OK`:**

```json
[
  {
    "id": 1,
    "name": "Kassler",
    "slug": "kassler",
    "logo": "/brand/kassler.png",
    "logoHtml": "<span class=\"font-sans font-black tracking-wide text-red-600 italic text-[12px] select-none\">KASSLER</span>",
    "categories": [
      { "slug": "dai-sanh", "name": "Khóa Đại Sảnh" },
      { "slug": "cua-go",   "name": "Khóa Cửa Gỗ" },
      { "slug": "Smart",    "name": "Két Sắt Thông Minh" }
    ]
  },
  {
    "id": 2,
    "name": "Philips",
    "slug": "philips",
    "logo": "/brand/philips.png",
    "logoHtml": "<span class=\"font-sans font-extrabold tracking-widest text-[#0066a1] text-[10px] select-none\">PHILIPS</span>",
    "categories": [
      { "slug": "dai-sanh", "name": "Khóa Đại Sảnh" },
      { "slug": "cua-go",   "name": "Khóa Cửa Gỗ" }
    ]
  },
  {
    "id": 3,
    "name": "Bosch",
    "slug": "bosch",
    "logo": "/brand/bosch.png",
    "logoHtml": "<span class=\"font-sans font-black tracking-tighter text-[#0056A8] text-[14px] select-none\">BOSCH</span>",
    "categories": [
      { "slug": "Kitchen", "name": "Thiết Bị Bếp" }
    ]
  }
]
```

> [!NOTE]
> - Response trên chỉ minh họa 3/6 thương hiệu. BE cần trả đủ: `kassler`, `bosch`, `sharp`, `hubert`, `hyundai`, `philips`.
> - **⚠️ Lưu ý Hyundai typo:** Code FE hiện tại lọc bằng cả `hyundai` và `huyndai` (sai chính tả cũ). BE chuẩn hóa slug thành `hyundai` và FE cần được sửa typo theo.
> - `categories[].id` **không tồn tại** trong response — FE chỉ cần `slug` để filter.
> - `logoHtml` tùy chọn — nếu không có, FE fallback dùng `logo` (img tag).
> - Thứ tự mảng = thứ tự hiển thị trên thanh lọc — BE sắp xếp theo `priority` hoặc thứ tự cố định.

---

## 🛠️ FE Integration Code Mẫu

```typescript
// lib/api.ts — Đặt trong /frontend/lib/api.ts
import type { IProduct, IProductsListResponse, IBrand } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;    // slug danh mục chính
  subcategory?: string; // slug danh mục con
  brand?: string;       // slug thương hiệu
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "newest" | "price-asc" | "price-desc"; // không có "name" — FE không dùng
}

// ─── 1. Danh sách sản phẩm ────────────────────────────────────────────────
export async function getProducts(params: GetProductsParams = {}) {
  const url = new URL(`${BASE}/products/locks`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      url.searchParams.set(k, String(v));
    }
  });
  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm");
  return res.json() as Promise<IProductsListResponse>;
}

// ─── 2. Chi tiết sản phẩm ────────────────────────────────────────────────
export async function getProduct(idOrCode: string) {
  const res = await fetch(
    `${BASE}/products/locks/${encodeURIComponent(idOrCode)}`,
    { next: { revalidate: 300 } }
  );
  if (res.status === 404) throw new Error("Sản phẩm không tồn tại");
  if (!res.ok) throw new Error("Lỗi khi tải chi tiết sản phẩm");
  return res.json() as Promise<IProduct>;
}

// ─── 3. Ảnh/video lắp đặt ────────────────────────────────────────────────
export async function getInstallationMedia(
  id: string,
  params: { page?: number; limit?: number; type?: "all" | "images" | "videos" } = {}
) {
  const url = new URL(`${BASE}/products/locks/${id}/installation`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) url.searchParams.set(k, String(v));
  });
  const res = await fetch(url.toString(), { next: { revalidate: 120 } });
  if (!res.ok) throw new Error("Không thể tải ảnh lắp đặt");
  return res.json();
}

// ─── 4. Danh sách thương hiệu ────────────────────────────────────────────
export async function getBrands() {
  const res = await fetch(`${BASE}/brands`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Không thể tải danh sách thương hiệu");
  return res.json() as Promise<IBrand[]>;
}
```
