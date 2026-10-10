/// <reference types="vitest" />
import { getViteConfig } from "astro/config";

// getViteConfig wires Astro's Vite pipeline into Vitest so that `.astro`
// component imports (used from Task 5 onward) resolve in tests.
export default getViteConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
