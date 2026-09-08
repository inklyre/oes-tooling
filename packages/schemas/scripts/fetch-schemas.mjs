#!/usr/bin/env node
// Fetches the current schema JSON directly from the public spec repo
// (github.com/inklyre/oes) into vendor/, which src/index.ts then imports
// from exactly like a local file. This is what lets @inklyre/oes-schemas
// be built and published from this repo without oes needing any publish
// pipeline of its own — see this package's README.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SPEC_REPO_RAW = "https://raw.githubusercontent.com/inklyre/oes/main";
const VENDOR_ROOT = fileURLToPath(new URL("../vendor", import.meta.url));

// Kept in sync by hand with schemas/ in the spec repo — the same set of
// files src/index.ts imports by name.
const SCHEMA_PATHS = [
  "schemas/oaf/v0.1.0/article.schema.json",
  "schemas/ocf/v0.3.0/course.schema.json",
  "schemas/opf/v0.2.0/set.schema.json",
  "schemas/oqf/v0.1.0/question.schema.json",
  "schemas/oqf/v0.1.0/stimulus.schema.json",
  "schemas/orf/v0.1.0/resource.schema.json",
  "schemas/ovf/v0.1.0/video.schema.json",
];

async function fetchOne(relativePath) {
  const url = `${SPEC_REPO_RAW}/${relativePath}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const body = await res.text();
  JSON.parse(body); // fail fast on a truncated/non-JSON response rather than writing garbage
  const dest = join(VENDOR_ROOT, relativePath.replace(/^schemas\//, ""));
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, body, "utf8");
  return dest;
}

async function main() {
  const results = await Promise.all(SCHEMA_PATHS.map(fetchOne));
  for (const dest of results) console.log(`fetched: ${dest}`);
}

main().catch((cause) => {
  console.error(cause);
  process.exitCode = 1;
});
