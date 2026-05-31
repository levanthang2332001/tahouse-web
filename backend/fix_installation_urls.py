#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
1. Remove domain from installation URLs (keep relative path only)
2. Rename files on R2 to remove spaces
3. Update products.json
"""

import json
import sys
import boto3
from botocore.config import Config

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

R2_CONFIG = {
    'account_id': '7a37e799b4c37841fde478a3e36b2d58',
    'bucket_name': 'cuongcorex',
    'access_key': '645662415549e64759a6262881f0b666',
    'secret_key': '927d86949e4a21153c9f324484ae256405f741443ca57070a50e3790095c4b30',
    'public_url': 'https://pub-574171c4de1f4094b5bcfb3b35270183.r2.dev'
}

PRODUCTS_FILE = 'database/products.json'

def create_r2_client():
    return boto3.client(
        's3',
        endpoint_url=f"https://{R2_CONFIG['account_id']}.r2.cloudflarestorage.com",
        region_name='auto',
        aws_access_key_id=R2_CONFIG['access_key'],
        aws_secret_access_key=R2_CONFIG['secret_key'],
        config=Config(signature_version='s3v4')
    )

def rename_object_on_r2(s3_client, old_key, new_key):
    """Rename object on R2 by copying and deleting"""
    try:
        # Copy to new key
        copy_source = {'Bucket': R2_CONFIG['bucket_name'], 'Key': old_key}
        s3_client.copy_object(
            CopySource=copy_source,
            Bucket=R2_CONFIG['bucket_name'],
            Key=new_key
        )
        # Delete old key
        s3_client.delete_object(Bucket=R2_CONFIG['bucket_name'], Key=old_key)
        return True
    except Exception as e:
        print(f"  [ERROR] Rename {old_key}: {e}")
        return False

def main():
    print("=" * 70)
    print("FIXING INSTALLATION URLS")
    print("=" * 70 + "\n")

    # Load products
    with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
        products = json.load(f)

    # Collect all URLs and check for spaces
    all_urls = {}
    urls_with_spaces = {}

    for product in products:
        code = product.get('code')
        if 'installation' in product and 'images' in product['installation']:
            for url in product['installation']['images']:
                all_urls[url] = code
                if ' ' in url:
                    urls_with_spaces[url] = code

    print(f"Total installation URLs: {len(all_urls)}")
    print(f"URLs with spaces: {len(urls_with_spaces)}\n")

    if urls_with_spaces:
        print("[RENAMING FILES ON R2]")
        s3_client = create_r2_client()
        renamed_count = 0

        for url, code in urls_with_spaces.items():
            # Extract path from URL
            # URL format: https://pub-574171c4de1f4094b5bcfb3b35270183.r2.dev/installation/...
            if R2_CONFIG['public_url'] in url:
                path = url.split(R2_CONFIG['public_url'])[1].lstrip('/')
            else:
                path = url.lstrip('/')

            # Create new path without spaces
            new_path = path.replace(' ', '_').replace('(', '').replace(')', '')

            print(f"\n  [{code}]")
            print(f"    Old: {path}")
            print(f"    New: {new_path}")

            if rename_object_on_r2(s3_client, path, new_path):
                print(f"    [OK] Renamed")
                renamed_count += 1

        print(f"\n[OK] Renamed {renamed_count} files on R2\n")

    # Update products.json: remove domain, keep only relative path
    print("[UPDATING PRODUCTS.JSON]")
    updated_count = 0

    for product in products:
        if 'installation' in product and 'images' in product['installation']:
            updated_images = []
            for url in product['installation']['images']:
                # Convert full URL to relative path
                # https://pub-xxx.r2.dev/installation/... → /installation/...
                if url.startswith(R2_CONFIG['public_url']):
                    relative_path = url[len(R2_CONFIG['public_url']):]
                    # Also apply space removal if needed
                    relative_path = relative_path.replace(' ', '_').replace('(', '').replace(')', '')
                    updated_images.append(relative_path)
                else:
                    # Already relative or unknown format
                    updated_images.append(url)

            if updated_images != product['installation']['images']:
                product['installation']['images'] = updated_images
                updated_count += 1
                print(f"  [OK] {product['code']}: {len(updated_images)} images")

    # Write updated products.json
    with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

    print(f"\n[OK] Updated {updated_count} products in products.json\n")

    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"URLs fixed: {len(urls_with_spaces)}")
    print(f"Products updated: {updated_count}")
    print(f"\nURL format (example):")
    print(f"  Before: https://pub-xxx.r2.dev/installation/EL600-DE/IMG.jpg")
    print(f"  After:  /installation/EL600-DE/IMG.jpg")

if __name__ == '__main__':
    main()
