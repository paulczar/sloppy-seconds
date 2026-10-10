import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

const APPS_DIR = join(process.cwd(), 'apps');
const MANIFEST_PATH = join(process.cwd(), 'scripts', 'seed-manifest.json');
const DECISIONS_PATH = join(process.cwd(), 'docs', 'decisions.md');

function loadManifest() {
  return JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8')) as Array<{
    repo: string;
    modelled_on: string;
    vendor: string;
    category: string;
    type: string;
    ai_assisted: string;
  }>;
}

describe('seed dataset', () => {
  const manifest = loadManifest();

  it('manifest is non-empty', () => {
    expect(manifest.length).toBeGreaterThan(0);
  });

  it('apps/ contains one file per manifest entry (by repo URL)', () => {
    const files = readdirSync(APPS_DIR).filter((f) => f.endsWith('.md'));
    const contents = files.map((f) => {
      const raw = readFileSync(join(APPS_DIR, f), 'utf-8');
      return { file: f, raw, frontmatter: matter(raw).data };
    });

    for (const entry of manifest) {
      const repoUrl = `https://github.com/${entry.repo}`;
      const match = contents.find((c) => c.frontmatter.repo === repoUrl);
      expect(match, `No app file found for repo ${repoUrl}`).toBeDefined();
    }
  });

  it('no duplicate slugs', () => {
    const files = readdirSync(APPS_DIR).filter((f) => f.endsWith('.md'));
    const slugs = files.map((f) => {
      const raw = readFileSync(join(APPS_DIR, f), 'utf-8');
      return matter(raw).data.slug as string;
    });
    const seen = new Set<string>();
    for (const s of slugs) {
      expect(seen.has(s), `Duplicate slug: ${s}`).toBe(false);
      seen.add(s);
    }
  });

  it('no duplicate repos', () => {
    const files = readdirSync(APPS_DIR).filter((f) => f.endsWith('.md'));
    const repos = files.map((f) => {
      const raw = readFileSync(join(APPS_DIR, f), 'utf-8');
      return matter(raw).data.repo as string;
    });
    const seen = new Set<string>();
    for (const r of repos) {
      expect(seen.has(r), `Duplicate repo: ${r}`).toBe(false);
      seen.add(r);
    }
  });

  it('docs/decisions.md mentions every manifest repo', () => {
    expect(existsSync(DECISIONS_PATH)).toBe(true);
    const decisions = readFileSync(DECISIONS_PATH, 'utf-8');
    for (const entry of manifest) {
      expect(decisions, `decisions.md missing mention of ${entry.repo}`).toContain(entry.repo);
    }
  });
});
