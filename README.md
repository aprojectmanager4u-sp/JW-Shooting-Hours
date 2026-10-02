# Walters - WI Shooting Hours — install on Android

This folder is a complete installable web app (PWA). It needs to be served over HTTPS once; after that it runs offline from your home screen.

## Fastest: GitHub Pages (free, ~5 minutes)
1. Create a new public repo on github.com (e.g. `wi-shooting-hours`).
2. Upload every file in this folder to the repo root.
3. Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`. Save.
4. On your phone, open `https://<your-username>.github.io/wi-shooting-hours/` in Chrome.
5. Chrome menu (⋮) → **Install app** (or "Add to Home screen"). Allow location when asked.

Netlify Drop (app.netlify.com/drop — drag this folder in) works the same way.

## Want a real APK / Play Store listing?
Wrap the hosted URL as a Trusted Web Activity with Bubblewrap (`npx @bubblewrap/cli init --manifest https://.../manifest.webmanifest`) or PWABuilder.com, which generate a signed Android project from this manifest.

## Files
- `index.html` – the whole app (engine + Wisconsin county data inline)
- `manifest.webmanifest`, `icon-*.png` – install metadata and icons
- `sw.js` – offline cache

## How times are computed
For 2026 the app uses the Wisconsin DNR's published Zone A shooting-hours tables (northern and southern areas) built into index.html, and adds the zone minutes: A +0, B +4, C +8, D +12, E +16, F +20 (zones split at 88°, 89°, 90°, 91°, 92° W).
Northern area = Pierce, Dunn, Eau Claire, Clark, Marathon, Shawano, Oconto, Door counties and everything north (Wis. Admin. Code NR 10.06).
- Deer, bear, elk, small game, fall turkey: 30 min before sunrise to 20 min after sunset
- Waterfowl and migratory birds, spring turkey: 30 min before sunrise to sunset
- Early teal: sunrise to sunset
- Coyote, fox, raccoon: no limit, except bow and crossbow hunters during the bow deer, bear and elk seasons
Years without a DNR table are calculated and match published tables within 1 minute. Always confirm with the official DNR tables.
