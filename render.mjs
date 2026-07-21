// Headless green-screen mockup video renderer.
// Usage: node render.mjs --screenshot app.png --out spin.mp4 [--anim spin|sway|tumble]
//        [--seconds 6] [--fps 30] [--w 1920] [--h 1080] [--bg 00ff00] [--tilt 12] [--zoom 1.0]
// Requires: node 18+, ffmpeg on PATH, and a Chromium/Chrome (see resolveBrowser below).
import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const args = {};
for (let i = 2; i < process.argv.length; i += 2) args[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];

const anim = args.anim || 'spin';
const seconds = parseFloat(args.seconds || '6');
const fps = parseInt(args.fps || '30');
const W = parseInt(args.w || '1920');
const H = parseInt(args.h || '1080');
const bg = (args.bg || '00ff00').replace(/^#/, '');
const tilt = args.tilt || '12';
const zoom = args.zoom || '1.0';
const out = args.out || 'mockup.mp4';
const total = Math.round(seconds * fps);

const dir = path.dirname(fileURLToPath(import.meta.url));
const framesDir = path.join(dir, 'frames');
if (existsSync(framesDir)) rmSync(framesDir, { recursive: true });
mkdirSync(framesDir);

const htmlPath = path.join(dir, 'mockup-studio.html');
if (!existsSync(htmlPath)) {
  console.error('mockup-studio.html not found — run `npm run build` first.');
  process.exit(1);
}
const url = `file://${htmlPath}?headless=1&w=${W}&h=${H}&bg=${bg}&anim=${anim}&tilt=${tilt}&zoom=${zoom}`;

// Find a browser: $CHROMIUM_PATH, common local paths, else Playwright's Chrome channel.
function resolveBrowser() {
  const candidates = [
    process.env.CHROMIUM_PATH,
    '/opt/pw-browsers/chromium',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  for (const c of candidates) if (existsSync(c)) return { executablePath: c };
  return { channel: 'chrome' }; // fall back to an installed Google Chrome via Playwright
}

const browser = await chromium.launch({
  ...resolveBrowser(),
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox', `--window-size=${W},${H}`],
});
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto(url);
await page.waitForFunction('window.MOCKUP && window.MOCKUP.ready', { timeout: 30000 });

if (args.screenshot) {
  const buf = readFileSync(args.screenshot);
  const ext = path.extname(args.screenshot).slice(1).toLowerCase();
  const mime = { jpg: 'jpeg', jpeg: 'jpeg', png: 'png', webp: 'webp' }[ext] || 'png';
  const dataUrl = `data:image/${mime};base64,${buf.toString('base64')}`;
  await page.evaluate(u => window.MOCKUP.loadScreenshot(u), dataUrl);
}

console.log(`Rendering ${total} frames at ${W}x${H}...`);
const canvas = page.locator('canvas');
for (let i = 0; i < total; i++) {
  await page.evaluate(([i, total]) => window.MOCKUP.setFrame(i, total), [i, total]);
  await canvas.screenshot({ path: path.join(framesDir, `f${String(i).padStart(5, '0')}.png`) });
  if (i % 30 === 0) console.log(`  frame ${i}/${total}`);
}
await browser.close();

console.log('Encoding video...');
execSync(
  `ffmpeg -y -framerate ${fps} -i ${framesDir}/f%05d.png -c:v libx264 -pix_fmt yuv420p -crf 16 -preset slow -movflags +faststart "${out}"`,
  { stdio: 'inherit', cwd: dir }
);
console.log(`Done: ${out}`);
