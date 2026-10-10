import { writeFileSync, renameSync } from 'fs';

export type RepoStats = {
  stars: number;
  forks: number;
  open_issues: number;
  pushed_at: string;
  archived: boolean;
  license: string | null;
  language: string | null;
  default_branch: string;
  latest_release: string | null;
  fetched_at: string;
  stale?: boolean;
};

export type StatsFile = {
  generated_at: string;
  entries: Record<string, RepoStats>;
};

export function toRepoStats(
  payload: any,
  release: any,
  fetchedAt: string
): RepoStats {
  return {
    stars: payload?.stargazers_count ?? 0,
    forks: payload?.forks_count ?? 0,
    open_issues: payload?.open_issues_count ?? 0,
    pushed_at: payload?.pushed_at ?? '',
    archived: payload?.archived ?? false,
    license: payload?.license?.spdx_id && payload.license.spdx_id !== 'NOASSERTION'
      ? payload.license.spdx_id
      : null,
    language: payload?.language ?? null,
    default_branch: payload?.default_branch ?? 'main',
    latest_release: release?.tag_name ?? null,
    fetched_at: fetchedAt,
  };
}

export function writeStatsAtomic(path: string, data: StatsFile): void {
  const tmpPath = `${path}.tmp`;
  // This will throw if serialization fails, before we touch the real file
  const json = JSON.stringify(data, null, 2);
  writeFileSync(tmpPath, json, 'utf-8');
  renameSync(tmpPath, path);
}

export async function fetchRepoStats(
  repo: string,
  token?: string
): Promise<RepoStats> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'sloppy-seconds-stats',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const repoRes = await fetch(`https://api.github.com/repos/${repo}`, { headers });
  if (!repoRes.ok) {
    const body = await repoRes.json().catch(() => ({}));
    if (repoRes.status === 403) {
      throw new Error(`Rate limit exceeded for ${repo}: ${body.message ?? '403'}`);
    }
    throw new Error(`Failed to fetch ${repo}: HTTP ${repoRes.status} — ${body.message ?? ''}`);
  }
  const payload = await repoRes.json();

  let release: any = null;
  try {
    const relRes = await fetch(
      `https://api.github.com/repos/${repo}/releases/latest`,
      { headers }
    );
    if (relRes.ok) {
      release = await relRes.json();
    }
  } catch {
    // 404 or network error on releases is fine — no latest release
  }

  return toRepoStats(payload, release, new Date().toISOString());
}