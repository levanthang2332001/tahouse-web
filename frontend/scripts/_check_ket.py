import json
import os
import sys
import urllib.request

BACKEND_URL = os.environ.get("BACKEND_API_URL", "").rstrip("/")
if not BACKEND_URL:
    sys.exit("BACKEND_API_URL is not configured")


def get_json(url):
    # The API's edge rejects urllib's default User-Agent with 403
    req = urllib.request.Request(url, headers={"User-Agent": "tahouse-scripts/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)

for slug in ["ket-sat", "Smart", "lock-parent", "phu-kien-nha-bep"]:
    q = f"{BACKEND_URL}/products/locks?category={slug}&limit=1&page=1"
    d = get_json(q)
    data = d.get("data") or {}
    print(f"{slug}\ttotal={data.get('total')}")

# also all catalog total
q = f"{BACKEND_URL}/products/locks?limit=1&page=1"
d = get_json(q)
print("ALL\ttotal=", (d.get("data") or {}).get("total"))
