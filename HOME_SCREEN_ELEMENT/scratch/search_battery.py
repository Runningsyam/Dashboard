with open("app.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "batterycharging" in line.lower() or "battery_pct" in line.lower():
        print(f"Line {idx+1}: {line.strip()}")
