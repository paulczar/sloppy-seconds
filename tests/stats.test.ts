import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import os from 'os';

const repoPayload = JSON.parse(
  readFileSync(join(process.cwd(), 'tests', 'fixtures', 'repo-payload.json'), 'utf-8')
);
const release404 = JSON.parse(
  readFileSync(join(process.cwd(), 'tests', 'fixtures', 'release-404.json'), 'utf-8')
);

describe('stats module', () => {
  let toRepoStats: (payload: unknown, release: unknown, fetchedAt: string) => any;
  let writeStatsAtomic: (path: string, data: any) => void;
  let fetchRepoStats: (repo: string, token?: string) => Promise<any>;

  beforeEach(async () => {
    const mod = await import('../src/lib/stats');
    toRepoStats = mod.toRepoStats;
    writeStatsAtomic = mod.writeStatsAtomic;
    fetchRepoStats = mod.fetchRepoStats;
  });

  describe('toRepoStats', () => {
    it('maps a full payload correctly', () => {
      const stats = toRepoStats(repoPayload, null, '2026-10-10T00:00:00Z');
      expect(stats.stars).toBe(21000);
      expect(stats.forks).toBe(890);
      expect(stats.open_issues).toBe(42);
      expect(stats.pushed_at).toBe('2026-10-09T12:00:00Z');
      expect(stats.archived).toBe(false);
      expect(stats.license).toBe('Apache-2.0');
      expect(stats.language).toBe('Rust');
      expect(stats.default_branch).toBe('main');
      expect(stats.latest_release).toBeNull();
      expect(stats.fetched_at).toBe('2026-10-10T00:00:00Z');
    });

    it('handles null license and language (Review Focus 5)', () => {
      const sparse = { ...repoPayload, license: null, language: null };
      const stats = toRepoStats(sparse, null, '2026-10-10T00:00:00Z');
      expect(stats.license).toBeNull();
      expect(stats.language).toBeNull();
      expect(stats.latest_release).toBeNull();
    });

    it('carries archived: true through', () => {
      const archived = { ...repoPayload, archived: true };
      const stats = toRepoStats(archived, null, '2026-10-10T00:00:00Z');
      expect(stats.archived).toBe(true);
    });

    it('maps a release payload', () => {
      const release = { tag_name: 'v1.2.3' };
      const stats = toRepoStats(repoPayload, release, '2026-10-10T00:00:00Z');
      expect(stats.latest_release).toBe('v1.2.3');
    });
  });

  describe('fetchRepoStats', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('rejects with repo name on 404', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not Found' }),
      }));
      await expect(fetchRepoStats('nonexistent/repo')).rejects.toThrow(/nonexistent\/repo/);
    });

    it('rejects on 403 rate limit', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ message: 'API rate limit exceeded' }),
      }));
      await expect(fetchRepoStats('some/repo')).rejects.toThrow(/rate limit/i);
    });

    it('returns stats on success', async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => repoPayload,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => release404,
        });
      vi.stubGlobal('fetch', fetchMock);

      const stats = await fetchRepoStats('storytold/photocraft');
      expect(stats.stars).toBe(21000);
      expect(stats.latest_release).toBeNull();
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('writeStatsAtomic', () => {
    it('writes valid JSON that round-trips', () => {
      const tmpPath = join(os.tmpdir(), `stats-test-${Date.now()}.json`);
      const data = { generated_at: '2026-10-10T00:00:00Z', entries: {} };
      writeStatsAtomic(tmpPath, data);
      const written = JSON.parse(readFileSync(tmpPath, 'utf-8'));
      expect(written).toEqual(data);
      unlinkSync(tmpPath);
    });

    it('leaves no partial file when serializer throws (Review Focus 4)', () => {
      const tmpPath = join(os.tmpdir(), `stats-fail-${Date.now()}.json`);
      // Create an object that throws on JSON.stringify
      const bad = { generated_at: '', entries: {} };
      Object.defineProperty(bad, 'circular', {
        get() { return bad; },
        enumerable: true,
      });
      expect(() => writeStatsAtomic(tmpPath, bad)).toThrow();
      expect(existsSync(tmpPath)).toBe(false);
      // Clean up temp file if it exists
      if (existsSync(`${tmpPath}.tmp`)) unlinkSync(`${tmpPath}.tmp`);
    });
  });
});
