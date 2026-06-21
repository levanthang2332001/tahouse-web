#!/usr/bin/env python3
"""
Extract product variants (multiple prices) from catalogue pages using Claude Vision API.
Scans pages 01-92 and builds a mapping of products with different prices.
"""

import os
import json
import base64
import re
from pathlib import Path
from anthropic import Anthropic

# Config
SOURCE_PAGES_DIR = r"D:\TA_HOUSE_WEB\SOURCE\test_pages"
OUTPUT_FILE = "extracted_variants.json"

client = Anthropic()

def encode_image_to_base64(image_path):
    """Encode image file to base64 string."""
    with open(image_path, "rb") as image_file:
        return base64.standard_b64encode(image_file.read()).decode("utf-8")

def extract_products_from_page(page_num, image_path):
    """
    Extract product data from a single page using Claude Vision.
    Returns a list of products with their prices, options, and variants.
    """
    try:
        image_data = encode_image_to_base64(image_path)

        message = client.messages.create(
            model="claude-opus-4-7",
            max_tokens=2000,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/png",
                                "data": image_data,
                            },
                        },
                        {
                            "type": "text",
                            "text": """Analyze this catalogue page and extract ALL products with their prices.

For each product, extract:
1. Product code (e.g., KL-979G, KL-838)
2. Product name
3. All prices shown (base price + any variant prices with descriptions)
4. Color/option variants if applicable
5. Accessory/feature variants (e.g., with/without APP WISHOME, REMOTE, etc.)

Return ONLY valid JSON (no markdown, no code blocks) with this structure:
{
  "page": PAGE_NUMBER,
  "products": [
    {
      "code": "KL-979G",
      "name": "KL - 979 G",
      "base_price": 22390000,
      "formatted_base_price": "22.390.000 đ",
      "variants": [
        {
          "description": "Không có phụ kiện",
          "price": 22390000,
          "formatted_price": "22.390.000 đ"
        },
        {
          "description": "Thêm APP WISHOME",
          "price": 24590000,
          "formatted_price": "24.590.000 đ"
        }
      ],
      "option_type": "Phụ kiện" or "Màu sắc" or "Khác"
    }
  ]
}

If page has no products or is blank, return {"page": PAGE_NUMBER, "products": []}.

IMPORTANT:
- Extract prices exactly as shown (preserve Vietnamese formatting)
- If product has ONLY ONE price, still include it in "base_price"
- DO NOT hallucinate products - only extract what's visible
- Sort variants by price (lowest first)
"""
                        }
                    ],
                }
            ],
        )

        # Parse response
        response_text = message.content[0].text.strip()
        result = json.loads(response_text)

        print(f"✓ Page {page_num:02d}: {len(result.get('products', []))} products extracted")
        return result

    except json.JSONDecodeError as e:
        print(f"✗ Page {page_num:02d}: Failed to parse JSON response - {e}")
        return {"page": page_num, "products": []}
    except Exception as e:
        print(f"✗ Page {page_num:02d}: Error - {e}")
        return {"page": page_num, "products": []}

def parse_price(price_str):
    """Parse Vietnamese price string to integer."""
    if not price_str:
        return None
    # Remove spaces and 'đ' suffix, convert to int
    cleaned = re.sub(r'[^\d]', '', price_str)
    return int(cleaned) if cleaned else None

def main():
    print("=" * 60)
    print("EXTRACTING PRODUCT VARIANTS FROM CATALOGUE PAGES")
    print("=" * 60)

    all_variants = {}  # {product_code: {prices, options, etc}}
    extraction_results = []

    # Process pages 01-92
    for page_num in range(1, 93):
        page_file = Path(SOURCE_PAGES_DIR) / f"page_{page_num:02d}.png"

        if not page_file.exists():
            print(f"✗ Page {page_num:02d}: File not found")
            continue

        result = extract_products_from_page(page_num, str(page_file))
        extraction_results.append(result)

        # Aggregate variants by product code
        for product in result.get("products", []):
            code = product.get("code")
            if code:
                if code not in all_variants:
                    all_variants[code] = {
                        "name": product.get("name"),
                        "base_price": product.get("base_price"),
                        "formatted_base_price": product.get("formatted_base_price"),
                        "option_type": product.get("option_type"),
                        "pages_found": [],
                        "variants": []
                    }

                # Track which pages this product appears on
                all_variants[code]["pages_found"].append(page_num)

                # Merge variants
                for variant in product.get("variants", []):
                    # Check if this variant already exists
                    variant_exists = any(
                        v["price"] == variant["price"] and v["description"] == variant["description"]
                        for v in all_variants[code]["variants"]
                    )
                    if not variant_exists:
                        all_variants[code]["variants"].append(variant)

    # Write extracted data
    print("\n" + "=" * 60)
    print("WRITING RESULTS")
    print("=" * 60)

    # Save raw extraction results
    with open("extraction_results.json", "w", encoding="utf-8") as f:
        json.dump(extraction_results, f, indent=2, ensure_ascii=False)
    print(f"✓ Saved raw extraction: extraction_results.json")

    # Save aggregated variants
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_variants, f, indent=2, ensure_ascii=False)
    print(f"✓ Saved aggregated variants: {OUTPUT_FILE}")

    # Summary report
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    products_with_variants = {k: v for k, v in all_variants.items() if len(v.get("variants", [])) > 1}

    print(f"Total products extracted: {len(all_variants)}")
    print(f"Products with multiple variants: {len(products_with_variants)}\n")

    if products_with_variants:
        print("Products with variants:")
        for code, data in sorted(products_with_variants.items()):
            print(f"\n  {code} ({data['name']})")
            print(f"    Option type: {data.get('option_type', 'Unknown')}")
            print(f"    Found on pages: {data['pages_found']}")
            print(f"    Variants:")
            for v in sorted(data["variants"], key=lambda x: x["price"]):
                print(f"      - {v['description']}: {v['formatted_price']}")

    print("\n" + "=" * 60)
    print("Next step: Review extracted_variants.json and run migrate_variants.js")
    print("=" * 60)

if __name__ == "__main__":
    main()
