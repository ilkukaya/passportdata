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

const fontUrl = `data:font/woff2;base64,${(await readFile(path.join(ROOT, 'node_modules/@fontsource/fraunces/files/fraunces-latin-600-normal.woff2'))).toString('base64')}`;
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
  const serif = ['zh', 'ja', 'hi', 'bn', 'ar', 'ur', 'ru'].includes(lang.code) ? 'inherit' : "'Fraunces'";
  await page.setContent(`<!doctype html><html dir="${lang.dir}" lang="${lang.code}"><head><style>
    @font-face { font-family: 'Fraunces'; font-weight: 600; src: url('${fontUrl}') format('woff2'); }
    body { margin:0; width:1200px; height:630px; background:#f6f4ef; color:#141a26; box-sizing:border-box;
      font-family:'Noto Sans','Noto Sans CJK SC','Noto Sans Devanagari','Noto Sans Bengali','Noto Sans Arabic',system-ui,sans-serif;
      display:grid; grid-template-columns: 1fr 330px; }
    .l { padding:70px 70px 60px; display:flex; flex-direction:column; }
    .r { background:#16263f; position:relative; display:flex; align-items:center; justify-content:center; }
    h1 { font-family:${serif}; font-weight:600; font-size:74px; line-height:1.04; margin:34px 0 0; letter-spacing:-1.5px; }
    .tag { font-size:30px; color:#58606e; margin-top:24px; }
    .chips { display:flex; gap:14px; margin-top:auto; font-size:24px; font-weight:600; flex-wrap:wrap; }
    .chip { display:flex; align-items:center; gap:10px; padding:8px 16px; border:2px solid #e0dbcf; border-radius:8px; background:#fff; }
    .dot { width:12px; height:12px; border-radius:50%; }
    .brand { display:flex; align-items:center; gap:16px; font-family:'Fraunces'; font-weight:600; font-size:38px; }
    .brand b { color:#b08434; font-weight:600; }
    .mrz { position:absolute; bottom:28px; left:0; right:0; text-align:center; font-family:monospace; letter-spacing:4px; font-size:16px; color:#d1ad63; opacity:.7; }
  </style></head><body>
    <div class="l">
      <div class="brand"><div style="width:56px;height:56px">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div><span>Passport<b>Data</b></span></div>
      <h1>${ui.home.h1}</h1>
      <div class="tag">${ui.meta.tagline}</div>
      <div class="chips">
        <span class="chip"><span class="dot" style="background:#059669"></span>${ui.status.visa_free}</span>
        <span class="chip"><span class="dot" style="background:#0ea5e9"></span>${ui.status.eta}</span>
        <span class="chip"><span class="dot" style="background:#f59e0b"></span>${ui.status.e_visa}</span>
        <span class="chip"><span class="dot" style="background:#e11d48"></span>${ui.status.visa_required}</span>
      </div>
    </div>
    <div class="r"><div style="width:200px;height:200px;background:#f6f4ef;border-radius:28px;padding:22px;box-sizing:border-box;box-shadow:0 20px 50px rgba(0,0,0,.35)">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div><div class="mrz">P&lt;&lt;199&lt;&lt;198&lt;&lt;15</div></div>
  </body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(ROOT, `public/og/${lang.code}.png`) });
  console.log(`✓ og/${lang.code}.png`);
}
await browser.close();
