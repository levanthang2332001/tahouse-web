#!/usr/bin/env node
/**
 * Add 21 new products from pages 39-71 to products.json
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('crypto').randomUUID ? () => require('crypto').randomUUID() : () => Math.random().toString(36).substr(2, 9);

const PRODUCTS_FILE = path.join(__dirname, 'database', 'products.json');

// Helper to generate UUID
function generateId() {
  return require('crypto').randomUUID();
}

const newProducts = [
  {
    code: 'KL-589FG',
    name: 'KL - 589 FG',
    basePrice: 22690000,
    colors: ['Đen'],
    category: 'Khóa Đại Sảnh',
    categoryId: 1,
    optionType: 'Phụ kiện',
    variants: [
      { desc: 'Không', price: 22690000 },
      { desc: '+ APP TUYA', price: 22690000 }
    ],
    page: 39
  },
  {
    code: 'KL-838B',
    name: 'KL - 838 B',
    basePrice: 5390000,
    colors: ['Vàng', 'Đỏ Đồng', 'Đen', 'Đồng', 'Xanh Đồng'],
    category: 'Khóa Cửa Thường',
    categoryId: 2,
    optionType: 'Màu sắc',
    variants: [
      { desc: 'GOLD', price: 5390000 },
      { desc: 'RED BRONZE', price: 5790000 },
      { desc: 'BLACK', price: 5790000 },
      { desc: 'BRONZE', price: 5790000 },
      { desc: 'GREEN BRONZE', price: 5690000 }
    ],
    page: 40
  },
  {
    code: 'KL-878',
    name: 'KL - 878',
    basePrice: 5190000,
    colors: ['Đen', 'Đỏ Đồng'],
    category: 'Khóa Cửa Thường',
    categoryId: 2,
    optionType: 'Màu sắc',
    variants: [
      { desc: 'Không', price: 5190000 },
      { desc: 'RED BRONZE', price: 5790000 }
    ],
    page: 41
  },
  {
    code: 'KL-371',
    name: 'KL - 371',
    basePrice: 6990000,
    colors: ['Đen'],
    category: 'Khóa Cửa Thường',
    categoryId: 2,
    optionType: 'Phụ kiện',
    variants: [
      { desc: 'Không', price: 6990000 },
      { desc: '+ APP TUYA', price: 7990000 }
    ],
    page: 42
  },
  {
    code: 'KL-287CNC',
    name: 'KL - 287 CNC',
    basePrice: 5390000,
    colors: ['Đen'],
    category: 'Khóa Cửa Thường',
    categoryId: 2,
    optionType: 'Phụ kiện',
    variants: [
      { desc: 'Không', price: 5390000 },
      { desc: '+ TIUA', price: 5390000 }
    ],
    page: 43
  },
  {
    code: 'KL-587CNC',
    name: 'KL - 587 CNC',
    basePrice: 5690000,
    colors: ['Xám'],
    category: 'Khóa Cửa Thường',
    categoryId: 2,
    optionType: 'Phụ kiện',
    variants: [
      { desc: 'Không', price: 5690000 },
      { desc: '+ TIUA', price: 5690000 }
    ],
    page: 43
  },
  {
    code: 'KL-266',
    name: 'KL - 266',
    basePrice: 5490000,
    colors: ['Đồng', 'Đen'],
    category: 'Khóa Cửa Thường',
    categoryId: 2,
    optionType: 'Màu sắc',
    variants: [
      { desc: 'COPPER', price: 5490000 },
      { desc: 'BLACK', price: 5690000 }
    ],
    page: 44
  },
  {
    code: 'KL-292CNC',
    name: 'KL - 292 CNC',
    basePrice: 13590000,
    colors: ['Vàng'],
    category: 'Khóa Đại Sảnh',
    categoryId: 1,
    optionType: 'Màu sắc',
    variants: [
      { desc: 'GOLD', price: 13590000 }
    ],
    page: 48
  },
  {
    code: 'KL-592CNC',
    name: 'KL - 592 CNC',
    basePrice: 13590000,
    colors: ['Xám'],
    category: 'Khóa Đại Sảnh',
    categoryId: 1,
    optionType: 'Màu sắc',
    variants: [
      { desc: 'GREY', price: 13590000 }
    ],
    page: 48
  },
  {
    code: 'KL-999AT',
    name: 'KL - 999 AT',
    basePrice: 16190000,
    colors: ['Đen', 'Xám'],
    category: 'Khóa Đại Sảnh',
    categoryId: 1,
    optionType: 'Màu sắc',
    variants: [
      { desc: 'BLACK', price: 16190000 },
      { desc: 'GREY', price: 16190000 }
    ],
    page: 49
  },
  {
    code: 'KL-999PRO',
    name: 'KL - 999 PRO',
    basePrice: 14390000,
    colors: ['Xám', 'Vàng'],
    category: 'Khóa Đại Sảnh',
    categoryId: 1,
    optionType: 'Màu sắc',
    variants: [
      { desc: 'GREY', price: 14390000 },
      { desc: 'CHAMPAGNE GOLD', price: 14390000 }
    ],
    page: 51
  },
  {
    code: 'KL-999CNC',
    name: 'KL - 999 CNC',
    basePrice: 13900000,
    colors: ['Vàng', 'Xám', 'Đen'],
    category: 'Khóa Đại Sảnh',
    categoryId: 1,
    optionType: 'Màu sắc',
    variants: [
      { desc: 'CHAMPAGNE GOLD', price: 14900000 },
      { desc: 'GREY', price: 13900000 },
      { desc: 'BLACK', price: 13900000 }
    ],
    page: 54
  },
  {
    code: 'KL-999LX',
    name: 'KL - 999 LX',
    basePrice: 10690000,
    colors: ['Đen', 'Vàng'],
    category: 'Khóa Đại Sảnh',
    categoryId: 1,
    optionType: 'Màu sắc',
    variants: [
      { desc: 'BLACK', price: 10690000 },
      { desc: 'CHAMPAGNE', price: 11690000 }
    ],
    page: 57
  },
  {
    code: 'KL-999PROPLUS',
    name: 'KL - 999 PRO PLUS',
    basePrice: 11390000,
    colors: ['Đen', 'Xám'],
    category: 'Khóa Đại Sảnh',
    categoryId: 1,
    optionType: 'Màu sắc',
    variants: [
      { desc: 'BLACK', price: 11390000 },
      { desc: 'GREY', price: 12390000 }
    ],
    page: 59
  },
  {
    code: 'KL-999IS',
    name: 'KL - 999 IS',
    basePrice: 7490000,
    colors: ['Vàng', 'Xám', 'Đen'],
    category: 'Khóa Đại Sảnh',
    categoryId: 1,
    optionType: 'Màu sắc',
    variants: [
      { desc: 'CHAMPAGNE GOLD', price: 8990000 },
      { desc: 'GREY', price: 7490000 },
      { desc: 'BLACK', price: 7490000 }
    ],
    page: 60
  },
  {
    code: 'KL-999SR',
    name: 'KL - 999 SR',
    basePrice: 7690000,
    colors: ['Xám'],
    category: 'Khóa Đại Sảnh',
    categoryId: 1,
    optionType: 'Màu sắc',
    variants: [
      { desc: 'GREY', price: 7690000 }
    ],
    page: 63
  },
  {
    code: 'KL-599',
    name: 'KL - 599',
    basePrice: 5690000,
    colors: ['Đen'],
    category: 'Khóa Cửa Thường',
    categoryId: 2,
    optionType: 'Phụ kiện',
    variants: [
      { desc: 'Không', price: 5690000 },
      { desc: '+ APP TUYA', price: 6690000 }
    ],
    page: 64
  },
  {
    code: 'KL-599SR',
    name: 'KL - 599 SR',
    basePrice: 6390000,
    colors: ['Xám'],
    category: 'Khóa Cửa Thường',
    categoryId: 2,
    optionType: 'Màu sắc',
    variants: [
      { desc: 'GREY', price: 6390000 }
    ],
    page: 66
  },
  {
    code: 'KL-999L',
    name: 'KL - 999 L',
    basePrice: 9390000,
    colors: ['Đen', 'Xám'],
    category: 'Khóa Đại Sảnh',
    categoryId: 1,
    optionType: 'Màu sắc',
    variants: [
      { desc: 'BLACK', price: 9390000 },
      { desc: 'GREY', price: 9690000 }
    ],
    page: 67
  },
  {
    code: 'KL-576CNC',
    name: 'KL - 576 CNC',
    basePrice: 12690000,
    colors: ['Xám', 'Vàng'],
    category: 'Khóa Đại Sảnh',
    categoryId: 1,
    optionType: 'Phụ kiện',
    variants: [
      { desc: 'SILVER GREY', price: 12690000 },
      { desc: '+ REMOTE (WIFI)', price: 13690000 },
      { desc: 'GOLD GREY + REMOTE (WIFI)', price: 14690000 }
    ],
    page: 68
  },
  {
    code: 'KL-573',
    name: 'KL - 573',
    basePrice: 7690000,
    colors: ['Đen'],
    category: 'Khóa Cửa Thường',
    categoryId: 2,
    optionType: 'Phụ kiện',
    variants: [
      { desc: 'Không', price: 7690000 },
      { desc: '+ APP TUYA', price: 7690000 }
    ],
    page: 70
  }
];

function createProductObject(data) {
  return {
    id: generateId(),
    code: data.code,
    name: data.name,
    price: data.basePrice,
    specs: [
      { key: 'Loại khóa', value: 'Khóa thông minh' },
      { key: 'Vật liệu', value: 'Hợp kim kẽm' },
      { key: 'Nguồn điện', value: 'Pin AA' },
      { key: 'Số lần mở/khóa', value: '3000 lần' },
      { key: 'Nhiệt độ vận hành', value: '-20°C ~ 60°C' }
    ],
    colors: data.colors,
    category: data.category,
    features: [
      'Vận hành bằng mã PIN',
      'Điều khiển từ xa qua APP',
      'Khóa tự động',
      'Chống nước, chống bụi'
    ],
    warranty: '2 năm',
    description: `${data.name} - Khóa thông minh chất lượng cao`,
    page_number: data.page,
    technologies: ['Smart Lock', 'App Control'],
    images: [],
    formatted_price: `${data.basePrice.toLocaleString('vi-VN')} đ`,
    category_id: data.categoryId,
    priority: null,
    installation: { images: [], videos: [] },
    options: [
      {
        name: data.optionType,
        values: data.variants.map(v => v.desc)
      }
    ],
    variants: data.variants.map((v, i) => ({
      id: `${data.code}_v${i + 1}`,
      label: v.desc,
      attributes: { [data.optionType]: v.desc },
      price: v.price,
      formatted_price: `${v.price.toLocaleString('vi-VN')} đ`,
      is_default: i === 0
    })),
    has_variants: data.variants.length > 1
  };
}

function main() {
  console.log('============================================================');
  console.log('ADDING 21 NEW PRODUCTS TO PRODUCTS.JSON');
  console.log('============================================================');

  // Read existing products
  let products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
  console.log(`[Current] ${products.length} products in products.json`);

  // Create backup
  fs.copyFileSync(PRODUCTS_FILE, PRODUCTS_FILE + '.backup3');
  console.log(`[Backup] Created products.json.backup3`);

  // Check for duplicates
  const existingCodes = new Set(products.map(p => p.code?.toUpperCase()));
  const newCodes = newProducts.map(p => p.code.toUpperCase());
  const duplicates = newCodes.filter(c => existingCodes.has(c));

  if (duplicates.length > 0) {
    console.log(`[Warning] Skipping ${duplicates.length} duplicate products:`, duplicates);
  }

  // Add only new products
  const productsToAdd = newProducts.filter(p => !existingCodes.has(p.code.toUpperCase()));

  for (const data of productsToAdd) {
    const productObj = createProductObject(data);
    products.push(productObj);
  }

  // Write updated products.json
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');

  console.log(`\n[OK] Added ${productsToAdd.length} new products`);
  console.log(`[OK] Total products now: ${products.length}`);
  console.log(`[OK] Products with variants: ${products.filter(p => p.has_variants).length}`);

  console.log('\n============================================================');
  console.log('SUMMARY');
  console.log('============================================================');
  console.log(`New products added (${productsToAdd.length}):`);
  productsToAdd.forEach(p => {
    const count = p.variants.length;
    console.log(`  ✓ ${p.code}: ${count} variant${count > 1 ? 's' : ''}`);
  });

  console.log('\n============================================================');
}

main();
