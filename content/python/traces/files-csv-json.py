import csv
import io
import json

text = "name,score\nada,9\nbo,7\n"
rows = list(csv.DictReader(io.StringIO(text)))
total = 0
for row in rows:
    total += int(row["score"])
report = json.dumps({"count": len(rows), "total": total})
print(report)
data = json.loads(report)
print(data["total"])
