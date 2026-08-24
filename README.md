# Sandra & Gokul — Wedding Invitation

A scroll-driven, cinematic wedding invitation in a sage green & cream palette,
inspired by Kerala temple mural art and the bell-metal *nilavilakku* lamp —
built with plain HTML/CSS/JS and Three.js (no build step, works directly on
GitHub Pages).

## Files

- `index.html` — page structure and content
- `style.css` — design tokens, layout, mural motifs
- `scenes.js` — the Three.js scenes (hero particles, the signature scroll-lamp, ambient fields)
- `script.js` — page behaviour (nav, scroll reveals, countdown, calendar links, RSVP flow)
- `assets/vendor/three.module.min.js` — Three.js, vendored locally so the site has no external CDN dependency

## The signature element

A small brass lamp with five wicks sits fixed on the right edge of the screen
(a thin bar across the top on mobile). Its wicks light one by one as the
visitor scrolls through the page's seven story "tiers" — echoing the
tradition of lighting the nilavilakku at the start of any auspicious Kerala
function. It's driven by `initLampScene()` in `scenes.js` and the
`[data-lamp-tier]` attributes on each `<section>` in `index.html`.

## Things to customize before publishing

1. **Our Story section** (`#story` in `index.html`) — currently placeholder
   copy. Replace the three `<li class="timeline-item">` entries with the
   couple's real story.
2. **Gallery** (`#gallery`) — the six frames are tasteful color-gradient
   placeholders. Swap them for real photos, e.g. replace each
   `<figure class="gallery-frame ...">` with an `<img src="assets/photos/...jpg" alt="...">`
   inside it, and remove the corresponding gradient rule in `style.css`
   (`.gf-1` through `.gf-6`) if you no longer need it.
3. **Wedding details** — all editable in one place at the top of
   `script.js`, inside the `WEDDING` object (names, date/time, venue, maps
   link). The countdown and calendar links (Google Calendar + .ics download)
   are generated from these values automatically.

## Running locally

No build step needed. From this folder:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploying to GitHub Pages

1. Push these files to the root of a repository (or a `docs/` folder).
2. In the repo's Settings → Pages, set the source to that branch/folder.
3. The site will be live at `https://<username>.github.io/<repo>/`.

## Accessibility & performance notes

- Respects `prefers-reduced-motion` (particle counts drop and animations pause).
- All interactive elements have visible keyboard focus states.
- Three.js scenes are lightweight point/sprite based — no heavy textures or models.
