import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";

/** The result of fetching one JSON document: its parsed content, the exact raw text fetched (for `content_hash` verification), plus a source re-rooted at its own directory for resolving any further relative references it contains. */
export interface FetchedDocument {
  data: unknown;
  raw: string;
  source: ContentSource;
}

/**
 * An abstraction over "where OES content lives," so {@link resolveCourse}/
 * {@link resolveSet}/etc. work identically whether content is read from
 * the local filesystem (a CLI, the desktop Studio app) or fetched over
 * HTTP (a browser LMS, the playground) — the resolver itself never touches
 * `fs` or `fetch` directly.
 */
export interface ContentSource {
  /**
   * Fetch and parse the JSON document at `location` — either a path
   * relative to this source's own root, or an absolute `http(s)://` URL
   * (crossing to an external source, same as every other `*_url` field in
   * OES). Returns a new source rooted at that document's own directory.
   */
  fetch(location: string): Promise<FetchedDocument>;
  /** A human-readable identifier for error messages. */
  readonly label: string;
}

function isUrl(location: string): boolean {
  return /^https?:\/\//i.test(location);
}

async function fetchUrlJson(url: string): Promise<FetchedDocument> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch (cause) {
    throw new Error(`Failed to fetch ${url}`, { cause });
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const raw = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (cause) {
    throw new Error(`Failed to parse ${url} as JSON`, { cause });
  }
  return { data, raw, source: new FetchContentSource(new URL(".", url).toString()) };
}

class FetchContentSource implements ContentSource {
  constructor(private readonly baseUrl: string) {}

  get label(): string {
    return this.baseUrl;
  }

  fetch(location: string): Promise<FetchedDocument> {
    const url = isUrl(location) ? location : new URL(location, this.baseUrl).toString();
    return fetchUrlJson(url);
  }
}

class NodeFsContentSource implements ContentSource {
  constructor(private readonly dir: string) {}

  get label(): string {
    return this.dir;
  }

  async fetch(location: string): Promise<FetchedDocument> {
    if (isUrl(location)) return fetchUrlJson(location);
    const fullPath = join(this.dir, location);
    let raw: string;
    try {
      raw = await readFile(fullPath, "utf8");
    } catch (cause) {
      throw new Error(`Failed to read ${fullPath}`, { cause });
    }
    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch (cause) {
      throw new Error(`Failed to parse ${fullPath} as JSON`, { cause });
    }
    return { data, raw, source: new NodeFsContentSource(dirname(fullPath)) };
  }
}

/** A {@link ContentSource} rooted at a local directory, for Node/CLI/desktop use. */
export function fsSource(dir: string): ContentSource {
  return new NodeFsContentSource(dir);
}

/** A {@link ContentSource} rooted at a base URL, for browser/`fetch`-based use. */
export function urlSource(baseUrl: string): ContentSource {
  return new FetchContentSource(baseUrl);
}
