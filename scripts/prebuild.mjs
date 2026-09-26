#!/usr/bin/env node
/** Writes environment-dependent static files (ads.txt, IndexNow key) into public/ before the build. */
import { writeFile, rm, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
const adsClient = (process.env.PUBLIC_ADSENSE_CLIENT || '').trim();
const indexNowKey = (process.env.PUBLIC_INDEXNOW_KEY || '').trim();

// ads.txt – required by AdSense. "ca-pub-123" → "pub-123".
const adsTxt = path.join(PUBLIC, 'ads.txt');
if (adsClient) {
  const pub = adsClient.replace(/^ca-/, '');
  await writeFile(adsTxt, `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`);
  console.log('✓ ads.txt written');
} else {
  await rm(adsTxt, { force: true });
}

// IndexNow key file (https://www.indexnow.org/documentation)
for (const f of await readdir(PUBLIC)) {
  if (/^[a-f0-9-]{8,128}\.txt$/i.test(f) && f !== `${indexNowKey}.txt`) await rm(path.join(PUBLIC, f));
}
if (indexNowKey) {
  if (!/^[a-zA-Z0-9-]{8,128}$/.test(indexNowKey)) throw new Error('PUBLIC_INDEXNOW_KEY must be 8-128 chars [a-zA-Z0-9-]');
  await writeFile(path.join(PUBLIC, `${indexNowKey}.txt`), indexNowKey);
  console.log('✓ IndexNow key file written');
}
