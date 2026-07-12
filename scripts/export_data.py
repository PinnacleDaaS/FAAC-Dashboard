"""Export FAAC data from old project as SQL INSERT statements."""
import os
import sys
from pathlib import Path
from supabase import create_client

OLD_URL = "https://pvguhssnvzldvnnhmoqk.supabase.co"
OLD_KEY = "sb_publishable_bbvWdXIAnnAkbuD0sEmV5A_qj1sCLFb"

OUTPUT = Path(__file__).parent.parent / "scripts" / "import_data.sql"

supabase = create_client(OLD_URL, OLD_KEY)

def quote(val):
    if val is None:
        return "NULL"
    if isinstance(val, str):
        escaped = val.replace("'", "''")
        return f"'{escaped}'"
    return str(val)

lines = []
lines.append("-- FAAC Allocations")
all_faac = []
offset = 0
while True:
    batch = supabase.table("faac_allocations").select("*").range(offset, offset + 999).execute()
    if not batch.data:
        break
    all_faac.extend(batch.data)
    offset += 1000
    if len(batch.data) < 1000:
        break

for row in all_faac:
    lines.append(
        f"INSERT INTO faac_allocations (year, state, month, gross, net) "
        f"VALUES ({row['year']}, {quote(row['state'])}, {row['month']}, {row['gross']}, {row['net']}) "
        f"ON CONFLICT (year, state, month) DO UPDATE SET gross=EXCLUDED.gross, net=EXCLUDED.net;"
    )
lines.append("")

lines.append("-- IGR Data")
all_igr = []
offset = 0
while True:
    batch = supabase.table("igr_data").select("*").range(offset, offset + 999).execute()
    if not batch.data:
        break
    all_igr.extend(batch.data)
    offset += 1000
    if len(batch.data) < 1000:
        break

for row in all_igr:
    lines.append(
        f"INSERT INTO igr_data (year, state, total_igr) "
        f"VALUES ({row['year']}, {quote(row['state'])}, {row['total_igr']}) "
        f"ON CONFLICT (year, state) DO UPDATE SET total_igr=EXCLUDED.total_igr;"
    )

OUTPUT.write_text("\n".join(lines), encoding="utf-8")
print(f"Exported {len(all_faac)} FAAC rows + {len(all_igr)} IGR rows to {OUTPUT}")
