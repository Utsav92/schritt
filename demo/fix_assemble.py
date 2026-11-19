import io
p = "C:/Users/Utsav/german-app/demo/assemble.py"
lines = io.open(p, encoding="utf8").read().split("\n")
# find the broken block (from the 'f.write("file ' line inside the for loop to the silent= line) and rebuild it
start = next(i for i, l in enumerate(lines) if l.startswith('        f.write("file \'%s\''))
end = next(i for i, l in enumerate(lines) if l.startswith("silent = os.path.join"))
fixed = [
    "        f.write(\"file '%s'\\nduration %.6f\\n\" % (frames[j][\"file\"], 1.0 / FPS))",
    "    f.write(\"file '%s'\\n\" % frames[j][\"file\"])",
]
lines[start:end] = fixed
io.open(p, "w", encoding="utf8", newline="").write("\n".join(lines))
import ast; ast.parse(io.open(p, encoding="utf8").read()); print("assemble.py fixed")
