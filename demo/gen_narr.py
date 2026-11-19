import asyncio, json, os, subprocess, edge_tts
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "narr2"); os.makedirs(OUT, exist_ok=True)
script = json.load(open(os.path.join(HERE, "script.json"), encoding="utf8"))
VOICE = "en-US-AndrewNeural"

async def one(s):
    f = os.path.join(OUT, s["id"] + ".mp3")
    await edge_tts.Communicate(s["text"], VOICE, rate="-6%").save(f)
    d = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).decode().strip())
    return s["id"], round(d, 2)

async def main():
    res = await asyncio.gather(*[one(s) for s in script])
    json.dump(dict(res), open(os.path.join(OUT, "durations.json"), "w"), indent=1)
    print(dict(res), "total", round(sum(d for _, d in res), 1))

asyncio.run(main())
