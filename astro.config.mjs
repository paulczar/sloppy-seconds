// @ts-check
import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";

// NOTE: `site` uses a placeholder owner. Replace OWNER with the GitHub account or
// organisation that hosts this repo before the first deploy (see README.md).
export default defineConfig({
  site: "https://OWNER.github.io",
  base: "/sloppy-seconds",
  output: "static",
  integrations: [vue()],
  vite: {
    plugins: [tailwindcss()],
  },
});
