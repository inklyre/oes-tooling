import type { Source, Status } from "./common.js";
import type { ExactlyOne } from "./util.js";

/** A pool's candidate question — same reference shape as a direct entry, minus `points`/`title`. */
export type OpfPoolCandidate = { id: string; content_hash?: string } & ExactlyOne<{
  path: string;
  question_url: string;
}>;

interface OpfQuestionEntryBase {
  id: string;
  title?: string;
  points?: number;
  content_hash?: string;
}

/** A direct reference to one question. */
export type OpfDirectQuestionEntry = OpfQuestionEntryBase & ExactlyOne<{ path: string; question_url: string }>;

/**
 * A pool: at attempt-assembly time, a consumer randomly picks `select`
 * questions from `from` in place of this one entry.
 */
export interface OpfPoolQuestionEntry {
  id: string;
  points?: number;
  /** MUST be <= `from.length` — not enforceable by schema alone, see `@inklyre/oes-core`'s lint tooling. */
  select: number;
  from: OpfPoolCandidate[];
  shuffle?: boolean;
}

export type OpfQuestionEntry = OpfDirectQuestionEntry | OpfPoolQuestionEntry;

export function isOpfPoolEntry(entry: OpfQuestionEntry): entry is OpfPoolQuestionEntry {
  return "select" in entry && "from" in entry;
}

/** `set.json` — an ordered collection of question references plus set-level metadata (OPF v0.2.0). */
export interface OpfSet {
  opf_version: string;
  id: string;
  title: string;
  description?: string;
  authors?: string[];
  license?: string;
  status?: Status;
  tags?: string[];
  language?: string;
  source?: Source;
  questions: OpfQuestionEntry[];
}
