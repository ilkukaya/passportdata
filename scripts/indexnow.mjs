#!/usr/bin/env node
/**
 * Submits all URLs from the built sitemaps to IndexNow (Bing, Yandex, Seznam, Naver…).
 * Requires PUBLIC_INDEXNOW_KEY and SITE_URL. Run after a deploy: node scripts/indexnow.mjs
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const key = (process.env.PUBLIC_INDEXNOW_KEY || '').trim();
const site = (process.env.SITE_URL || '').replace(/\/$/, '');
if (!key || !site) {
  console.log('IndexNow skipped (PUBLIC_INDEXNOW_KEY or SITE_URL not set)');
  process.exit(0);
}

const dir = path.join(ROOT, 'dist/sitemaps');
const urls = [];
for (const f of (await readdir(dir)).filter((f) => f.endsWith('.xml'))) {
  const xml = await readFile(path.join(dir, f), 'utf8');
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.push(m[1].replace(/&amp;/g, '&'));
}
const host = new URL(site).host;
for (let i = 0; i < urls.length; i += 10_000) {
  const batch = urls.slice(i, i + 10_000);
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation: `${site}/${key}.txt`, urlList: batch }),
  });
  console.log(`IndexNow batch ${i / 10_000 + 1}: ${batch.length} URLs → HTTP ${res.status}`);
}
