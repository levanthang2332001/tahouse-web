#!/usr/bin/env node
/**
 * Migrate product variants from extracted_variants.json into products.json
 *
 * This script:
 * 1. Reads extracted_variants.json (output from extract_variants_from_pages.py)
 * 2. Reads current products.json
 * 3. Injects "options" and "variants" fields into products with multiple prices
 * 4. Creates backup of original products.json
 * 5. Writes updated products.json
 */

const fs = require('fs');
const path = require('path');

const EXTRACTED_FILE = path.join(__dirname, 'extracted_variants.json');
const PRODUCTS_FILE = path.join(__dirname, 'database', 'products.json');
const BACKUP_FILE = path.join(__dirname, 'database', 'products.backup.json');

function formatPrice(price) {
  if (!price) return '';
  return price.toLocaleString('vi-VN') + ' đ';
}

function parsePrice(priceStr) {
  if (!priceStr) return null;
  // Remove all non-digit characters
  const cleaned = priceStr.replace(/\D/g, '');
  return parseInt(cleaned, 10) || null;
}

function generateVariantId(productCode, index) {
  return `${productCode}_v${index + 1}`;
}

function buildOptions(variants) {
  /**
   * Infer option structure from variant descriptions
   * E.g., if variants have descriptions like "Không" and "Thêm APP WISHOME",
   * create an option like {"name": "Phụ kiện", "values": [...]}
   */
  const optionNames = new Set();
  const optionValues = {};

  // Simple heuristic: if description contains common keywords, categorize
  const optionKeywords = {
    'Màu': ['màu', 'color', 'red', 'bronze', 'silver', 'blue', 'gold', 'copper', 'green'],
    'Phụ kiện': ['không', 'thêm', 'app', 'remote', 'wishhome', 'xhome', 'tuya', 'usmart'],
  };

  for (const variant of variants) {
    const desc = (variant.description || '').toLowerCase();

    for (const [optionName, keywords] of Object.entries(optionKeywords)) {
      if (keywords.some(kw => desc.includes(kw))) {
        optionNames.add(optionName);
        if (!optionValues[optionName]) optionValues[optionName] = new Set();
        optionValues[optionName].add(variant.description);
      }
    }
  }

  // Convert to options array
  const options = Array.from(optionNames).map(name => ({
    name,
    values: Array.from(optionValues[name] || []),
  }));

  return options;
}

function buildVariants(variantData) {
  /**
   * Transform extracted variant data into product variant structure.
   */
  return variantData.variants.map((variant, index) => ({
    id: `${variantData.code || 'UNKNOWN'}_v${index + 1}`,
    label: variant.description,
    attributes: {}, // Could be extended with option->value mapping
    price: variant.price || variantData.base_price,
    formatted_price: variant.formatted_price || formatPrice(variant.price || variantData.base_price),
    is_default: index === 0, // First variant is default
  }));
}

function main() {
  console.log('═'.repeat(60));
  console.log('MIGRATING VARIANTS INTO PRODUCTS.JSON');
  console.log('═'.repeat(60));

  // 1. Check if extracted file exists
  if (!fs.existsSync(EXTRACTED_FILE)) {
    console.error(`✗ File not found: ${EXTRACTED_FILE}`);
    console.error('  Run extract_variants_from_pages.py first');
    process.exit(1);
  }

  // 2. Read extracted variants
  let extractedData;
  try {
    const content = fs.readFileSync(EXTRACTED_FILE, 'utf-8');
    extractedData = JSON.parse(content);
    console.log(`✓ Loaded extracted variants: ${Object.keys(extractedData).length} products`);
  } catch (err) {
    console.error(`✗ Failed to parse ${EXTRACTED_FILE}:`, err.message);
    process.exit(1);
  }

  // 3. Read current products.json
  let products;
  try {
    const content = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    products = JSON.parse(content);
    console.log(`✓ Loaded products.json: ${products.length} products`);
  } catch (err) {
    console.error(`✗ Failed to parse ${PRODUCTS_FILE}:`, err.message);
    process.exit(1);
  }

  // 4. Create backup
  try {
    fs.copyFileSync(PRODUCTS_FILE, BACKUP_FILE);
    console.log(`✓ Created backup: ${BACKUP_FILE}`);
  } catch (err) {
    console.error(`✗ Failed to create backup:`, err.message);
    process.exit(1);
  }

  // 5. Inject variants into products
  let injectedCount = 0;
  const processedCodes = new Set();

  for (const product of products) {
    const code = product.code?.toUpperCase();
    if (!code || !extractedData[code]) continue;

    const variantData = extractedData[code];
    const variants = variantData.variants || [];

    // Only inject if there are multiple prices
    if (variants.length > 1) {
      product.options = buildOptions(variants);
      product.variants = buildVariants({
        code,
        ...variantData,
        variants,
      });

      product.has_variants = true;
      processedCodes.add(code);
      injectedCount++;
    } else if (variants.length === 1) {
      // Single price: update base price if current is null/invalid
      if (!product.price || product.price <= 0) {
        product.price = variants[0].price;
        product.formatted_price = variants[0].formatted_price;
      }
      product.variants = [];
      product.has_variants = false;
    }
  }

  console.log(`✓ Injected variants into ${injectedCount} products`);

  // 6. Report unmatched products from extracted data
  const unmatchedCodes = Object.keys(extractedData).filter(code => !processedCodes.has(code));
  if (unmatchedCodes.length > 0) {
    console.log(`\n⚠ Warning: ${unmatchedCodes.length} extracted products not found in products.json:`);
    unmatchedCodes.slice(0, 10).forEach(code => {
      console.log(`  - ${code}`);
    });
    if (unmatchedCodes.length > 10) {
      console.log(`  ... and ${unmatchedCodes.length - 10} more`);
    }
  }

  // 7. Write updated products.json
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
    console.log(`✓ Wrote updated products.json`);
  } catch (err) {
    console.error(`✗ Failed to write ${PRODUCTS_FILE}:`, err.message);
    process.exit(1);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('MIGRATION COMPLETE');
  console.log('═'.repeat(60));
  console.log(`
Summary:
  ✓ Injected variants: ${injectedCount} products
  ✓ Backup created: ${BACKUP_FILE}
  ✓ Updated: ${PRODUCTS_FILE}

Next steps:
  1. Review the updated products.json
  2. Test API: GET /products?code=KL-979R (should have variants)
  3. Check frontend: verify variant selector renders correctly
`);
}

main();
