import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const DIST = join(process.cwd(), 'dist');

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir, { withFileTypes: true });
  let result: string[] = [];
  for (const f of files) {
    const full = join(dir, f.name);
    if (f.isDirectory()) result = result.concat(walk(full));
    else if (f.name.endsWith('.html')) result.push(full);
  }
  return result;
}

describe('pages build output', () => {
  it('dist/index.html exists and contains count line', () => {
    const html = readFileSync(join(DIST, 'index.html'), 'utf-8');
    expect(html).toContain('projects');
    expect(html).toContain('vendors');
    expect(html).toContain('stars tracked');
  });

  it('category pages exist for each category in dataset', () => {
    const categories = new Set<string>();
    const appsDir = join(process.cwd(), 'apps');
    for (const f of readdirSync(appsDir).filter(f => f.endsWith('.md'))) {
      const raw = readFileSync(join(appsDir, f), 'utf-8');
      const match = raw.match(/^category:\s*(\S+)/m);
      if (match) categories.add(match[1]);
    }
    for (const cat of categories) {
      expect(existsSync(join(DIST, 'c', cat, 'index.html')), `missing dist/c/${cat}/index.html`).toBe(true);
    }
  });

  it('detail page for photocraft exists and contains expected content', () => {
    const path = join(DIST, 'app', 'photocraft', 'index.html');
    expect(existsSync(path)).toBe(true);
    const html = readFileSync(path, 'utf-8');
    expect(html).toContain('Photocraft');
    expect(html).toContain('Adobe Photoshop');
    expect(html).toContain('github.com/storytold/photocraft');
  });

  it('404 page exists', () => {
    expect(existsSync(join(DIST, '404.html'))).toBe(true);
  });

  it('no generated HTML contains undefined or >null< (Review Focus 1, 5)', () => {
    const htmlFiles = walk(DIST);
    expect(htmlFiles.length).toBeGreaterThan(0);
    for (const file of htmlFiles) {
      const content = readFileSync(file, 'utf-8');
      expect(content, `${file} contains "undefined"`).not.toMatch(/\bundefined\b/);
      expect(content, `${file} contains ">null<"`).not.toContain('>null<');
    }
  });
});
