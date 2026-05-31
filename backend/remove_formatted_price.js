#!/usr/bin/env node
/**
 * Remove formatted_price field from all products and variants
 */

const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, 'database', 'products.json');

function main() {
  console.log('============================================================');
  console.log('REMOVING FORMATTED_PRICE FIELDS');
  console.log('============================================================\n');

  // Read products
  let products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
  console.log(`[OK] Loaded ${products.length} products`);

  // Create backup
  fs.copyFileSync(PRODUCTS_FILE, PRODUCTS_FILE + '.backup_before_remove_formatted_price');
  console.log(`[OK] Created backup: products.json.backup_before_remove_formatted_price\n`);

  let removed = 0;
  let variant_removed = 0;

  // Process each product
  for (const product of products) {
    // Remove root formatted_price
    if (product.hasOwnProperty('formatted_price')) {
      delete product.formatted_price;
      removed++;
    }

    // Remove formatted_price from all variants
    if (Array.isArray(product.variants)) {
      for (const variant of product.variants) {
        if (variant.hasOwnProperty('formatted_price')) {
          delete variant.formatted_price;
          variant_removed++;
        }
      }
    }
  }

  // Write updated products.json
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');

  console.log('============================================================');
  console.log('SUMMARY');
  console.log('============================================================');
  console.log(`[OK] Removed ${removed} root formatted_price fields`);
  console.log(`[OK] Removed ${variant_removed} variant formatted_price fields`);
  console.log(`[OK] Total removed: ${removed + variant_removed}`);
  console.log(`[OK] Updated: ${PRODUCTS_FILE}`);
}

main();
