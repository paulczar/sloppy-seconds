# Curation Decisions

**Date:** 2026-10-10
**Source:** `github.com/topics/clean-room` (128 repos pulled via GitHub search API) + PLAN.md §1b candidates

## Appeal rule

A rejected project gets a line in the EXCLUDE list below with a one-line rationale. Any contributor can open an issue to re-argue; if accepted, the entry moves to INCLUDE and an `apps/<slug>.md` file is created.

---

## INCLUDE (62 entries)

### ArtCraft / Storytold family (12)

| Repo | Rationale |
|---|---|
| `storytold/photocraft` | Cleanroom Photoshop replacement, AI co-authored, 21k stars |
| `storytold/vectorcraft` | Cleanroom Illustrator replacement, AI co-authored |
| `storytold/filmcraft` | Cleanroom Premiere Pro replacement, AI co-authored |
| `storytold/lightcraft` | Cleanroom Lightroom replacement, AI co-authored |
| `storytold/pdfcraft` | Cleanroom Acrobat Pro replacement, AI co-authored |
| `storytold/effectcraft` | Cleanroom After Effects replacement, AI co-authored |
| `storytold/designcraft` | Cleanroom InDesign replacement, AI co-authored |
| `storytold/wordcraft` | Cleanroom Word replacement, ~62% parity, .docx read/write |
| `storytold/gridcraft` | Cleanroom Excel replacement, AI co-authored |
| `storytold/deckcraft` | Cleanroom PowerPoint replacement, ~80% to first alpha |
| `storytold/cadcraft` | Cleanroom AutoCAD replacement, DWG via acadrust |
| `storytold/soundcraft` | Cleanroom Pro Tools replacement, AI co-authored |

### Other commercial app rebuilds (14)

| Repo | Rationale |
|---|---|
| `pixellect/pixellect` | AI-built Photoshop-class editor, Rust/WASM |
| `theseamusjames/lopsy.art` | 6 months of AI-driven Photoshop-alternative work |
| `infinityabundance/llvm-native` | Forensic-parity cleanroom LLVM reimplementation in Rust, 31k stars |
| `ruvnet/open-claude-code` | Claude Code CLI rebuilt, 519 stars |
| `Heretek-AI/chlorine-server` | Halogen inference engine clone |
| `armeehn/rav4-apps` | 26 replacement apps for car head-unit |
| `TibaneLabs/catcard` | Coldcard wallet firmware cleanroom |
| `Toritan123/rashid` | Rosetta translator x86→ARM |
| `MicaNT-Kernel/MicaNT` | NT-compatible OS executive |
| `MicaNT-Kernel/PrismX` | DirectX/Vulkan compatible graphics layer |
| `paytonison/macintosh` | Classic Macintosh in Electron |
| `pzzzy/rongta-f11-open` | Rongta F11 printer Swift driver |
| `4akloon/symdev` | Symbian S60 SDK tools |
| `mateusz-klatt/hestia` | Keemple smart-home protocol |

### Additional devtools (4)

| Repo | Rationale |
|---|---|
| `hqhq1025/open-zcode-computer-use` | ZCode CUA MCP contract |
| `subashraja5809-hue/open-claude-code` | Second Claude Code CLI clone (distinct from ruvnet's) |
| `abwoo/Codex_Artifacts` | OpenAI Codex artifacts clone |
| `cjc0013/debug-clean-room-rebuild-proof` | Debug tooling cleanroom proof |

### Game re-implementations (16)

| Repo | Rationale |
|---|---|
| `renaudallard/assettocorsa_competizione_server` | Assetto Corsa Competizione server |
| `Justchicoo/Project-Ambrose` | Wizard101 server, AI-agent-built |
| `Egerion/open-atomic-bomberman-97` | Atomic Bombman '97 cleanroom |
| `zuhuHix/BL2_ReBased` | Borderlands 2 → UE5 port |
| `Krilliac/OmegaStrain-Reimplementation` | Omega Strain reimplementation |
| `bucketcomps/infamous` | inFAMOUS 2009 cleanroom |
| `suhteevah/wages-of-war` | Wages of War cleanroom Rust engine (open-wages excluded as duplicate) |
| `pnmcguire480/STARS-2026` | Stars! 1995 cleanroom |
| `DrGeoff/psychic-cleaners` | Ghostbusters 1984 cleanroom |
| `exocognosis/star-trek-bridge-simulator` | Star Trek Bridge Simulator cleanroom |
| `V3tR1l1oN/tier0-goldsrc` | CS1.6 tier0.dll cleanroom |
| `cciacona/capplusplus` | Capitalism Plus cleanroom |
| `StackBlender/snes-dsp1` | SNES DSP1 chip cleanroom |
| `StackBlender/snes-spc700-boot-rom` | SNES SPC700 boot ROM cleanroom |
| `etroimcasso/Snaggletooth` | SNES VM cleanroom |
| `lear94/rustygb` | Game Boy emulator in Rust |

### Language ports / cleanroom of notable software (7)

| Repo | Rationale |
|---|---|
| `Dicklesworthstone/frankenredis` | Redis language port, consistent franken* brand |
| `Dicklesworthstone/frankennetworkx` | NetworkX language port |
| `Dicklesworthstone/frankennumpy` | NumPy language port |
| `Dicklesworthstone/frankenpandas` | Pandas language port |
| `Dicklesworthstone/frankentorch` | PyTorch language port |
| `Dicklesworthstone/frankenjax` | JAX language port |
| `Dicklesworthstone/frakensnowflake` | Snowflake language port |

### Audio / protocols / formats (5)

| Repo | Rationale |
|---|---|
| `chyinan/OpenJOC` | E-AC-3 decoder, 212 stars |
| `chyinan/JOCForge` | E-AC-3 encoder |
| `lolren/nrf54-arduino-core` | Arduino core for nRF54, 44 stars |
| `KarpelesLab/puremp` | MPFR-class bignum library |
| `Ashtry197/zoom-f8-ble-protocol` | Zoom F8 BLE protocol |

### Other proprietary protocols/formats (3)

| Repo | Rationale |
|---|---|
| `GlomarGadaffi/Diagonal-GloQc` | Diagonal GloQc e-ink tablet driver |
| `masarray/ARIEC61850` | IEC 61850 protocol implementation |
| `gongke-cxt/claw-code-main` | Claw code framework clone |
| `tabbypyrotechnic519/claw-code-parity` | Claw code framework parity implementation |

### Duplicate note

- `suhteevah/open-wages` — excluded as duplicate of `suhteevah/wages-of-war` (same project, two repos).

---

## EXCLUDE (~66 repos)

### Cleanroom methodology/tooling (not replacements)

phalus, Theseus-adjacent, climashscape/agentic-cleanroom, Black-JL/airlock, AkuchiS/Oni, ffseika0304/code-ownership-audit (×2), PyModel/reverse-engineering-skill → candidate for a separate "Tools of the trade" sidebar, not the main index.

### BTG ENTITY-* conformance baselines (×8)

Conformance test suites, not software replacements.

### Synthetic-lab / case-study spam (×15+)

estelledc/thaddeusarndt/blackmore/hyt971023 and similar accounts — bulk-generated repos with no real content.

### Game-AI research (not commercial replacements)

zeljkovranjes ×4 — L4D/Alien director AI research, not game reimplementations.

### Research/notes/documentation-only

jalehvesical21/claude-code-decompiled, ractive/calculator-knowledgebase, ChestnutLabs, StartripAI/ClaudeFolding — documentation or analysis, not working software.

### No replacement target

University clients, fonts, threads, barcodes, and other repos with no identifiable commercial/closed product being replaced.
