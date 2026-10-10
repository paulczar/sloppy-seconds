#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const APPS_DIR = join(ROOT, 'apps');
const MANIFEST_PATH = join(__dirname, 'seed-manifest.json');

function kebabCase(s) {
  return s
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

const slugOverrides = new Map([
  ['subashraja5809-hue/open-claude-code', 'open-claude-code-v2'],
]);

function slugFromRepo(repo) {
  if (slugOverrides.has(repo)) return slugOverrides.get(repo);
  const name = repo.split('/').pop();
  return kebabCase(name);
}

async function fetchRepoInfo(repo, token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'sloppy-seconds-seed',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`https://api.github.com/repos/${repo}`, { headers });
  if (!res.ok) {
    console.error(`  ! ${repo}: HTTP ${res.status} — using manifest defaults`);
    return null;
  }
  return res.json();
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--write');
  const limitIdx = args.findIndex((a) => a.startsWith('--limit='));
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx].split('=')[1], 10) : Infinity;
  const token = process.env.GITHUB_TOKEN || '';

  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
  const entries = manifest.slice(0, limit);

  console.log(`Processing ${entries.length} entries${dryRun ? ' (dry-run)' : ' (writing)'}\n`);

  const slugs = new Set();
  const rows = [];

  for (const entry of entries) {
    const slug = slugFromRepo(entry.repo);
    if (slugs.has(slug)) {
      // auto-resolve by prefixing owner
      const owner = entry.repo.split('/')[0];
      const resolved = `${kebabCase(owner)}-${slug}`;
      if (slugs.has(resolved)) {
        console.error(`FATAL: duplicate slug "${resolved}" for ${entry.repo}`);
        process.exit(1);
      }
      slugs.add(resolved);
      // use resolved slug
      Object.defineProperty(entry, '_slug', { value: resolved });
    } else {
      slugs.add(slug);
    }

    const finalSlug = entry._slug || slug;

    let license = entry.license ?? null;
    let language = entry.language ?? null;
    let description = '';

    try {
      const info = await fetchRepoInfo(entry.repo, token);
      if (info) {
        if (info.description) description = info.description;
        if (info.license?.spdx_id && info.license.spdx_id !== 'NOASSERTION') {
          license = info.license.spdx_id;
        }
        if (info.language) language = info.language;
      }
    } catch (e) {
      console.error(`  ! ${entry.repo}: fetch error — ${e.message}`);
    }

    const name = entry.name || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    // Default to not-claimed unless the manifest provides a claim_source.
    // We don't audit or opine on legality (AGENTS.md rule 4).
    const claimSource = entry.claim_source || null;
    const cleanroomClaim = claimSource ? 'self-reported' : 'not-claimed';

    rows.push({ slug: finalSlug, name, modelled_on: entry.modelled_on, vendor: entry.vendor, category: entry.category, type: entry.type, ai_assisted: entry.ai_assisted, status: entry.status, license, language, description, cleanroomClaim, claimSource, repo: entry.repo });
  }

  // Print table
  console.table(rows.map((r) => ({
    slug: r.slug,
    modelled_on: r.modelled_on,
    vendor: r.vendor,
    category: r.category,
    type: r.type,
  })));

  if (dryRun) {
    console.log('\nDry run complete. Use --write to generate files.');
    return;
  }

  // Write files
  if (!existsSync(APPS_DIR)) mkdirSync(APPS_DIR, { recursive: true });

  for (const r of rows) {
    const platforms = ['web']; // default; can be refined later
    const inputsClaimed = r.type === 'cleanroom' ? ['public-specs', 'observed-behaviour'] : [];

    const fm = {
      slug: r.slug,
      name: r.name,
      modelled_on: r.modelled_on,
      category: r.category,
      vendor: r.vendor,
      repo: `https://github.com/${r.repo}`,
      license: r.license,
      language: r.language,
      platforms,
      type: r.type,
      ai_assisted: r.ai_assisted,
      cleanroom_claim: r.cleanroomClaim,
      inputs_claimed: inputsClaimed,
      ...(r.claimSource ? { claim_source: r.claimSource } : {}),
      status: r.status,
      added: new Date().toISOString().slice(0, 10),
      description: r.description || `${r.name} — open-source alternative to ${r.modelled_on}.`,
    };

    const yaml = Object.entries(fm)
      .map(([k, v]) => {
        if (v === null) return `${k}: null`;
        if (Array.isArray(v)) return `${k}: [${v.join(', ')}]`;
        if (typeof v === 'string' && (v.includes(':') || v.includes('#'))) return `${k}: "${v}"`;
        return `${k}: ${v}`;
      })
      .join('\n');

    const body = `\n## Notes\n\n- Repo: https://github.com/${r.repo}\n`;

    const filePath = join(APPS_DIR, `${r.slug}.md`);
    writeFileSync(filePath, `---\n${yaml}\n---${body}`);
    console.log(`  wrote ${filePath}`);
  }

  console.log(`\nDone. Wrote ${rows.length} entries.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
