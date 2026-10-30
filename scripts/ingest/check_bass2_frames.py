import pandas as pd
import sys

sys.stdout.reconfigure(encoding="utf-8")

df = pd.read_csv("data/raw/PSI-25_Experimental table_BASS-II.csv")

print("=" * 80)
print("BASS-II EDGE CASES AND AMBIGUOUS ROWS")
print("=" * 80)

for i, r in df.iterrows():
    f_raw = str(r["Total Frames Shot"]).strip()
    air = str(r["Air display"]).strip()
    fan = str(r["Fan display"]).strip()
    o2_i = r["Calibrated  initial O2 % by vol "]
    o2_f = r["Calibrated final O2 % by vol"]
    co_i = r["Initial CO (ppm)"]
    co_f = r["Final CO (ppm)"]
    
    # check edge cases
    if any(k in f_raw.lower() for k in ["none", "video", "postburn", "+"]) or \
       any(k in air.lower() for k in ["ext", "lit", "off", "ign"]) or \
       any(k in fan.lower() for k in ["ext", "lit", "off", "ign"]):
        print(f"Line {i+2:3d} (Test {r['Test #']:5s}, Sample {r['Sample #']:5s}): Frames={repr(f_raw):20s} | Air={repr(air):30s} | Fan={repr(fan):30s}")
        print(f"         O2: {o2_i} -> {o2_f} | CO: {co_i} -> {co_f}")
