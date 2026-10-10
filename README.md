# sloppy-seconds

A static directory of AI-assisted open-source **replacements** for commercial or closed-source software — cleanroom rebuilds, functional clones, "very similar" alternatives, and AI-assisted language ports.

## Setup

1. Replace the placeholder `<owner>` in `astro.config.mjs` with your GitHub username/org.
2. In repo settings → Pages → Source, select **GitHub Actions**.
3. Push to `main` — the deploy workflow handles the rest.

No secrets needed beyond the automatic `GITHUB_TOKEN`.

## Development

```bash
npm install
npm run dev      # local dev server
npm test         # vitest
npm run build    # static build → dist/
npm run refresh:stats  # update stats/stats.json from GitHub API
```

## Adding a project

Create one file: `apps/<slug>.md` with frontmatter matching the schema in [`docs/schema.md`](docs/schema.md). That's it — no other files change.

See [`docs/contributing.md`](docs/contributing.md) for inclusion rules and provenance guidance.

## What Phase 1 does NOT include

- No search (Phase 2)
- No visual design system (Phase 2)
- No screenshots (Phase 2)
- No star history / sparklines (Phase 3)
- No RSS feed (Phase 3)
- Lighthouse >90 is a Phase 2 gate
