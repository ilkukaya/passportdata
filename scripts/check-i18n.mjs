#!/usr/bin/env node
/**
 * Verifies that every UI dictionary has exactly the keys, array lengths and {placeholders} of en.ts.
 * Run: node --experimental-strip-types scripts/check-i18n.mjs
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const languages = JSON.parse(await readFile(path.join(ROOT, 'src/i18n/languages.json'), 'utf8'));
const load = async (code) => (await import(pathToFileURL(path.join(ROOT, `src/i18n/ui/${code}.ts`)).href)).default;
const placeholders = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

function compare(base, other, where, errors) {
  if (typeof base === 'string') {
    if (typeof other !== 'string' || !other.trim()) errors.push(`${where}: missing or empty`);
    else if (placeholders(base) !== placeholders(other)) errors.push(`${where}: placeholders {${placeholders(other)}} ≠ {${placeholders(base)}}`);
    return;
  }
  if (Array.isArray(base)) {
    if (!Array.isArray(other) || other.length !== base.length) return errors.push(`${where}: array length mismatch`);
    base.forEach((b, i) => compare(b, other[i], `${where}[${i}]`, errors));
    return;
  }
  for (const k of Object.keys(base)) compare(base[k], other?.[k], where ? `${where}.${k}` : k, errors);
  for (const k of Object.keys(other ?? {})) if (!(k in base)) errors.push(`${where}.${k}: unknown key`);
}

const en = await load('en');
let failed = false;
for (const { code } of languages.filter((l) => l.code !== 'en')) {
  const errors = [];
  try {
    compare(en, await load(code), '', errors);
  } catch (e) {
    errors.push(`cannot load: ${e.message}`);
  }
  console.log(errors.length ? `✗ ${code}\n  ${errors.join('\n  ')}` : `✓ ${code}`);
  failed ||= errors.length > 0;
}
process.exit(failed ? 1 : 0);
