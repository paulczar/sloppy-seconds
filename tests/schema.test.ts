import { describe, it, expect } from 'vitest';
import { EntrySchema } from '../src/lib/schema';

const base = {
  slug: 'photocraft',
  name: 'PhotoCraft',
  modelled_on: 'Adobe Photoshop',
  category: 'creative' as const,
  vendor: 'Adobe',
  repo: 'https://github.com/storytold/photocraft',
  license: 'Apache-2.0',
  language: 'Rust',
  platforms: ['macos', 'windows', 'linux', 'web'],
  type: 'cleanroom',
  ai_assisted: 'verified',
  cleanroom_claim: 'self-reported',
  inputs_claimed: ['public-specs', 'observed-behaviour'],
  claim_source: 'https://github.com/storytold/photocraft#provenance',
  added: '2026-10-09',
  description: 'Native Rust image editor that opens real PSD files.',
};

describe('EntrySchema', () => {
  it('parses a fully populated entry and returns platforms as string[]', () => {
    const parsed = EntrySchema.parse(base);
    expect(parsed.platforms).toEqual(['macos', 'windows', 'linux', 'web']);
    expect(Array.isArray(parsed.platforms)).toBe(true);
  });

  it('fails when modelled_on is missing and mentions modelled_on', () => {
    const { modelled_on: _m, ...rest } = base;
    const result = EntrySchema.safeParse(rest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(JSON.stringify(result.error.issues)).toContain('modelled_on');
    }
  });

  it("rejects type: 'rewrite' (not in enum)", () => {
    const result = EntrySchema.safeParse({ ...base, type: 'rewrite' });
    expect(result.success).toBe(false);
  });

  it("accepts category: 'os' and rejects category: 'kernel'", () => {
    expect(EntrySchema.safeParse({ ...base, category: 'os' }).success).toBe(true);
    expect(EntrySchema.safeParse({ ...base, category: 'kernel' }).success).toBe(false);
  });

  it("accepts cleanroom_claim: 'not-claimed' for a language-port", () => {
    const result = EntrySchema.safeParse({
      ...base,
      slug: 'frankenredis',
      type: 'language-port',
      cleanroom_claim: 'not-claimed',
      claim_source: undefined,
    });
    expect(result.success).toBe(true);
  });

  it('requires claim_source to be a URL whenever cleanroom_claim is not not-claimed', () => {
    const bad = EntrySchema.safeParse({ ...base, claim_source: undefined });
    expect(bad.success).toBe(false);
    if (!bad.success) {
      expect(JSON.stringify(bad.error.issues)).toContain('claim_source');
    }
  });

  it('rejects a non-URL claim_source', () => {
    const result = EntrySchema.safeParse({ ...base, claim_source: 'not a url' });
    expect(result.success).toBe(false);
  });

  it('fails when added is missing', () => {
    const { added: _a, ...rest } = base;
    expect(EntrySchema.safeParse(rest).success).toBe(false);
  });

  it('coerces added to a Date', () => {
    const parsed = EntrySchema.parse(base);
    expect(parsed.added).toBeInstanceOf(Date);
    expect(parsed.added.toISOString().slice(0, 10)).toBe('2026-10-09');
  });
});
