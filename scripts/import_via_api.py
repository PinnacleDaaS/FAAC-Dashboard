"""Import FAAC data via Supabase REST API using anon key + INSERT policy."""
import os, re, json, time
from pathlib import Path
from supabase import create_client

env_file = Path(__file__).parent.parent / ".env.local"
for line in env_file.read_text().splitlines():
    m = re.match(r'^(\w+)=(.*)$', line.strip())
    if m:
        os.environ.setdefault(m.group(1), m.group(2))

supabase = create_client(os.environ["NEXT_PUBLIC_SUPABASE_URL"], os.environ["NEXT_PUBLIC_SUPABASE_ANON_KEY"])

# Read and parse the SQL file
sql_file = Path(__file__).parent / "import_data.sql"
lines = sql_file.read_text().splitlines()

faac_batch = []
igr_batch = []

for line in lines:
    if line.startswith("--") or not line.strip():
        continue
    if "faac_allocations" in line:
        m = re.search(r"\((\d+),\s*'([^']+)',\s*(\d+),\s*([\d.]+),\s*([\d.-]+)\)", line)
        if m:
            faac_batch.append({
                "year": int(m.group(1)),
                "state": m.group(2),
                "month": int(m.group(3)),
                "gross": float(m.group(4)),
                "net": float(m.group(5)),
            })
    elif "igr_data" in line:
        m = re.search(r"\((\d+),\s*'([^']+)',\s*([\d.]+)\)", line)
        if m:
            igr_batch.append({
                "year": int(m.group(1)),
                "state": m.group(2),
                "total_igr": float(m.group(3)),
            })

print(f"Parsed {len(faac_batch)} FAAC rows, {len(igr_batch)} IGR rows")

BATCH = 500
for i in range(0, len(faac_batch), BATCH):
    batch = faac_batch[i:i+BATCH]
    supabase.table("faac_allocations").upsert(batch, on_conflict="year,state,month").execute()
    print(f"  FAAC {i+BATCH}/{len(faac_batch)}")

for i in range(0, len(igr_batch), BATCH):
    batch = igr_batch[i:i+BATCH]
    supabase.table("igr_data").upsert(batch, on_conflict="year,state").execute()
    print(f"  IGR {i+BATCH}/{len(igr_batch)}")

print("Done! Data imported. Refreshing dashboard_summary via MCP.")
