"""Import FAAC data into the new project from exported SQL file."""
import os
import re
import time
from pathlib import Path
from supabase import create_client

env_file = Path(__file__).parent.parent / ".env.local"
if env_file.exists():
    for line in env_file.read_text().splitlines():
        m = re.match(r'^(\w+)=(.*)$', line.strip())
        if m:
            os.environ.setdefault(m.group(1), m.group(2))

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

SQL_FILE = Path(__file__).parent / "import_data.sql"
content = SQL_FILE.read_text(encoding="utf-8")

statements = [s.strip() for s in content.split(";") if s.strip()]
total = len(statements)
print(f"Executing {total} SQL statements...")

BATCH = 200
for i in range(0, total, BATCH):
    batch = statements[i : i + BATCH]
    sql = ";\n".join(batch) + ";"
    try:
        supabase.rpc("exec_sql", {"sql_text": sql}).execute()
        print(f"  Batch {i // BATCH + 1}/{ (total + BATCH - 1) // BATCH } OK")
    except Exception as e:
        print(f"  Batch {i // BATCH + 1} failed, retrying smaller...")
        # retry in smaller chunks
        for j in range(0, len(batch), 50):
            sub = batch[j : j + 50]
            sub_sql = ";\n".join(sub) + ";"
            try:
                supabase.rpc("exec_sql", {"sql_text": sub_sql}).execute()
                print(f"    Sub-batch {j // 50 + 1} OK")
            except Exception as e2:
                print(f"    Sub-batch {j // 50 + 1} FAILED: {e2}")
                raise
    time.sleep(0.25)

print("Done! Refreshing dashboard_summary...")
supabase.rpc("exec_sql", {"sql_text": "REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_summary;"}).execute()
print("Complete!")
