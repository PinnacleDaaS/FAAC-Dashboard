from pathlib import Path

sql = Path("scripts/compact_import.sql").read_text()
parts = sql.split("INSERT INTO ")
batches = []
current = ""
for p in parts:
    if not p.strip():
        continue
    stmt = "INSERT INTO " + p
    if len(current) + len(stmt) > 25000 and current:
        batches.append(current)
        current = stmt
    else:
        current += stmt
if current:
    batches.append(current)

for i, batch in enumerate(batches):
    Path(f"scripts/run_batch_{i+1}.sql").write_text(batch)
    n = batch.count("INSERT")
    print(f"Batch {i+1}: {len(batch)} chars, {n} INSERTs")
