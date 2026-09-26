#!/usr/bin/env node
/**
 * Fetches the open Passport Index dataset (MIT) and regenerates:
 *   - src/data/visa.json       199×198 visa requirement matrix
 *   - src/data/countries.json  country metadata (names + URL slugs in every site language)
 *
 * Usage: node scripts/update-data.mjs            (download fresh data)
 *        node scripts/update-data.mjs --offline  (rebuild countries.json from the existing visa.json)
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'src/data');
const LANGUAGES = JSON.parse(await readFile(path.join(ROOT, 'src/i18n/languages.json'), 'utf8'));

const SOURCES = [
  {
    name: 'Passport Index Data (imorte/passport-index-data)',
    url: 'https://github.com/imorte/passport-index-data',
    json: 'https://raw.githubusercontent.com/imorte/passport-index-data/main/passport-index.json',
    readme: 'https://raw.githubusercontent.com/imorte/passport-index-data/main/README.md',
  },
  {
    name: 'Passport Index Dataset (ilyankou/passport-index-dataset)',
    url: 'https://github.com/ilyankou/passport-index-dataset',
    csv: 'https://raw.githubusercontent.com/ilyankou/passport-index-dataset/master/passport-index-tidy-iso2.csv',
    readme: 'https://raw.githubusercontent.com/ilyankou/passport-index-dataset/master/README.md',
  },
];

const STATUS_MAP = {
  'visa free': 'visa_free',
  'visa on arrival': 'visa_on_arrival',
  eta: 'eta',
  'e-visa': 'e_visa',
  'visa required': 'visa_required',
  'no admission': 'no_admission',
};

const CONTINENTS = {
  EU: 'AD AL AT BA BE BG BY CH CY CZ DE DK EE ES FI FR GB GR HR HU IE IS IT LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SK SM TR UA VA XK',
  AS: 'AE AF AM AZ BD BH BN BT CN GE HK ID IL IN IQ IR JO JP KG KH KP KR KW KZ LA LB LK MM MN MO MV MY NP OM PH PK PS QA SA SG SY TH TJ TL TM TW UZ VN YE',
  AF: 'AO BF BI BJ BW CD CF CG CI CM CV DJ DZ EG ER ET GA GH GM GN GQ GW KE KM LR LS LY MA MG ML MR MU MW MZ NA NE NG RW SC SD SL SN SO SS ST SZ TD TG TN TZ UG ZA ZM ZW',
  NA: 'AG BB BS BZ CA CR CU DM DO GD GT HN HT JM KN LC MX NI PA SV TT US VC',
  SA: 'AR BO BR CL CO EC GY PE PY SR UY VE',
  OC: 'AU FJ FM KI MH NR NZ PG PW SB TO TV VU WS',
};
const CONTINENT_OF = Object.fromEntries(
  Object.entries(CONTINENTS).flatMap(([c, codes]) => codes.split(' ').map((code) => [code, c])),
);

// CLDR long names that read badly in titles; the short CLDR form is used instead.
const USE_SHORT_NAME = new Set(['HK', 'MO', 'PS']);
const EN_NAME_OVERRIDES = {
  CD: 'DR Congo',
  CG: 'Republic of the Congo',
  MM: 'Myanmar',
  KN: 'Saint Kitts and Nevis',
  LC: 'Saint Lucia',
  VC: 'Saint Vincent and the Grenadines',
  ST: 'São Tomé and Príncipe',
  MO: 'Macau',
};
const EN_SLUG_OVERRIDES = { TR: 'turkey', CI: 'ivory-coast' };

const CHAR_MAP = { ı: 'i', ß: 'ss', đ: 'd', ð: 'd', ø: 'o', æ: 'ae', œ: 'oe', ł: 'l', þ: 'th' };

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[ıßđðøæœłþ]/g, (c) => CHAR_MAP[c])
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’`]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'passportdata-updater' } });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.text();
}

function parseReadmeDate(readme) {
  const m = readme.match(/(?:last updated|updated on)[:*\s]*\**\s*(\d{1,2} [A-Z][a-z]+ \d{4})/i);
  if (!m) return null;
  const d = new Date(`${m[1]} UTC`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

async function loadSource(src) {
  const matrix = {};
  if (src.json) {
    const raw = JSON.parse(await fetchText(src.json));
    for (const [from, dests] of Object.entries(raw)) {
      const o = (matrix[from.toUpperCase()] = {});
      for (const [to, v] of Object.entries(dests)) {
        if (from.toUpperCase() === to.toUpperCase()) continue;
        const status = STATUS_MAP[String(v.status).toLowerCase()];
        if (!status) throw new Error(`Unknown status "${v.status}" for ${from}->${to}`);
        o[to.toUpperCase()] = v.days ? [status, Number(v.days)] : [status];
      }
    }
  } else {
    const lines = (await fetchText(src.csv)).trim().split('\n').slice(1);
    for (const line of lines) {
      const [from, to, reqRaw] = line.split(',').map((s) => s.trim());
      if (!from || !to || from === to) continue;
      const req = reqRaw.toLowerCase();
      if (req === '-1') continue;
      const o = (matrix[from] ??= {});
      if (/^\d+$/.test(req)) o[to] = ['visa_free', Number(req)];
      else {
        const status = STATUS_MAP[req];
        if (!status) throw new Error(`Unknown requirement "${reqRaw}" for ${from}->${to}`);
        o[to] = [status];
      }
    }
  }
  let updated = null;
  try {
    updated = parseReadmeDate(await fetchText(src.readme));
  } catch {}
  return { matrix, updated };
}

function validate(matrix) {
  const passports = Object.keys(matrix);
  if (passports.length < 190) throw new Error(`Only ${passports.length} passports – refusing to overwrite data`);
  for (const p of passports) {
    const n = Object.keys(matrix[p]).length;
    if (n < 180) throw new Error(`${p} has only ${n} destinations – refusing to overwrite data`);
  }
  const unmapped = passports.filter((c) => !CONTINENT_OF[c]);
  if (unmapped.length) throw new Error(`No continent for: ${unmapped.join(', ')}`);
}

function sortObject(obj) {
  return Object.fromEntries(Object.keys(obj).sort().map((k) => [k, obj[k]]));
}

function buildCountries(codes) {
  const countries = {};
  for (const code of codes) countries[code] = { continent: CONTINENT_OF[code], names: {}, slugs: {} };

  for (const { code: lang, latinSlugs } of LANGUAGES) {
    const long = new Intl.DisplayNames([lang], { type: 'region' });
    const short = new Intl.DisplayNames([lang], { type: 'region', style: 'short' });
    const used = new Map();
    for (const code of codes) {
      let name = (USE_SHORT_NAME.has(code) ? short : long).of(code) ?? code;
      if (lang === 'en') name = EN_NAME_OVERRIDES[code] ?? name.replace(/ & /g, ' and ').replace(/^St\. /, 'Saint ');
      name = name.replace(/’/g, "'");
      countries[code].names[lang] = name;
    }
    for (const code of codes) {
      let slug =
        lang === 'en'
          ? EN_SLUG_OVERRIDES[code] ?? slugify(countries[code].names.en)
          : latinSlugs
            ? slugify(countries[code].names[lang])
            : countries[code].slugs.en;
      if (!slug) slug = countries[code].slugs.en;
      if (used.has(slug)) slug = `${slug}-${code.toLowerCase()}`;
      used.set(slug, code);
      countries[code].slugs[lang] = slug;
    }
  }
  return countries;
}

async function main() {
  const offline = process.argv.includes('--offline');
  const visaFile = path.join(DATA_DIR, 'visa.json');
  let visa;

  if (offline) {
    visa = JSON.parse(await readFile(visaFile, 'utf8'));
  } else {
    let lastError;
    for (const src of SOURCES) {
      try {
        console.log(`Fetching ${src.name}…`);
        const { matrix, updated } = await loadSource(src);
        validate(matrix);
        visa = {
          updated: updated ?? new Date().toISOString().slice(0, 10),
          fetched: new Date().toISOString().slice(0, 10),
          source: { name: src.name, url: src.url, license: 'MIT', origin: 'https://www.passportindex.org' },
          matrix: sortObject(Object.fromEntries(Object.entries(matrix).map(([k, v]) => [k, sortObject(v)]))),
        };
        break;
      } catch (err) {
        lastError = err;
        console.warn(`  ✗ ${err.message}`);
      }
    }
    if (!visa) throw lastError;

    // Keep the committed file untouched when only the fetch date would change.
    try {
      const prev = JSON.parse(await readFile(visaFile, 'utf8'));
      if (JSON.stringify(prev.matrix) === JSON.stringify(visa.matrix) && prev.updated === visa.updated) {
        console.log('✓ Visa data unchanged');
        visa = prev;
      }
    } catch {}
    await writeFile(visaFile, JSON.stringify(visa) + '\n');
    console.log(`✓ visa.json: ${Object.keys(visa.matrix).length} passports, data date ${visa.updated}`);
  }

  const countries = buildCountries(Object.keys(visa.matrix).sort());
  await writeFile(path.join(DATA_DIR, 'countries.json'), JSON.stringify(countries, null, 1) + '\n');
  console.log(`✓ countries.json: ${Object.keys(countries).length} countries × ${LANGUAGES.length} languages`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
