# Entry Schema

Every project in the directory is a single file at `apps/<slug>.md` with YAML frontmatter. The schema below is enforced by `src/lib/schema.ts` (Zod) and validated at build time via Astro's content collections.

## Required fields

| Field | Type | Notes |
|---|---|---|
| `slug` | string | Must match `^[a-z0-9-]+$`. Should equal the filename without extension. |
| `name` | string | Display name of the project. |
| `modelled_on` | string | The commercial/closed product or software being replaced. Core field of the dataset. |
| `category` | enum | One of: `creative`, `office`, `cad`, `audio`, `devtools`, `games`, `os`, `other`. |
| `vendor` | string | The vendor of the product being modelled on. |
| `repo` | URL | GitHub (or other) repository URL. |
| `license` | string or null | SPDX license identifier, or `null` if unknown/unlicensed. |
| `language` | string or null | Primary implementation language, or `null` if unknown. |
| `type` | enum | Provenance type: `cleanroom`, `clone`, `similar`, `language-port`, `ai-rebuild`. |
| `ai_assisted` | enum | `verified`, `claimed`, or `unverified`. How confident we are that AI was used. |
| `cleanroom_claim` | enum | `self-reported`, `verified`, or `not-claimed`. Records only what the project itself says. |
| `status` | enum | Maturity: `pre-alpha`, `early-alpha`, `alpha`, `beta`, `stable`. |
| `added` | date | ISO date (`YYYY-MM-DD`) when the entry was added to the directory. |
| `description` | string | 1–3 sentence summary shown on cards and detail pages. |

## Optional fields

| Field | Type | Notes |
|---|---|---|
| `platforms` | array of enum | Default `[]`. Values: `macos`, `windows`, `linux`, `web`, `android`, `ios`. |
| `inputs_claimed` | array of enum | Default `[]`. What the project claims as its design inputs: `public-specs`, `observed-behaviour`, `documentation`, `file-format`, `protocol-capture`, `other`. |
| `claim_source` | URL | **Required** whenever `cleanroom_claim` is not `not-claimed`. Link to the README section or commit where the claim appears. |

## Validation rules

1. All required fields must be present.
2. Enum fields must use exact values listed above.
3. `claim_source` is conditionally required: if `cleanroom_claim` is `self-reported` or `verified`, a valid URL must be provided.
4. `slug` must be lowercase alphanumeric with hyphens only.
5. `added` is coerced from string to Date; must be a valid ISO date.

## Example

See `apps/example-entry.md` for a minimal valid entry.
