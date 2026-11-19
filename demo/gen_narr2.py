import asyncio, json, os, subprocess, edge_tts, time
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "narr2")
script = json.load(open(os.path.join(HERE, "script.json"), encoding="utf8")); durs = {}
async def one(s):
    f = os.path.join(OUT, s["id"] + ".mp3")
    for attempt in range(6):
        try:
            await edge_tts.Communicate(s["text"], "en-US-AndrewNeural", rate="-6%").save(f)
            if os.path.getsize(f) > 1000: break
        except Exception as e:
            print(s["id"], "retry", attempt, str(e)[:60]); await asyncio.sleep(2 + attempt * 2)
    d = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).decode().strip()); return round(d, 2)
async def main():
    for s in script: durs[s["id"]] = await one(s)
    json.dump(durs, open(os.path.join(OUT, "durations.json"), "w"), indent=1); print(durs, "total", round(sum(durs.values()), 1))
asyncio.run(main())
