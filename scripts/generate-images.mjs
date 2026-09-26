#!/usr/bin/env node
/**
 * Renders favicons, app icons and per-language Open Graph images with Playwright (dev-time only;
 * outputs are committed). Run: node --experimental-strip-types scripts/generate-images.mjs
 */
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const languages = JSON.parse(await readFile(path.join(ROOT, 'src/i18n/languages.json'), 'utf8'));
const svg = await readFile(path.join(ROOT, 'public/favicon.svg'), 'utf8');

const browser = await chromium.launch();
const page = await browser.newPage();

for (const [file, size, pad] of [
  ['favicon-32.png', 32, 0], ['apple-touch-icon.png', 180, 18], ['icon-192.png', 192, 20], ['icon-512.png', 512, 52],
]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<body style="margin:0;background:${pad ? '#eef2ff' : 'transparent'};display:grid;place-items:center;height:100vh">
    <div style="width:${size - pad * 2}px;height:${size - pad * 2}px">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div></body>`);
  await page.screenshot({ path: path.join(ROOT, 'public', file), omitBackground: !pad });
}

await mkdir(path.join(ROOT, 'public/og'), { recursive: true });
await page.setViewportSize({ width: 1200, height: 630 });
for (const lang of languages) {
  const ui = (await import(pathToFileURL(path.join(ROOT, `src/i18n/ui/${lang.code}.ts`)).href)).default;
  await page.setContent(`<!doctype html><html dir="${lang.dir}" lang="${lang.code}"><body style="margin:0;width:1200px;height:630px;
    background:linear-gradient(135deg,#1e1b4b 0%,#312e81 45%,#0c4a6e 100%);color:#fff;
    font-family:'Noto Sans','Noto Sans CJK SC','Noto Sans Devanagari','Noto Sans Bengali','Noto Sans Arabic',system-ui,sans-serif;
    display:flex;flex-direction:column;justify-content:center;padding:0 90px;box-sizing:border-box">
    <div style="display:flex;align-items:center;gap:22px;margin-bottom:40px">
      <div style="width:84px;height:84px">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div>
      <div style="font-size:44px;font-weight:800;letter-spacing:-1px">PassportData</div>
    </div>
    <div style="font-size:68px;font-weight:800;line-height:1.15;max-width:1000px">${ui.home.h1}</div>
    <div style="font-size:32px;color:#c7d2fe;margin-top:26px">${ui.meta.tagline}</div>
    <div style="display:flex;gap:18px;margin-top:44px;font-size:26px;font-weight:700">
      <span style="background:#10b981;padding:10px 20px;border-radius:999px">${ui.status.visa_free}</span>
      <span style="background:#0ea5e9;padding:10px 20px;border-radius:999px">${ui.status.eta}</span>
      <span style="background:#f59e0b;padding:10px 20px;border-radius:999px">${ui.status.e_visa}</span>
      <span style="background:#f43f5e;padding:10px 20px;border-radius:999px">${ui.status.visa_required}</span>
    </div>
  </body></html>`);
  await page.screenshot({ path: path.join(ROOT, `public/og/${lang.code}.png`) });
  console.log(`✓ og/${lang.code}.png`);
}
await browser.close();
