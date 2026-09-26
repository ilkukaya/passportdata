#!/usr/bin/env node
/**
 * Submits every URL listed in the live sitemaps to IndexNow (Bing, Yandex, Seznam, Naver…).
 * Run after a deploy: node scripts/indexnow.mjs
 */
const key = (process.env.PUBLIC_INDEXNOW_KEY || '03dadaeb24b51e7d05988552784a5067').trim();
const site = (process.env.SITE_URL || 'https://passportdata.netlify.app').replace(/\/$/, '');

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'));
const get = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.text();
};

const keyFile = await fetch(`${site}/${key}.txt`);
if (!keyFile.ok) throw new Error(`Key file ${site}/${key}.txt is not reachable (HTTP ${keyFile.status})`);

const urls = [];
for (const sitemap of locs(await get(`${site}/sitemap-index.xml`))) urls.push(...locs(await get(sitemap)));
console.log(`${urls.length} URLs found`);

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
