import json
import urllib.request

for slug in ["ket-sat", "Smart", "lock-parent", "phu-kien-nha-bep"]:
    q = f"https://tahouse-backend.onrender.com/products/locks?category={slug}&limit=1&page=1"
    with urllib.request.urlopen(q, timeout=60) as r:
        d = json.load(r)
    data = d.get("data") or {}
    print(f"{slug}\ttotal={data.get('total')}")

# also all catalog total
q = "https://tahouse-backend.onrender.com/products/locks?limit=1&page=1"
with urllib.request.urlopen(q, timeout=60) as r:
    d = json.load(r)
print("ALL\ttotal=", (d.get("data") or {}).get("total"))
