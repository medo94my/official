# Browser checks

`npm test` runs 276 assertions against pure functions. Those cannot see a
contrast ratio, a focus ring, an `aria-label` the browser ignores, or a `<dl>
whose items stopped being list items. Every defect in this directory's first
run was invisible to a status code, a byte count and a type — the site returned
200 throughout.

Two scripts, both run against a **live URL** rather than a build:

| Script | What it asserts |
|---|---|
| `audit.mjs` | Zero WCAG 2.1 A/AA violations (axe-core) and zero console errors, on every public route, in **both** themes |
| `interact.mjs` | Skip link, theme toggle and its persistence, no theme flash on first paint, mobile navigation, form labelling, focus visibility, and that no internal link 404s |

These are **not** part of `npm run check` or CI. `check` is offline and
deterministic; these need a server, a network and a browser, and a failure here
usually means "look at it", not "the build is broken".

## Running them

```bash
npm run audit:a11y                                   # against localhost:3000
BASE_URL=https://example.com npm run audit:a11y
npm run audit:interact
```

## Getting a browser without root

`npx playwright install chromium` downloads the browser into
`~/.cache/ms-playwright` as an ordinary user, but the binary then needs ~13
system libraries that `playwright install-deps` installs with `sudo`. On a host
where you do not have root, the libraries can go in your own home directory
instead — `apt-get download` needs no privileges:

```bash
PREFIX="$HOME/.cache/chromium-sysdeps"
mkdir -p "$PREFIX" /tmp/chromedebs && cd /tmp/chromedebs

PKGS="libasound2 libatk1.0-0 libatk-bridge2.0-0 libatspi2.0-0 libcairo2 \
      libcups2 libgbm1 libpango-1.0-0 libxcomposite1 libxdamage1 libxfixes3 \
      libxkbcommon0 libxrandr2"

# The full dependency closure, minus anything already installed on the host —
# extracting a second copy of a library the system already has (libc6, above
# all) onto LD_LIBRARY_PATH is how you break every binary you own.
apt-cache depends --recurse --no-recommends --no-suggests --no-conflicts \
  --no-breaks --no-replaces --no-enhances $PKGS \
  | grep -v '^ ' | grep -v '^<' | sort -u \
  | while read -r p; do
      dpkg-query -W -f='${Status}' "$p" 2>/dev/null | grep -q "install ok installed" || echo "$p"
    done | grep -E '^(lib|fonts-|ttf-)' > need.txt

xargs -a need.txt apt-get download
for d in *.deb; do dpkg-deb -x "$d" "$PREFIX"; done
```

Then run anything that launches the browser with:

```bash
export LD_LIBRARY_PATH="$PREFIX/usr/lib/x86_64-linux-gnu:$PREFIX/lib/x86_64-linux-gnu"
```

Confirm it worked — an empty result means every library resolved:

```bash
ldd ~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome | grep "not found"
```

Set `CHROMIUM_PATH` if the binary lives somewhere the default resolution misses.
