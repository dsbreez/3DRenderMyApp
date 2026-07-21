# 3D Mockup Video & Image Studio

3D device mockups of your app, built entirely with free and
open-source tools. Two ways to use it:

1. **Interactive studio** — a single self-contained HTML file. Open it in any
   browser, drop in an app screenshot, drag to rotate, and export high-res PNGs.
2. **Headless video renderer** — render seamless-looping green-screen MP4s
   (360° spins, sways, tumbles) ready to chroma-key into your video edits.

![example frame](examples/example-frame.png)

The phone is a procedural 3D model (modern-flagship proportions with rounded
titanium-style frame, screen, camera plateau) built from Three.js primitives —
no proprietary device assets.

## Quick start

```bash
npm install
npm run build          # inlines three.js into mockup-studio.html
```

**Interactive:** open `mockup-studio.html` in a browser. Drop a screenshot on
it, pick a background (green screen / dark / light / custom), an animation,
tilt and zoom, then export a PNG. Everything runs locally; nothing is uploaded.

**Video:**

```bash
node render.mjs --screenshot your-app.png --out spin.mp4 \
  --anim spin --seconds 5 --fps 30 --w 1920 --h 1080 --bg 00ff00
```

The background renders as mathematically exact `#00FF00` (or any hex you pass),
so it keys cleanly in Premiere, Final Cut, DaVinci Resolve, or CapCut. All
animations loop seamlessly.

### Options

| Flag | Default | Meaning |
|---|---|---|
| `--screenshot` | placeholder | Portrait app screenshot (PNG/JPG/WebP). Cover-fitted to the 19.5:9 screen; 1179×2556 is ideal. |
| `--anim` | `spin` | `spin` (full 360°), `sway` (gentle ±30° oscillation), `tumble` (spin + pitch/roll wobble) |
| `--seconds` / `--fps` | `6` / `30` | Loop length and frame rate |
| `--w` / `--h` | `1920` / `1080` | Output size. Use `1080`/`1920` for Reels/Shorts (add `--zoom 0.85`) |
| `--bg` | `00ff00` | Background hex (no `#`) |
| `--tilt` | `12` | Forward lean in degrees |
| `--zoom` | `1.0` | Camera zoom |

Frames are also left in `frames/` as PNGs if you want stills — frame *i* of a
spin is at yaw `i × (360/total)°`.

## Requirements

- Node 18+
- `ffmpeg` on your PATH ([ffmpeg.org](https://ffmpeg.org), or `brew install ffmpeg`)
- A Chromium/Chrome. The script auto-detects common install paths and falls
  back to Google Chrome via Playwright; override with `CHROMIUM_PATH=/path/to/chrome`.

No GPU needed — rendering uses SwiftShader (software WebGL). A 5s 1080p clip
takes a minute or two.

## Transparent background instead of green?

Set `--bg` to your edit's key color, or modify the scene to render alpha:
set `scene.background = null` in the HTML, screenshot with `omitBackground`,
and encode WebM with `-c:v libvpx-vp9 -pix_fmt yuva420p`. Green-screen MP4 is
kept as the default because it's compatible with every editor.

## License / credits

MIT. Built on [Three.js](https://threejs.org) (MIT),
[Playwright](https://playwright.dev) (Apache-2.0), [FFmpeg](https://ffmpeg.org)
(LGPL/GPL), and Chromium (BSD). The device model is an original
stylized design, not an Apple asset.
