#!/usr/bin/env node
import { readFileSync, writeFileSync, renameSync, existsSync, readdirSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

// Load .env if present (local dev only — CI uses GITHUB_TOKEN env var)
const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['\"]|['\"]$/g, '');
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const APPS_DIR = join(ROOT, 'apps');
const STATS_PATH = join(ROOT, 'stats', 'stats.json');

async function fetchRepoStats(repo, token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'sloppy-seconds-stats',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const repoRes = await fetch(`https://api.github.com/repos/${repo}`, { headers });
  if (!repoRes.ok) {
    const body = await repoRes.json().catch(() => ({}));
    throw new Error(`HTTP ${repoRes.status} for ${repo}: ${body.message ?? ''}`);
  }
  const payload = await repoRes.json();

  let release = null;
  try {
    const relRes = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers });
    if (relRes.ok) release = await relRes.json();
  } catch {}

  return {
    stars: payload.stargazers_count ?? 0,
    forks: payload.forks_count ?? 0,
    open_issues: payload.open_issues_count ?? 0,
    pushed_at: payload.pushed_at ?? '',
    archived: payload.archived ?? false,
    license: payload.license?.spdx_id && payload.license.spdx_id !== 'NOASSERTION' ? payload.license.spdx_id : null,
    language: payload.language ?? null,
    default_branch: payload.default_branch ?? 'main',
    latest_release: release?.tag_name ?? null,
    fetched_at: new Date().toISOString(),
  };
}

function loadExisting() {
  if (!existsSync(STATS_PATH)) return { generated_at: '', entries: {} };
  return JSON.parse(readFileSync(STATS_PATH, 'utf-8'));
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitIdx = args.findIndex(a => a.startsWith('--limit='));
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx].split('=')[1], 10) : Infinity;
  const token = process.env.GITHUB_TOKEN || '';
  const CONCURRENCY = 4;

  // Collect repos from apps/*.md
  const files = readdirSync(APPS_DIR).filter(f => f.endsWith('.md'));
  const entries = [];
  for (const f of files) {
    const raw = readFileSync(join(APPS_DIR, f), 'utf-8');
    const { data } = matter(raw);
    if (data.repo) entries.push({ slug: data.slug || f.replace('.md',''), repo: data.repo.replace('https://github.com/', '') });
  }

  const toFetch = entries.slice(0, limit);
  console.log(`Refreshing stats for ${toFetch.length}/${entries.length} repos${dryRun ? ' (dry-run)' : ''}\n`);

  const existing = loadExisting();
  const results = { ...existing.entries };
  let fresh = 0, stale = 0, failed = 0;

  // Process in batches of CONCURRENCY
  for (let i = 0; i < toFetch.length; i += CONCURRENCY) {
    const batch = toFetch.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      batch.map(async ({ slug, repo }) => {
        try {
          const stats = await fetchRepoStats(repo, token);
          results[slug] = stats;
          fresh++;
          console.log(`  ✓ ${slug} (${stats.stars}★)`);
        } catch (e) {
          // Keep old stats, mark stale
          if (results[slug]) {
            results[slug] = { ...results[slug], stale: true };
          } else {
            results[slug] = {
              stars: 0, forks: 0, open_issues: 0, pushed_at: '',
              archived: false, license: null, language: null,
              default_branch: 'main', latest_release: null,
              fetched_at: new Date().toISOString(), stale: true,
            };
          }
          stale++;
          failed++;
          console.error(`  ✗ ${slug}: ${e.message}`);
        }
      })
    );
  }

  const output = {
    generated_at: new Date().toISOString(),
    entries: results,
  };

  if (dryRun) {
    console.log('\n--- Dry run output ---');
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  // Atomic write
  if (!existsSync(join(ROOT, 'stats'))) mkdirSync(join(ROOT, 'stats'), { recursive: true });
  const tmpPath = `${STATS_PATH}.tmp`;
  writeFileSync(tmpPath, JSON.stringify(output, null, 2), 'utf-8');
  renameSync(tmpPath, STATS_PATH);

  console.log(`\nDone: ${toFetch.length} repos, ${fresh} fresh, ${stale} stale, ${failed} failed.`);
  console.log(`Written to ${STATS_PATH}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
