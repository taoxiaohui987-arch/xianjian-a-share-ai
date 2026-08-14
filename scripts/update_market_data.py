#!/usr/bin/env python3
import json
import pathlib
import urllib.parse
import urllib.request
import time
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "github-src" / "public" / "data"
OUT.mkdir(parents=True, exist_ok=True)

FIELDS = "f12,f13,f14,f2,f3,f4,f5,f6,f15,f16,f17,f18,f20,f21,f8,f9,f23"
PARAMS = {
    "pn": "1", "pz": "100", "po": "1", "np": "1", "fltt": "2", "invt": "2",
    "fid": "f3", "fs": "m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23,m:0+t:81+s:2048", "fields": FIELDS,
}
rows = []
for page in range(1, 80):
    params = {**PARAMS, "pn": str(page)}
    url = "https://82.push2.eastmoney.com/api/qt/clist/get?" + urllib.parse.urlencode(params)
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Referer": "https://quote.eastmoney.com/"})
    batch = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                batch = json.load(response).get("data", {}).get("diff", [])
            break
        except Exception:
            time.sleep(1 + attempt * 2)
    if batch is None:
        if rows:
            break
        raise RuntimeError("market data source unavailable")
    if not batch:
        break
    rows.extend(batch)
    time.sleep(0.15)
    if len(batch) < 100:
        break

def number(value):
    return value if isinstance(value, (int, float)) else None

stocks = []
for row in rows:
    code = str(row.get("f12", ""))
    if len(code) != 6:
        continue
    exchange = "SH" if str(row.get("f13")) == "1" else ("BJ" if code[0] in "489" else "SZ")
    stocks.append({
        "code": code, "exchange": exchange, "name": row.get("f14") or code,
        "price": number(row.get("f2")), "changePct": number(row.get("f3")), "change": number(row.get("f4")),
        "volume": number(row.get("f5")), "amount": number(row.get("f6")), "high": number(row.get("f15")),
        "low": number(row.get("f16")), "open": number(row.get("f17")), "preClose": number(row.get("f18")),
        "marketCap": number(row.get("f20")), "floatMarketCap": number(row.get("f21")),
        "turnover": number(row.get("f8")), "pe": number(row.get("f9")), "pb": number(row.get("f23")), "source": "东方财富免费行情",
    })

payload = {"updatedAt": datetime.now(timezone.utc).isoformat(), "count": len(stocks), "stocks": stocks}
(OUT / "market.json").write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"updated {len(stocks)} A-share records")
