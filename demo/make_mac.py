import io, re
HERE = "C:/Users/Utsav/german-app/demo/"
s = io.open(HERE + "stage.html", encoding="utf8").read()

# ---- caption column: narrower, smaller type (the laptop needs the width) ----
s = s.replace("#cap{position:absolute;left:120px;top:50%;width:800px;", "#cap{position:absolute;left:90px;top:50%;width:560px;")
s = s.replace("#title{font-size:96px;", "#title{font-size:62px;")
s = s.replace("#sub{font-size:38px;line-height:1.35;color:#a1a1a6;margin-top:30px;max-width:780px;", "#sub{font-size:28px;line-height:1.4;color:#a1a1a6;margin-top:24px;max-width:540px;")
s = s.replace("#eyebrow{font-size:26px;", "#eyebrow{font-size:22px;")
s = s.replace("#part{position:absolute;left:140px;", "#part{position:absolute;left:100px;").replace("#dots{position:absolute;left:140px;", "#dots{position:absolute;left:100px;")

# ---- replace the phone CSS with a MacBook ----
a = s.index("#stagewrap{")
b = s.index("#fade{")
mac_css = """#stagewrap{position:absolute;left:1280px;top:520px;width:0;height:0;perspective:2600px}
#pose{position:absolute;left:0;top:0;transform-style:preserve-3d;transition:transform 1.5s cubic-bezier(.22,.8,.2,1)}
#float{transform-style:preserve-3d;animation:fl 7s ease-in-out infinite}
@keyframes fl{0%,100%{transform:translateY(-5px) rotateY(-1.2deg)}50%{transform:translateY(7px) rotateY(1.2deg)}}
#mac{position:absolute;left:-560px;top:-390px;width:1120px;height:780px}
#lid{position:absolute;left:0;top:0;width:1120px;height:716px;border-radius:26px 26px 6px 6px;padding:14px;background:linear-gradient(160deg,#a9acb2,#4a4b50 30%,#8b8e94 60%,#2a2b2e);box-shadow:0 60px 120px rgba(0,0,0,.7),inset 0 0 0 2px rgba(255,255,255,.22)}
#bez{position:relative;width:100%;height:100%;border-radius:14px;background:#000;padding:10px 10px 12px}
#notch{position:absolute;left:50%;top:0;width:150px;height:22px;margin-left:-75px;border-radius:0 0 14px 14px;background:#000;z-index:20}
#base{position:absolute;left:-60px;top:714px;width:1240px;height:22px;border-radius:2px 2px 26px 26px;background:linear-gradient(#cfd1d6,#8d9096 60%,#5c5e63);box-shadow:0 30px 60px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.7)}
#base::before{content:"";position:absolute;left:50%;top:0;width:190px;height:9px;margin-left:-95px;border-radius:0 0 12px 12px;background:linear-gradient(#7c7f85,#a9acb1)}
#vp{position:relative;width:1280px;height:800px;border-radius:8px;overflow:hidden;transform-origin:0 0;transform:scale(.8325);background:linear-gradient(135deg,#1b2b4b 0%,#4a2c6b 38%,#c4577a 70%,#f09a5b 100%)}
#screen{position:absolute;inset:0}
#mb{position:absolute;left:0;top:0;width:1280px;height:28px;z-index:6;background:rgba(20,20,24,.45);backdrop-filter:blur(14px);color:#f5f5f7;font:500 14px -apple-system,"SF Pro Text","Segoe UI",sans-serif}
#mb span{position:absolute;top:5px}#mb .ap{left:20px;font-size:16px;top:3px}#mb .ap2{left:52px;font-weight:700}#mb .m1{left:112px}#mb .m2{left:168px}#mb .m3{left:222px}#mb .rt{right:20px}
#win{position:absolute;left:24px;top:44px;width:1232px;height:732px;border-radius:12px;overflow:hidden;background:#000;z-index:3;box-shadow:0 30px 70px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.14)}
#tb{position:absolute;left:0;top:0;width:1232px;height:40px;background:linear-gradient(#2c2c2f,#232326);z-index:5;border-bottom:1px solid #111}
#tb i{position:absolute;top:13px;width:13px;height:13px;border-radius:50%}#tb .r{left:16px;background:#ff5f57}#tb .y{left:36px;background:#febc2e}#tb .g{left:56px;background:#28c840}
#tb .url{position:absolute;left:50%;top:7px;width:420px;height:26px;margin-left:-210px;border-radius:7px;background:#17171a;color:#a1a1a6;font:500 13px -apple-system,"Segoe UI",sans-serif;text-align:center;line-height:26px}
#app{position:absolute;left:0;top:40px;width:1232px;height:692px;border:0;background:#000;z-index:2}
#finger{position:absolute;left:-60px;top:-60px;width:26px;height:26px;margin:0;background:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M3 2l16 9-7 2 4 8-3 1.5-4-8-6 5z' fill='%23fff' stroke='%23000' stroke-width='1.6' stroke-linejoin='round'/></svg>") no-repeat;background-size:contain;filter:drop-shadow(0 3px 5px rgba(0,0,0,.5));z-index:9;opacity:0;pointer-events:none;transition:left .75s cubic-bezier(.3,.7,.2,1),top .75s cubic-bezier(.3,.7,.2,1),opacity .3s,transform .15s}
#finger.show{opacity:1}#finger.down{transform:scale(.82)}
.rip{position:absolute;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;border:3px solid rgba(90,200,250,.9);z-index:8;animation:rip .6s ease-out forwards;pointer-events:none}@keyframes rip{to{transform:scale(3.6);opacity:0}}
"""
s = s[:a] + mac_css + s[b:]

# ---- replace the phone markup with a MacBook ----
a = s.index('<div id="stagewrap">')
b = s.index('<div id="fade"></div>')
mac_html = """<div id="stagewrap"><div id="pose"><div id="float"><div id="mac"><div id="lid"><div id="bez"><div id="notch"></div><div id="vp"><div id="screen">
  <div id="mb"><span class="ap">&#63743;</span><span class="ap2">Safari</span><span class="m1">File</span><span class="m2">View</span><span class="m3">Window</span><span class="rt">Wed 9:41 AM</span></div>
  <div id="win"><div id="tb"><i class="r"></i><i class="y"></i><i class="g"></i><div class="url">schritt-rosy.vercel.app</div></div>
  <iframe id="app" src="/app/index.html" title="Schritt"></iframe><div id="finger"></div></div>
</div></div></div></div><div id="base"></div></div></div></div></div>
"""
s = s[:a] + mac_html + s[b:]

# ---- script: laptop geometry, pointer lives inside the window ----
s = s.replace('fingerEl = document.getElementById("finger")', 'fingerEl = document.getElementById("finger"), winEl = document.getElementById("win")')
s = s.replace("setInterval(sbSync, 250);", "")
s = s.replace("const vh = 777;", "const vh = 692;")
s = s.replace("r.top + r.height / 2 + 47", "r.top + r.height / 2 + 40")
s = s.replace("screenEl.appendChild(rip)", "winEl.appendChild(rip)")
s = s.replace("el.getBoundingClientRect();\n    if (r.top < 60", "el.getBoundingClientRect();\n    if (r.top < 60")
s = s.replace("<title>Schritt launch stage</title>", "<title>Schritt launch stage (MacBook)</title>")
io.open(HERE + "stage_mac.html", "w", encoding="utf8", newline="").write(s)

# ---- recorder + assembler variants ----
r = io.open(HERE + "record.js", encoding="utf8").read()
r = r.replace('"frames2"', '"frames_mac"').replace('PORT = 8891', 'PORT = 8893').replace('"stage.html"', '"stage_mac.html"').replace("/stage.html", "/stage_mac.html")
r = r.replace("width: 1920, height: 1080, deviceScaleFactor: 1", "width: 1920, height: 1080, deviceScaleFactor: 1")
io.open(HERE + "record_mac.js", "w", encoding="utf8", newline="").write(r)
m = io.open(HERE + "assemble.py", encoding="utf8").read()
m = m.replace('"frames2"', '"frames_mac"').replace('"silent.mp4"', '"silent_mac.mp4"').replace('"schritt-launch.mp4"', '"schritt-launch-mac.mp4"')
m = m.replace('"narration.wav"', '"narration_mac.wav"').replace('"music.wav"', '"music_mac.wav"')
io.open(HERE + "assemble_mac.py", "w", encoding="utf8", newline="").write(m)
print("ok", "stage_mac" , len(s))
