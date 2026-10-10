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
