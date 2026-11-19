import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); FR = os.path.join(HERE, "frames_mac"); NARR = os.path.join(HERE, "narr2")
tl = json.load(open(os.path.join(FR, "timeline.json"))); frames, starts, end = tl["frames"], tl["starts"], tl["end"]
def run(*a):
    r = subprocess.run(list(a), capture_output=True, text=True)
    if r.returncode: print(r.stderr[-1500:]); sys.exit(1)
    return r

# 1. frames -> exact constant 30 fps timeline (for every output tick, show the newest captured frame at or before it)
lst = os.path.join(FR, "list.txt"); FPS = 30; n_out = int(end * FPS) + 1; j = 0
with open(lst, "w") as f:
    for k in range(n_out):
        t = k / FPS
        while j + 1 < len(frames) and frames[j + 1]["t"] <= t: j += 1
        f.write("file '%s'\nduration %.6f\n" % (frames[j]["file"], 1.0 / FPS))
    f.write("file '%s'\n" % frames[j]["file"])
silent = os.path.join(HERE, "silent_mac.mp4")
if not os.path.exists(silent): run("ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-vf", "fps=30,scale=1920:1080,format=yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-movflags", "+faststart", silent)
total = float(run("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", silent).stdout.strip()); print("video seconds", round(total, 1))

# 2. narration placed at each scene start (the encoded video is slightly longer than the capture clock, so scale scene starts)
FACTOR = total / max(end, frames[-1]["t"]); print("time factor", round(FACTOR, 4))
ids = sorted(starts); inputs = []; flt = []
for i, sid in enumerate(ids):
    inputs += ["-i", os.path.join(NARR, sid + ".mp3")]
    ms = int(starts[sid] * FACTOR * 1000) + 350
    flt.append("[%d:a]adelay=%d|%d,volume=1.15[n%d]" % (i, ms, ms, i))
flt.append("".join("[n%d]" % i for i in range(len(ids))) + "amix=inputs=%d:normalize=0,apad=pad_dur=%d[narr]" % (len(ids), int(total) + 2))
narr = os.path.join(HERE, "narration_mac.wav")
run("ffmpeg", "-y", *inputs, "-filter_complex", ";".join(flt), "-map", "[narr]", "-t", "%.2f" % total, "-ar", "44100", narr)

# 3. soft ambient music bed (Fmaj7 - C - Am7 - G pads, slow swell), faded in and out
chords = [[174.61, 220.0, 261.63, 329.63], [196.0, 261.63, 329.63, 392.0], [220.0, 261.63, 329.63, 392.0], [196.0, 246.94, 293.66, 392.0]]
segs = []
for i, ch in enumerate(chords):
    expr = "0.18*(" + "+".join("sin(2*PI*%s*t)" % f for f in ch) + "+0.5*sin(2*PI*%s*t))*(0.55+0.45*sin(2*PI*0.11*t))" % (ch[0] / 2)
    f = os.path.join(HERE, "pad%d.wav" % i); run("ffmpeg", "-y", "-f", "lavfi", "-i", "aevalsrc='%s':d=8:s=44100" % expr, "-af", "afade=t=in:d=2,afade=t=out:st=6:d=2,lowpass=f=1400", f); segs.append(f)
cc = os.path.join(HERE, "pads.txt"); open(cc, "w").write("".join("file '%s'\n" % s for s in segs))
loop = os.path.join(HERE, "pad_loop.wav"); run("ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", cc, "-c", "copy", loop)
music = os.path.join(HERE, "music_mac.wav")
run("ffmpeg", "-y", "-stream_loop", "-1", "-i", loop, "-t", "%.2f" % total, "-af", "volume=0.55,afade=t=in:d=3,afade=t=out:st=%.2f:d=4" % (total - 4), music)

# 4. mix: music ducked under narration, then mux
final = os.path.join(HERE, "schritt-launch-mac.mp4")
run("ffmpeg", "-y", "-i", silent, "-i", narr, "-i", music, "-filter_complex",
    "[2:a][1:a]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=500[duck];[1:a][duck]amix=inputs=2:normalize=0:weights=1 0.9,alimiter=limit=0.95[a]",
    "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", final)
print("wrote", final, round(os.path.getsize(final) / 1e6, 1), "MB")
