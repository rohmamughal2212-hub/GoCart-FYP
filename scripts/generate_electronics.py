import csv
import json
import pathlib
import re

src = pathlib.Path(r"C:\Users\CH-MHS\Desktop\electronics_dataset_100_products.csv")
out = pathlib.Path(r"C:\Users\CH-MHS\Desktop\Gocart\Frontend\src\assets\electronicsProducts.js")
rows = []

if not src.exists():
    raise FileNotFoundError(f"CSV not found: {src}")

with src.open("r", encoding="utf-8", errors="replace") as f:
    reader = csv.DictReader(f)
    for i, row in enumerate(reader):
        title = (row.get("title") or "").strip()
        if not title:
            continue
        images = [u.strip() for u in (row.get("images") or "").split(" | ") if u.strip()]
        price_str = (row.get("price") or "").strip().replace(",", "")
        original_raw = (row.get("original_price") or "").strip().replace("₹", "").replace("INR", "").replace(",", "")

        def to_num(s):
            try:
                return float(re.sub(r"[^0-9.]", "", s))
            except Exception:
                return 0

        price = to_num(price_str) or to_num(original_raw) or 0
        original_price = to_num(original_raw) or price or 0
        desc = row.get("highlights") or row.get("description") or ""
        if isinstance(desc, str) and desc.startswith("[") and desc.endswith("]"):
            desc = desc[1:-1]
        desc_lines = [d.strip() for d in re.split(r"\s*\|\s*|\\n|\.|;|,", desc) if d.strip()]
        if not desc_lines:
            desc_lines = [title]

        rows.append({
            "_id": (row.get("uniq_id") or row.get("pid") or f"prod{i}").strip(),
            "name": title,
            "category": "Electronics",
            "price": int(original_price) if original_price == int(original_price) else original_price,
            "offerPrice": int(price) if price == int(price) else price,
            "image": images or ["https://via.placeholder.com/400"],
            "description": desc_lines[:5],
            "inStock": True,
        })

with out.open("w", encoding="utf-8") as f:
    f.write("export const electronicsProducts = [\n")
    for item in rows:
        f.write("  " + json.dumps(item, ensure_ascii=False) + ",\n")
    f.write("];\n")

print(f"WROTE {len(rows)} products to {out}")
