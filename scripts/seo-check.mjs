#!/usr/bin/env node
/**
 * Build-time SEO guard: scans every route file for canonical / og:url
 * mismatches and off-domain URLs. Fails the build when they disagree.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const CANONICAL_ORIGIN = "https://www.ojexoilandgasservices.com";
const ROUTES_DIR = "src/routes";

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const p = join(dir, entry);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = walk(ROUTES_DIR).filter((f) => /\.tsx?$/.test(f));
const errors = [];
const warnings = [];

for (const file of files) {
  const src = readFileSync(file, "utf8");
  if (!src.includes("head:")) continue;

  const ogUrl = src.match(/["']og:url["']\s*,\s*content:\s*([`"'][^`"']*[`"'])/)?.[1];
  const canonical = src.match(/rel:\s*["']canonical["']\s*,\s*href:\s*([`"'][^`"']*[`"'])/)?.[1];

  const norm = (v) => v?.slice(1, -1).replace(/\/$/, "");

  if (!ogUrl && !canonical) {
    warnings.push(`${file}: no canonical or og:url declared`);
    continue;
  }
  if (!ogUrl) errors.push(`${file}: canonical present but og:url missing`);
  if (!canonical) errors.push(`${file}: og:url present but canonical missing`);

  if (ogUrl && canonical && norm(ogUrl) !== norm(canonical)) {
    errors.push(`${file}: canonical (${canonical}) does not match og:url (${ogUrl})`);
  }

  for (const [label, value] of [
    ["og:url", ogUrl],
    ["canonical", canonical],
  ]) {
    if (value && !value.slice(1, -1).startsWith(CANONICAL_ORIGIN)) {
      errors.push(`${file}: ${label} must start with ${CANONICAL_ORIGIN} (got ${value})`);
    }
  }
}

for (const w of warnings) console.warn(`[seo-check] warn  ${w}`);
for (const e of errors) console.error(`[seo-check] ERROR ${e}`);

if (errors.length) {
  console.error(`\n[seo-check] Failed with ${errors.length} canonical/og:url issue(s).`);
  process.exit(1);
}
console.log(`[seo-check] OK — ${files.length} route files scanned, no canonical/og:url mismatches.`);
