import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const DIST = join(process.cwd(), 'dist');

// These tests require `npm run build` to have been run first.
// They assert on dist/ output for base-path correctness and null handling.

describe('component build output', () => {
  it('dist/index.html exists', () => {
    expect(existsSync(join(DIST, 'index.html'))).toBe(true);
  });

  it('no generated HTML contains the string undefined or >null< (Review Focus 1, 5)', () => {
    const { readdirSync } = require('fs');
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

    const htmlFiles = walk(DIST);
    for (const file of htmlFiles) {
      const content = readFileSync(file, 'utf-8');
      expect(content, `${file} contains "undefined"`).not.toMatch(/\bundefined\b/);
      expect(content, `${file} contains ">null<"`).not.toContain('>null<');
    }
  });
});
