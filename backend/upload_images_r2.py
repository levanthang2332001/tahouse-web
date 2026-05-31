#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Upload product images to Cloudflare R2 and update products.json
"""

import json
import os
import sys
from pathlib import Path
import boto3
from botocore.config import Config

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# R2 Configuration
R2_CONFIG = {
    'account_id': '7a37e799b4c37841fde478a3e36b2d58',
    'bucket_name': 'cuongcorex',
    'access_key': '645662415549e64759a6262881f0b666',
    'secret_key': '927d86949e4a21153c9f324484ae256405f741443ca57070a50e3790095c4b30',
    'public_url': 'https://pub-574171c4de1f4094b5bcfb3b35270183.r2.dev'
}

# Product pages mapping
PRODUCT_PAGES = {
    'KL-589FG': 39,
    'KL-838B': 40,
    'KL-878': 41,
    'KL-371': 42,
    'KL-287CNC': 43,
    'KL-587CNC': 43,
    'KL-266': 44,
    'KL-292CNC': 48,
    'KL-592CNC': 48,
    'KL-999AT': 49,
    'KL-999PRO': 51,
    'KL-999CNC': 54,
    'KL-999LX': 57,
    'KL-999PROPLUS': 59,
    'KL-999IS': 60,
    'KL-999SR': 63,
    'KL-599': 64,
    'KL-599SR': 66,
    'KL-999L': 67,
    'KL-576CNC': 68,
    'KL-573': 70
}

SOURCE_DIR = r'D:\TA_HOUSE_WEB\SOURCE\test_pages'
PRODUCTS_FILE = 'database/products.json'

def create_r2_client():
    """Create S3 client configured for Cloudflare R2"""
    return boto3.client(
        's3',
        endpoint_url=f"https://{R2_CONFIG['account_id']}.r2.cloudflarestorage.com",
        region_name='auto',
        aws_access_key_id=R2_CONFIG['access_key'],
        aws_secret_access_key=R2_CONFIG['secret_key'],
        config=Config(signature_version='s3v4')
    )

def upload_image_to_r2(s3_client, image_path, product_code):
    """Upload image to R2 and return public URL"""
    try:
        key = f'products/{product_code.lower()}_page.png'

        with open(image_path, 'rb') as f:
            s3_client.upload_fileobj(
                f,
                R2_CONFIG['bucket_name'],
                key,
                ExtraArgs={'ContentType': 'image/png'}
            )

        public_url = f"{R2_CONFIG['public_url']}/{key}"
        print(f"  [OK] {product_code} → {public_url}")
        return public_url
    except Exception as e:
        print(f"  [ERROR] {product_code}: {str(e)}")
        return None

def main():
    print("=" * 60)
    print("UPLOADING PRODUCT IMAGES TO CLOUDFLARE R2")
    print("=" * 60)

    # Create R2 client
    try:
        s3_client = create_r2_client()
        print("[OK] Connected to Cloudflare R2\n")
    except Exception as e:
        print(f"[ERROR] Failed to connect to R2: {e}")
        return

    # Upload images
    uploaded_urls = {}
    uploaded_count = 0

    for code, page_num in PRODUCT_PAGES.items():
        image_path = os.path.join(SOURCE_DIR, f'page_{page_num:02d}.png')

        if not os.path.exists(image_path):
            print(f"  [SKIP] {code} - Image not found (page {page_num})")
            continue

        print(f"[{code}]")
        url = upload_image_to_r2(s3_client, image_path, code)
        if url:
            uploaded_urls[code] = url
            uploaded_count += 1

    print(f"\n[OK] Uploaded {uploaded_count} images\n")

    # Update products.json
    print("=" * 60)
    print("UPDATING PRODUCTS.JSON")
    print("=" * 60)

    with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
        products = json.load(f)

    updated_count = 0
    for product in products:
        code = product.get('code', '').upper()
        if code in uploaded_urls:
            product['images'] = [uploaded_urls[code]]
            updated_count += 1
            print(f"  [OK] Updated {code}")

    with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

    print(f"\n[OK] Updated {updated_count} products\n")

    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Uploaded: {uploaded_count} images")
    print(f"Updated: {updated_count} products")
    print(f"R2 Bucket: {R2_CONFIG['bucket_name']}")
    print(f"Public URL: {R2_CONFIG['public_url']}")

if __name__ == '__main__':
    main()
