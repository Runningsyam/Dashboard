with open("index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "circulation" in line.lower() or "recirc" in line.lower() or "inside" in line.lower():
        print(f"Line {idx+1}: {line.strip()}")
