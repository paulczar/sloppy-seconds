import type { Entry } from './schema';
import type { RepoStats } from './stats';

// Astro content collections (glob loader) attach at runtime:
//   body     — raw markdown source (string)
//   rendered — { html: string, metadata: ... }  (rendered HTML)
export type EntryWithStats = Entry & {
  stats?: RepoStats;
  body?: string;
  rendered?: { html?: string; [k: string]: unknown };
};
