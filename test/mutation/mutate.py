"""Generic mutation check. usage: mutate.py MUTATIONS.py [name-filter ...] -- <test command...>   (run from the repo root)
MUTATIONS.py defines M = [(name, file, old, new), ...]; each `old` must occur exactly once in `file`.
The suite must PASS unmutated (checked first); every mutation is applied alone and the suite must then FAIL for it to count as killed; files are restored."""
import pathlib, subprocess, sys
spec, cmd = sys.argv[1], sys.argv[sys.argv.index("--") + 1:]
ns = {}; exec(open(spec).read(), ns); M = ns["M"]
only = sys.argv[2:sys.argv.index("--")]
if only: M = [m for m in M if any(w in m[0] for w in only)]
orig = {f: pathlib.Path(f).read_text() for f in {m[1] for m in M}}; bad = []
# A mutant only counts as killed if the suite is GREEN without it: with a red baseline every mutant 'fails' trivially.
base = subprocess.run(cmd, capture_output=True, text=True)
if base.returncode:
    print("BASELINE FAILS: the suite must pass before any mutation.\n" + "\n".join((base.stdout + base.stderr).splitlines()[-15:])); sys.exit(2)
print("baseline green", flush=True)
try:
    for name, f, old, new in M:
        n = orig[f].count(old)
        if n != 1:
            print(f"PATTERN? ({n}x) {name}", flush=True); bad.append(name); continue
        pathlib.Path(f).write_text(orig[f].replace(old, new))
        try: code = subprocess.run(cmd, capture_output=True, text=True, timeout=180).returncode
        except subprocess.TimeoutExpired: code = 124
        print(("killed   " if code else "SURVIVED ") + name, flush=True)
        if not code: bad.append(name)
        pathlib.Path(f).write_text(orig[f])
finally:
    for f, c in orig.items(): pathlib.Path(f).write_text(c)
print(f"\n{len(M)-len(bad)}/{len(M)} killed; restored: {all(pathlib.Path(f).read_text()==c for f,c in orig.items())}"); sys.exit(1 if bad else 0)
