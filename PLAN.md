# sloppy-seconds — Plan

A stunning, static directory of AI-assisted open-source **replacements** for commercial/closed-source software: cleanroom rebuilds, functional clones, "very similar" alternatives, and AI-assisted language ports. Backed entirely by this GitHub repo's content.

**Scope (broadened Oct 10):** does NOT have to be cleanroom. Entry criteria: open source + AI-assisted/generated + (replaces commercial or closed-source software | reimplements proprietary format/protocol/chip | AI-assisted language port of notable existing software). "Clone" / "very similar" are normal `type` values.

---

## 1. Research findings (Oct 2026)

### 1a. Is there already a directory for this? **No.**
Closest things, none of which is a dedicated AI-cleanroom directory:

| Resource | What it is | Why it's not the thing | 
|---|---|---|
| github.com/topics/clean-room (126 repos) | GitHub topic index | Uncurated, mixed quality, no "modelled on X" structure, includes infra tools (Buildkite cleanroom, phalus) |
| hardbsdk/awesome-alternatives | Huge FOSS-alternatives list | Human-built OSS alternatives, not AI-cleanroom-specific, markdown only |
| radek-sprta/awesome-game-remakes | Game remakes list | Games only, human remakes, no AI provenance |
| natebag/awesome-game-decompilations | Game decomp/recomp list | Decomp (not cleanroom), games only |
| osGameClones.com / recomp.fyi / DecompHub | Game remake/recomp sites | Static curated lists, games only, no auto-refresh |
| getartcraft.com/apps | The ArtCraft suite's own page | Vendor page for one family, not a neutral directory |
| Theseus, phalus, cleanroom-mcp, llvm-native | Cleanroom *tooling* (spec-driven synthesis, MCP process enforcement, forensic reimpl of LLVM) | Tools/methods, not a directory |

**Gap: a neutral, structured, auto-updating registry of AI-built cleanroom reimplementations, with "modelled on" as a first-class field.** Nothing does this today. Timing is good — the space is exploding (ArtCraft/Storytold shipped 12 apps in a week; HN/Phoronix/Ars/Tom's Hardware all covered it).

### 1b. Similar projects to ArtCraft (candidates for the initial dataset)

**ArtCraft / Storytold family** (github.com/storytold/*, Apache-2.0, Rust, AI co-authored mostly Claude Opus 5.5, Sep 30–Oct 7 2026):

| Project | Modelled on | Status (Oct 8) |
|---|---|---|
| PhotoCraft | Adobe Photoshop | Early alpha, 21k stars, real PSD read/write |
| VectorCraft | Illustrator | In development |
| FilmCraft | Premiere Pro | In development |
| LightCraft | Lightroom | In development |
| PdfCraft | Acrobat Pro | Early alpha |
| EffectCraft | After Effects | In development |
| DesignCraft | InDesign | In development |
| WordCraft | Word | ~62% parity claim, .docx read/write — *this is the MS Office one you were thinking of* |
| GridCraft | Excel | Pre-alpha |
| DeckCraft | PowerPoint | ~80% to first alpha |
| CADCraft | AutoCAD | Early dev, DWG via acadrust |
| SoundCraft | Avid Pro Tools | Pre-alpha |

**Other AI-cleanroom / adjacent entries to seed:**
- Pixellect (pixellect.app) — AI-built Photoshop-class editor, Rust/WASM, open source
- lopsy.art (theseamusjames/lopsy.art) — 6 months of AI-driven Photoshop-alternative work, Rust/WASM
- infinityabundance/llvm-native — "forensic-parity" cleanroom reimplementation of LLVM in Rust (31k stars)
- KumCAD, MusaCAD — AI-era AutoCAD-mirroring CAD engines (verify AI provenance before tagging as cleanroom-AI)
- Game space (mostly human, but AI ones will appear; include a Games category anyway): OpenRA, DevilutionX, OpenRCT2, OpenDiablo2 ecosystem — as the "commercial game → open reimpl" backbone, e.g. Wages of War cleanroom Rust engine
- GenOffice (genspark) — open-source AI office suite (not cleanroom, but a "watch" entry / related category)

### 1c. Differentiator the site must carry
The legal distinction matters (and HN pointed it out): "cleanroom" is only legit when inputs were public specs + observed behaviour, not the vendor's code. The directory should record per-entry: `ai_assisted: true/false`, `cleanroom_claim` (self-reported), `inputs_claimed` (specs/observed behaviour/other), `claim_source` URL. That provenance data is what no other directory has — it's the moat.

---

## 2. Architecture

**Principle: the repo *is* the database.** Frontend is a static build of `apps/*.md` + generated `stats/stats.json`. Deploy: GitHub Pages.

```
apps/<slug>.md ──┐
                  ├──> vite build (content loaded at build time) ──> dist/ ──> gh-pages
stats/stats.json ─┘   (inlined as generated TS module)                    │
^                                                                        │
└── .github/workflows/refresh-stats.yml (cron, hourly)                   │
     reads apps/*.md repos → GitHub API → rewrites stats.json → PRs/commits
```

- Build-time content load means zero client-side fetches for data → Lighthouse-friendly, works even with raw.githubusercontent as fallback.
- Stats refresh via Actions keeps stars/activity/live without any backend. `stats.json` commit → `on: push paths: stats/stats.json` triggers redeploy. Clean self-updating loop, no external infra.

### Stack decision
**Astro 5 + Vue 3 islands + Tailwind 4.**
- Astro = static-first, zero JS by default (fast baseline), perfect for a content directory; Vue used only for the two islands that need it (search/filter client, stats charts). React equally viable; Vue chosen for smaller island bundles + composables for the filter logic.
- Tailwind 4 for design system; `@tailwindcss/vite`.
- Content via `astro:content` collections with a **Zod schema** — schema validation at build time enforces `docs/schema.md` automatically.
- Search: client-side full-text via `minisearch` over the bundled index (<50KB for a few hundred entries). No Algolia, no network.
- Charts (star growth over time): optional Phase 3, `recharts` Vue island, data appended by the stats workflow.

**Why not plain React/Vite SPA:** every page is serverless content; Astro gives SSR-free static pages + islands without a routing/bundling fight. Same Vue skills apply.

---

## 3. Data schema (frontmatter of `apps/<slug>.md`)

```yaml
---
slug: photocraft
name: PhotoCraft
modelled_on: Adobe Photoshop          # required — the core field
category: creative                    # creative | office | cad | audio | devtools | games | other
vendor: Adobe                         # original vendor
repo: https://github.com/storytold/photocraft
license: Apache-2.0
language: Rust
platforms: [macos, windows, linux, web]
type: cleanroom                      # cleanroom | clone | similar | language-port | ai-rebuild
ai_assisted: verified                # verified | claimed | unverified (checked: co-author trailers, README, press)
cleanroom_claim: self-reported       # self-reported | verified | not-claimed (cleanroom-type entries only)
inputs_claimed: [public-specs, observed-behaviour]
claim_source: https://github.com/storytold/photocraft#provenance
status: early-alpha                   # pre-alpha | early-alpha | alpha | beta | stable
added: 2026-10-09
description: >
  Native Rust image editor that opens real PSD files; every action is a
  command drivable by CLI, JSON channel, or MCP server.
---
<markdown body: notes, links, links to HN/discussions>
```

---

## 4. Design direction ("stunning")
- **Look:** dark, editorial, technical — think ArtCraft's own "01 / 02 / 03" numbered section aesthetic crossed with a terminal. Big display type (variable font, e.g. Geist or Inter Display), monospace accents for stats (stars, language, license badges rendered as custom chips, not the cliché GitHub shields).
- **Home:** hero with live counts (N projects · M vendors · K stars tracked) from stats.json; a featured "This week on the craft floor" strip (newest/ most active entries from stats.json); category grid.
- **Category pages:** one per category; entries as rich cards — screenshot, "Original → Reimplementation" mapping line, live stars/activity chip, status badge, license/language/platform chips.
- **Project detail pages:** generated per `apps/<slug>.md`; hero screenshot, provenance panel (cleanroom claim, inputs, AI-assisted — the differentiator), live GitHub stats, commit-activity sparkline (Phase 3), markdown body.
- **Micro-interactions:** scroll-linked section numbering, hover glow on cards, keyboard-friendly search (`/` to focus), smooth route transitions, `prefers-reduced-motion` respected. No JS-heavy animations — CSS/transitions do the work.

---

## 5. Phases

**Phase 1 — Foundation (day 1)**
- `npm create astro@latest` (integrations: vue, tailwind), GH Pages deploy workflow, repo `git init` → push
- `apps/` collection + Zod schema + `docs/schema.md`
- Seed dataset: all 12 Storytold apps + Pixellect + lopsy.art + llvm-native + the ≈45 INCLUDEs from the §1d topic triage (≈60 entries)
- `docs/decisions.md` created with the full Oct 10 triage (includes + rejects + rationale)
- Basic layout: home + category + detail pages, functional not final
- `.github/workflows/refresh-stats.yml`: cron hourly, read repos from apps/, GitHub REST (`/repos/{owner}/{repo}`), write `stats/stats.json` + commit (bot identity), redeploy triggers on stats change

**Phase 2 — Polishing to "stunning" (week 1)**
- Visual system per §4 (type scale, dark theme, chips, badges)
- Search island (minisearch), filter by category/vendor/status/language
- Screenshot strategy: mirrored webp per entry with provenance note; graceful placeholder (vendor-agnostic generated tile) when none
- Lighthouse pass (>90 perf, zero CLS), og-image generation per project page
- About/methodology page defining inclusion rules (neutral, provenance-recorded, no legal advice)

### 1d. Curation pipeline: github.com/topics/clean-room (128 repos, triaged Oct 10)

The `topic:clean-room` search is the standing crawl source. First full triage done — results recorded in `docs/decisions.md` (to be created in Phase 1).

**INCLUDE (≈45)** — by category:

- *Commercial app rebuilds:* ruvnet/open-claude-code (519★, Claude Code CLI rebuilt), Heretek-AI/chlorine-server (halogen inference engine), armeehn/rav4-apps (26 replacement apps for car head-unit), TibaneLabs/catcard (Coldcard wallet firmware), Toritan123/rashid (Rosetta translator, x86→ARM), MicaNT-Kernel/MicaNT + PrismX (NT-compatible OS executive + DirectX/Vulkan), paytonison/macintosh (classic Macintosh in Electron), pzzzy/rongta-f11-open (Rongta F11 printer Swift driver), 4akloon/symdev (Symbian S60 SDK tools), mateusz-klatt/hestia (Keemple smart-home protocol), hqhq1025/open-zcode-computer-use (ZCode CUA MCP contract), subashraja5809-hue/open-claude-code, abwoo/Codex_Artifacts
- *Game re-impls:* renaudallard/assettocorsa_competizione_server (16★), Justchicoo/Project-Ambrose (Wizard101 server, AI-agent-built), Egerion/open-atomic-bomberman-97, zuhuHix/BL2_ReBased (BL2→UE5), Krilliac/OmegaStrain-Reimplementation, bucketcomps/infamous (inFAMOUS 2009), suhteevah/open-wages + wages-of-war (duplicates — pick one), pnmcguire480/STARS-2026 (Stars! 1995), DrGeoff/psychic-cleaners (Ghostbusters 1984), exocognosis/star-trek-bridge-simulator, V3tR1l1oN/tier0-goldsrc (CS1.6 tier0.dll), cciacona/capplusplus (Capitalism Plus), StackBlender/snes-dsp1 + snes-spc700-boot-rom, etroimcasso/Snaggletooth (SNES VM), lear94/rustygb (Game Boy emulator)
- *Language ports / cleanroom of notable software:* Dicklesworthstone/franken* family (7 repos: redis, networkx, numpy, pandas, torch, jax, snowflake — consistent brand, include as family), chyinan/OpenJOC (212★ E-AC-3 decoder) + JOCForge (encoder), lolren/nrf54-arduino-core (44★), KarpelesLab/puremp (MPFR-class bignum), cjc0013/debug-clean-room-rebuild-proof
- *Proprietary protocols/formats:* Ashtry197/zoom-f8-ble-protocol, GlomarGadaffi/Diagonal-GloQc, masarray/ARIEC61850, gongke-cxt/claw-code-main + tabbypyrotechnic519/claw-code-parity

**EXCLUDE (≈80)** — patterns: cleanroom *methodology/tooling* (phalus, Theseus-adjacent, climashscape/agentic-cleanroom, Black-JL/airlock, AkuchiS/Oni, ffseika0304 code-ownership-audit×2, PyModel/reverse-engineering-skill) → candidate for a separate small **"Tools of the trade" sidebar**, not the main index; BTG ENTITY-* conformance baselines ×8; estelledc/thaddeusarndt/blackmore/hyt971023 synthetic-lab & case-study spam ×15+; game-AI *research* repos (zeljkovranjes ×4 — L4D/Alien directors, not commercial replacements); research/notes (jalehvesical21/claude-code-decompiled, ractive/calculator-knowledgebase, ChestnutLabs, StartripAI/ClaudeFolding); university clients, fonts, threads, barcodes, and everything with no replacement target.

The crawl becomes part of `refresh-stats.yml` (or a sibling weekly workflow): re-run topic search, flag **new** repos for review via a generated `docs/inbox.md`, human (or agent) decision → `apps/*.md` or `docs/decisions.md`.

**Phase 3 — Living data (week 2+)**
- Stats workflow appends to `stats/history.json` (stars per refresh) → commit-activity + star-growth sparklines on detail pages
- Watchlist: `watch/*.md` for candidates not yet qualifying (e.g. GenOffice) with reasons
- RSS/Atom feed of new entries (Astro `@astrojs/rss`) + "suggested" button that opens a prefilled issue template
- Games category build-out from awesome-game-remakes/osGameClones as a cross-linked section (flagged human-reimpl vs AI-cleanroom)

**Phase 4 — Distribution**
- Launch: HN Show HN, r/opensource, post in the ArtCraft Discord (the directory is neutral, invites collaboration)
- Add a `sloppy-seconds` GitHub topic to each listed repo (via issue, not API spam)
- Explore: JSON export endpoint (just a committed file) so agents/tools can consume the dataset — the provenance data becomes a small API for researchers

---

## 6. Risks / notes
- **Trademark:** we reference Adobe/Microsoft products descriptively ("reimplementation of Photoshop") — same usage the projects themselves and press use; avoid logos in our own assets, use text names.
- **Screenshots:** hotlinking from their repos via raw.githubusercontent is fine and keeps us honest (their own assets, their license); mirror only with care.
- **Stale stats:** hourly cron is plenty; show "as of" timestamp on every stats chip.
- **Scope creep:** stay a directory. Do not benchmark, do not rate quality, do not give legal verdicts — record claims, cite sources.
- **Rate limits:** GitHub API is 5,000 req/h per token — trivial at 50–500 repos; add `GITHUB_TOKEN` secret, batch requests.
- **Topic-tag noise:** `topic:clean-room` is self-tagged and ~60% irrelevant (labs, methodology, spam). The decision-log + weekly inbox gate exists precisely because the source is noisy; never auto-publish from a topic crawl.
- **Name:** "sloppy-seconds" is the repo dir name; final site name is open (candidates: cleanroom.directory, thecraftindex, rebuilds.dev) — keep `sloppy-seconds` as the slug until decided.
