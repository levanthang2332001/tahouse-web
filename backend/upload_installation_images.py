#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Upload installation images from SHARP & BOSCH folders to R2
Match folder names with products.json and update installation.images
"""

import json
import os
import sys
from pathlib import Path
import boto3
from botocore.config import Config

# Fix encoding
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

# Source directories
SHARP_DIR = r'D:\TA_HOUSE_WEB\SOURCE\SHARP-20260531T133212Z-3-001\SHARP'
BOSCH_DIR = r'D:\TA_HOUSE_WEB\SOURCE\BOSCH - DE-20260531T133212Z-3-001\BOSCH - DE'
PRODUCTS_FILE = 'database/products.json'

# Mapping: folder name pattern → product code
FOLDER_TO_CODE = {
    'A2 - B': 'A2B',
    'A1 - B': 'A1B',
    'H3 - FV': 'H3FV',
    'H3 - V PRO': 'H3VPRO',
    'R1 - FDV': 'R1FDV',
    'S5 - DV': 'S5DV',
    'S5 - FDV': 'S5FDV',
    'S6 - B PRO': 'S6BPRO',
    'S6 - FV': 'S6FV',
    'S9 - FV': 'S9FV',
    'S9 - V PRO': 'S9VPRO',
    'T1 - B': 'T1B',
    'T2 - B': 'T2B',
    'EL - 600 VF': 'EL600VF-DE',
    'EL - 800 VF': 'EL800VF-DE',
    'FU 8 Plus': 'FU8PLUS',
    'ID - 80': 'ID80-DE',
    'ID 30': 'ID30-DE',
    'ID 60': 'ID60-DE',
    'EL - 600': 'EL600-DE',
    'EL - 800': 'EL800A-DE',
}

def create_r2_client():
    """Create S3 client for R2"""
    return boto3.client(
        's3',
        endpoint_url=f"https://{R2_CONFIG['account_id']}.r2.cloudflarestorage.com",
        region_name='auto',
        aws_access_key_id=R2_CONFIG['access_key'],
        aws_secret_access_key=R2_CONFIG['secret_key'],
        config=Config(signature_version='s3v4')
    )

def get_folder_code(folder_name):
    """Extract product code from folder name"""
    for pattern, code in FOLDER_TO_CODE.items():
        if folder_name.startswith(pattern):
            return code
    return None

def upload_image(s3_client, image_path, product_code, image_name):
    """Upload image to R2"""
    try:
        key = f'installation/{product_code}/{image_name}'
        with open(image_path, 'rb') as f:
            s3_client.upload_fileobj(
                f,
                R2_CONFIG['bucket_name'],
                key,
                ExtraArgs={'ContentType': 'image/jpeg' if image_path.lower().endswith('.jpg') else 'image/png'}
            )
        return f"{R2_CONFIG['public_url']}/{key}"
    except Exception as e:
        print(f"  [ERROR] {image_name}: {e}")
        return None

def main():
    print("=" * 70)
    print("UPLOADING INSTALLATION IMAGES TO R2")
    print("=" * 70)

    # Create R2 client
    try:
        s3_client = create_r2_client()
        print("[OK] Connected to Cloudflare R2\n")
    except Exception as e:
        print(f"[ERROR] Failed to connect: {e}")
        return

    # Load products
    with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
        products = json.load(f)

    product_map = {p['code']: p for p in products}

    # Track uploads
    uploads_by_code = {}
    total_uploaded = 0

    # Process SHARP folder
    print("[SHARP IMAGES]")
    if os.path.exists(SHARP_DIR):
        for folder_name in sorted(os.listdir(SHARP_DIR)):
            folder_path = os.path.join(SHARP_DIR, folder_name)
            if not os.path.isdir(folder_path):
                continue

            code = get_folder_code(folder_name)
            if not code or code not in product_map:
                print(f"  [SKIP] {folder_name} (no matching product code)")
                continue

            print(f"\n  [{code}] {folder_name}")
            images = []

            for image_name in sorted(os.listdir(folder_path)):
                if not image_name.lower().endswith(('.jpg', '.jpeg', '.png')):
                    continue

                image_path = os.path.join(folder_path, image_name)
                url = upload_image(s3_client, image_path, code, image_name)
                if url:
                    images.append(url)
                    total_uploaded += 1
                    print(f"    [OK] {image_name}")

            if images:
                if code not in uploads_by_code:
                    uploads_by_code[code] = []
                uploads_by_code[code].extend(images)

    # Process BOSCH folder
    print("\n\n[BOSCH IMAGES]")
    if os.path.exists(BOSCH_DIR):
        for folder_name in sorted(os.listdir(BOSCH_DIR)):
            folder_path = os.path.join(BOSCH_DIR, folder_name)
            if not os.path.isdir(folder_path):
                continue

            code = get_folder_code(folder_name)
            if not code or code not in product_map:
                print(f"  [SKIP] {folder_name} (no matching product code)")
                continue

            print(f"\n  [{code}] {folder_name}")
            images = []

            for image_name in sorted(os.listdir(folder_path)):
                if not image_name.lower().endswith(('.jpg', '.jpeg', '.png')):
                    continue

                image_path = os.path.join(folder_path, image_name)
                url = upload_image(s3_client, image_path, code, image_name)
                if url:
                    images.append(url)
                    total_uploaded += 1
                    print(f"    [OK] {image_name}")

            if images:
                if code not in uploads_by_code:
                    uploads_by_code[code] = []
                uploads_by_code[code].extend(images)

    print(f"\n\n[OK] Uploaded {total_uploaded} images\n")

    # Update products.json
    print("=" * 70)
    print("UPDATING INSTALLATION.IMAGES IN PRODUCTS.JSON")
    print("=" * 70 + "\n")

    updated = 0
    for product in products:
        code = product['code']
        if code in uploads_by_code:
            if 'installation' not in product:
                product['installation'] = {'images': [], 'videos': []}
            product['installation']['images'] = uploads_by_code[code]
            updated += 1
            print(f"[OK] Updated {code}: {len(uploads_by_code[code])} images")

    # Write updated products.json
    with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

    print(f"\n[OK] Updated {updated} products in products.json\n")

    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total images uploaded: {total_uploaded}")
    print(f"Products updated: {updated}")
    print(f"R2 Bucket: {R2_CONFIG['bucket_name']}")

if __name__ == '__main__':
    main()
