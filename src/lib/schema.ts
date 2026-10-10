import { z } from 'astro:content';

export const CategorySchema = z.enum([
  'creative',
  'office',
  'cad',
  'audio',
  'devtools',
  'games',
  'os',
  'other',
]);

export const TypeSchema = z.enum([
  'cleanroom',
  'clone',
  'similar',
  'language-port',
  'ai-rebuild',
]);

export const AiAssistedSchema = z.enum(['verified', 'claimed', 'unverified']);

export const CleanroomClaimSchema = z.enum([
  'self-reported',
  'verified',
  'not-claimed',
]);

export const StatusSchema = z.enum([
  'pre-alpha',
  'early-alpha',
  'alpha',
  'beta',
  'stable',
]);

export const PlatformSchema = z.enum([
  'macos',
  'windows',
  'linux',
  'web',
  'android',
  'ios',
]);

export const InputsClaimedSchema = z.enum([
  'public-specs',
  'observed-behaviour',
  'documentation',
  'file-format',
  'protocol-capture',
  'other',
]);

export const EntrySchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string(),
    modelled_on: z.string(),
    category: CategorySchema,
    vendor: z.string(),
    repo: z.url(),
    license: z.string().nullable(),
    language: z.string().nullable(),
    platforms: z.array(PlatformSchema).default([]),
    type: TypeSchema,
    ai_assisted: AiAssistedSchema,
    cleanroom_claim: CleanroomClaimSchema,
    inputs_claimed: z.array(InputsClaimedSchema).default([]),
    claim_source: z.url().optional(),
    status: StatusSchema,
    added: z.coerce.date(),
    description: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.cleanroom_claim !== 'not-claimed' && !data.claim_source) {
      ctx.addIssue({
        code: 'custom',
        path: ['claim_source'],
        message:
          'claim_source is required whenever a cleanroom claim is made (cleanroom_claim !== not-claimed)',
      });
    }
  });

export type Entry = z.infer<typeof EntrySchema>;
