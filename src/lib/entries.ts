import { getCollection } from 'astro:content';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { EntryWithStats } from './types';
import type { StatsFile } from './stats';

export async function loadEntries(): Promise<EntryWithStats[]> {
  const entries = await getCollection('apps');
  const statsPath = join(process.cwd(), 'stats', 'stats.json');
  let statsFile: StatsFile;
  if (existsSync(statsPath)) {
    try {
      statsFile = JSON.parse(readFileSync(statsPath, 'utf-8'));
    } catch {
      statsFile = { generated_at: '', entries: {} };
    }
  } else {
    statsFile = { generated_at: '', entries: {} };
  }

  return entries.map((entry) => ({
    ...entry.data,
    // `rendered` and `body` live on the entry object, not in entry.data
    rendered: (entry as any).rendered,
    body: (entry as any).body,
    stats: statsFile.entries[entry.data.slug],
  }));
}

export function categoryCounts(entries: EntryWithStats[]): { category: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const e of entries) {
    counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);
}

export function modelledOnGroups(entries: EntryWithStats[]): { modelled_on: string; entries: EntryWithStats[] }[] {
  const groups = new Map<string, EntryWithStats[]>();
  for (const e of entries) {
    const list = groups.get(e.modelled_on) ?? [];
    list.push(e);
    groups.set(e.modelled_on, list);
  }
  return Array.from(groups.entries()).map(([modelled_on, entries]) => ({ modelled_on, entries }));
}

export function totalStars(entries: EntryWithStats[]): number {
  return entries.reduce((sum, e) => sum + (e.stats?.stars ?? 0), 0);
}

// Serialize entries for client-side use (overlay detail view).
// Only includes fields the overlay renders — keeps the JSON small.
export type ClientEntry = {
  slug: string;
  name: string;
  modelled_on: string;
  category: string;
  vendor: string;
  repo: string;
  license: string | null;
  language: string | null;
  type: string;
  ai_assisted: string;
  cleanroom_claim: string;
  inputs_claimed: string[];
  claim_source?: string;
  description: string;
  body: string;
  stars: number | null;
  forks: number | null;
  fetched_at: string | null;
};

export function toClientEntries(entries: EntryWithStats[]): Record<string, ClientEntry> {
  const out: Record<string, ClientEntry> = {};
  for (const e of entries) {
    out[e.slug] = {
      slug: e.slug,
      name: e.name,
      modelled_on: e.modelled_on,
      category: e.category,
      vendor: e.vendor,
      repo: e.repo,
      license: e.license,
      language: e.language,
      type: e.type,
      ai_assisted: e.ai_assisted,
      cleanroom_claim: e.cleanroom_claim,
      inputs_claimed: e.inputs_claimed,
      claim_source: e.claim_source,
      description: e.description,
      body: e.rendered?.html ?? '',
      stars: e.stats?.stars ?? null,
      forks: e.stats?.forks ?? null,
      fetched_at: e.stats?.fetched_at ?? null,
    };
  }
  return out;
}
