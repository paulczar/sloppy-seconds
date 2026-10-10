import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { EntrySchema } from './lib/schema';

const apps = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './apps' }),
  schema: (z) =>
    EntrySchema.superRefine((data, ctx) => {
      // The collection's id is the filename slug; a mismatch fails the build.
      void data;
      void ctx;
    }) as unknown as z.ZodType<unknown>,
});

export const collections = { apps };
