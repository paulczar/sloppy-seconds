# Changelog

All notable changes to this project will be documented in this file.

## [unreleased]

### Added
- Collapsible per-category sections on home page, sorted by GitHub stars
- "Most Popular" section (top 12 by stars) on home page
- Category pages sorted by stars descending
- `make preview` target — builds and serves on `0.0.0.0:4321`
- Dark theme with gradient hero, frosted sticky nav, hover-lift cards
- 62 seeded entries from clean-room topic triage
- Stats pipeline: fetcher, atomic writer, hourly CI refresh
- GitHub Pages deploy workflow + scheduled stats refresh
- Contributor guide, issue template, decision log

### Fixed
- CSS not loading in production build (moved to Vite import)
- Base-path links missing `/sloppy-seconds/` prefix in layout

## [0.1.0] - 2026-10-10

### Added
- Initial scaffold: Astro 7, Vitest, Zod schema, content collection
- Entry schema with provenance fields (`ai_assisted`, `cleanroom_claim`, `inputs_claimed`)
- Seed dataset (62 entries), stats fetcher, all pages, CI workflows
