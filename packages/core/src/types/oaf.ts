import type { Reference, RelatedItem, Source, Status } from "./common.js";

/** `article.json` — an individual written article (OAF v0.1.0). */
export interface OafArticle {
  oaf_version: string;
  id: string;
  title: string;
  description?: string;
  authors?: string[];
  license?: string;
  status?: Status;
  tags?: string[];
  language?: string;
  estimated_mins?: number;
  references?: Reference[];
  related?: RelatedItem[];
  source?: Source;
}
