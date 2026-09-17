import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import Fuse from 'fuse.js';

// ─── Module-scoped singletons ────────────────────────────────────────────────
let hsIndex = null;       // Map<string, { hs2017: string, hs2022Codes: string[], isDeprecated: boolean }>
let hsPrefixes = null;    // Set<string> for hierarchical prefix validation
let vagueTermsFuse = null; // Fuse instance
let loadTimestamp = null;
let hsRecordCount = 0;
let vagueTermsCount = 0;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function normalizeHsCode(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const cleaned = raw.trim().replace(/^ex\s*/i, '').replace(/[\s.]/g, '');
  if (!/^\d{4,6}$/.test(cleaned)) return null;
  return cleaned;
}

function formatHsCode(code) {
  const clean = code.replace(/[\s.]/g, '').replace(/^ex\s*/i, '');
  if (clean.length === 6) return `${clean.slice(0, 4)}.${clean.slice(4)}`;
  if (clean.length === 4) return clean;
  return code.trim();
}

// ─── Index Builders ──────────────────────────────────────────────────────────
function buildHsIndex() {
  const csvPath = path.join(process.cwd(), 'public', 'data', 'wco_correlation.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  const { data } = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
  const index = new Map();
  const prefixes = new Set();

  for (const row of data) {
    const raw2017 = row['V2017'];
    const raw2022 = row['V2022'];

    const normalized2017 = normalizeHsCode(raw2017);
    if (!normalized2017) continue;

    // Build hierarchical prefixes
    prefixes.add(normalized2017.slice(0, 2));
    if (normalized2017.length >= 4) prefixes.add(normalized2017.slice(0, 4));
    prefixes.add(normalized2017);

    const codes2022 = [];
    if (raw2022) {
      const lines = raw2022.split(/\n|\r\n?/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (/^[a-zA-Z]{3,}/.test(trimmed) && !/^ex\s*\d/i.test(trimmed)) continue;
        const formatted = formatHsCode(trimmed);
        if (formatted) {
          codes2022.push(formatted);
          const cleanC = formatted.replace(/[\s.]/g, '');
          if (cleanC.length >= 2) prefixes.add(cleanC.slice(0, 2));
          if (cleanC.length >= 4) prefixes.add(cleanC.slice(0, 4));
          prefixes.add(cleanC);
        }
      }
    }

    const formatted2017 = formatHsCode(raw2017);
    const isDeprecated = codes2022.length > 0 && !codes2022.some(c => c.replace(/[\s.]/g, '') === normalized2017);

    if (index.has(normalized2017)) {
      const existing = index.get(normalized2017);
      for (const c of codes2022) {
        if (!existing.hs2022Codes.includes(c)) existing.hs2022Codes.push(c);
      }
      existing.isDeprecated = existing.isDeprecated || isDeprecated;
    } else {
      index.set(normalized2017, { hs2017: formatted2017, hs2022Codes: codes2022, isDeprecated });
    }
  }

  return { index, prefixes };
}

function buildVagueTermsIndex() {
  const csvPath = path.join(process.cwd(), 'public', 'data', 'vague_terms.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  const { data } = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
  const termsList = [];
  const uniqueTerms = new Set();

  for (const row of data) {
    const unacceptable = (row['Unacceptable'] || '').trim();
    const acceptable = (row['Acceptable'] || '').trim();

    if (!unacceptable) continue;
    const suggestion = acceptable || '(See other specific examples in the table)';
    
    if (!uniqueTerms.has(unacceptable.toLowerCase())) {
      uniqueTerms.add(unacceptable.toLowerCase());
      termsList.push({ term: unacceptable, suggestion });
    }

    const parts = unacceptable.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      for (const part of parts) {
        if (part.length > 1 && !uniqueTerms.has(part.toLowerCase())) {
          uniqueTerms.add(part.toLowerCase());
          termsList.push({ term: part, suggestion });
        }
      }
    }
  }

  // Create fuse.js index with strict threshold
  const fuse = new Fuse(termsList, {
    keys: ['term'],
    includeScore: true,
    threshold: 0.15, // Low threshold to avoid false positives (like cat matching car)
    ignoreLocation: true,
    minMatchCharLength: 3
  });

  return { fuse, count: termsList.length };
}

// ─── Public API ──────────────────────────────────────────────────────────────
export function ensureLoaded() {
  if (hsIndex && vagueTermsFuse) return;
  const hsRes = buildHsIndex();
  hsIndex = hsRes.index;
  hsPrefixes = hsRes.prefixes;
  const vtRes = buildVagueTermsIndex();
  vagueTermsFuse = vtRes.fuse;
  vagueTermsCount = vtRes.count;
  loadTimestamp = new Date().toISOString();
  hsRecordCount = hsIndex.size;
}

export function lookupHsCode(rawCode) {
  ensureLoaded();
  const normalized = normalizeHsCode(rawCode);
  if (!normalized) {
    return { found: false, error: 'Invalid HS code format. Expected 4-6 digits.' };
  }

  const chapter = normalized.slice(0, 2);
  const heading = normalized.length >= 4 ? normalized.slice(0, 4) : null;

  // Hierarchical Prefix Validation
  if (!hsPrefixes.has(chapter) || (heading && !hsPrefixes.has(heading))) {
    return {
      found: false,
      error: `INVALID: HS Code prefix '${heading || chapter}' is completely unrecognized in the WCO dataset.`
    };
  }

  const entry = hsIndex.get(normalized);
  if (!entry) {
    return {
      found: true,
      status: 'compliant',
      hsCode: formatHsCode(rawCode),
      hs2022Codes: [formatHsCode(rawCode)],
      isDeprecated: false,
      message: 'COMPLIANT: HS Code validated (Not affected by 2017->2022 transition).',
    };
  }

  if (entry.isDeprecated) {
    return {
      found: true,
      status: 'deprecated',
      hsCode: entry.hs2017,
      hs2022Codes: entry.hs2022Codes,
      isDeprecated: true,
      message: `DEPRECATED: Code obsolete under HS 2022. Replace ${entry.hs2017} with: ${entry.hs2022Codes.join(', ')}`,
    };
  }

  return {
    found: true,
    status: 'compliant',
    hsCode: entry.hs2017,
    hs2022Codes: entry.hs2022Codes,
    isDeprecated: false,
    message: 'COMPLIANT: HS Code validated for current shipping cycles.',
  };
}

export function scanDescription(description) {
  ensureLoaded();

  if (!description || typeof description !== 'string' || !description.trim()) {
    return { valid: false, flaggedTerms: [], error: 'Description is required.' };
  }

  const input = description.trim();
  // Tokenize input into words
  const words = input.split(/[\s,.;:!?()-]+/).filter(w => w.length > 2);
  const ngrams = new Set();

  // Create 1-grams, 2-grams, 3-grams
  for (let i = 0; i < words.length; i++) {
    ngrams.add(words[i]);
    if (i < words.length - 1) ngrams.add(words[i] + ' ' + words[i+1]);
    if (i < words.length - 2) ngrams.add(words[i] + ' ' + words[i+1] + ' ' + words[i+2]);
  }

  const flaggedTerms = [];
  const alreadyFlaggedDictTerms = new Set();

  for (const gram of ngrams) {
    const results = vagueTermsFuse.search(gram);
    if (results.length > 0) {
      const best = results[0];
      // Match must have a good score, and the length of the string must be similar (within 3 chars)
      // This prevents short words like 'and' matching long words like 'Handcraft'
      if (best.score <= 0.15 && Math.abs(best.item.term.length - gram.length) <= 3 && !alreadyFlaggedDictTerms.has(best.item.term)) {
        alreadyFlaggedDictTerms.add(best.item.term);
        flaggedTerms.push({
          term: gram, // Use the user's string so frontend can highlight it exactly
          suggestion: `(Matched "${best.item.term}") ${best.item.suggestion}`,
        });
      }
    }
  }

  return {
    valid: flaggedTerms.length === 0,
    flaggedTerms,
  };
}

export function getDataSourceInfo() {
  ensureLoaded();
  return {
    loadTimestamp,
    hsIndex: {
      recordCount: hsRecordCount,
      source: 'WCO 2017 2022 Correlation.csv',
    },
    vagueTerms: {
      recordCount: vagueTermsCount,
      source: 'acceptable_unacceptable_goods_annex.csv',
    },
    eoriEndpoint: 'https://ec.europa.eu/taxation_customs/dds2/eos/validation/services/validation',
    eoriWsdl: 'https://ec.europa.eu/taxation_customs/dds2/eos/validation/services/validation?wsdl',
  };
}
