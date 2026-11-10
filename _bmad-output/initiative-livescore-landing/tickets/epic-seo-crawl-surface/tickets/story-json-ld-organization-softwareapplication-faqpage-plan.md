---
title: 'JSON-LD Organization SoftwareApplication FAQPage'
type: feature
ticket: 4
created: '2026-11-10'
status: built
baseline_revision: '90ba213dcddced919751cbd4c4a790b6ef7c5fc5'
route: full
route_source: auto
risk: medium
review: quick
review_source: pinned
lenses_ran:
  - quick
review_loop_iteration: 0
followup_review_recommended: false
context:
  - _bmad-output/initiative-livescore-landing/sources/SERVICE-CAPABILITIES.md
warnings: []
deferred: []
---

<intent-contract>

## Intent

**Problem:** Marketing HTML exposes no claim-safe schema.org JSON-LD, so crawlers cannot classify the product or FAQ answers beyond plain text.

**Approach:** Emit Organization + SoftwareApplication JSON-LD on the home marketing surface and FAQPage JSON-LD on the FAQ route via native `application/ld+json` script tags, with structured claims limited to SERVICE-CAPABILITIES / siteDetails (brand Live Score, bot CTA `https://t.me/LiveScoreAppBot`).

## Boundaries & Constraints

**Always:** Host `https://football-live-bot.online`; brand Live Score; CTA/sameAs bot URL from `siteDetails.botUrl`; claims only from SERVICE-CAPABILITIES + existing claim-safe marketing copy already on-page; preserve story 3.2 `marketingPageAlternates` and story 3.3 `marketingPageMetadata` (extend pages, do not regress meta/OG/Twitter/canonical); sanitize JSON-LD string (`<` → `\u003c`) per Next.js JSON-LD guide.

**Never:** predictions, Discord, player-follow, live highlights-cron, personal Premium; live channels API; epic 4; change page jobs/IA/markdown bodies without need; break robots/sitemap/`llms*` / meta helpers except additive JSON-LD injection; delete files; commit `.agents/` / `_bmad/` / `skills-lock.json`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Home JSON-LD | GET `/en` HTML | ≥1 `application/ld+json` script containing `@type` Organization and/or SoftwareApplication; name Live Score; url/sameAs under host/bot; no forbidden claim tokens | 200 |
| FAQ JSON-LD | GET `/en/faq` HTML | `application/ld+json` with `@type` FAQPage and ≥1 Question/acceptedAnswer pair derived from FAQ markdown; no forbidden claim tokens | 200 |
| Meta intact | GET `/en` and `/en/faq` | story 3.2 canonical+hreflang and story 3.3 title/description/OG/Twitter still present | 200 |
| Claim-safe payload | Any JSON-LD body | Omit predictions/Discord/player-follow/live highlights-cron/personal Premium strings | Builder uses allowlisted fields only |

</intent-contract>

## Code Map

- `src/data/siteDetails.ts` — read-only: `siteName`, `siteUrl`, `botUrl`, `metadata.description`
- `src/lib/content.ts` — reuse `getPageMarkdown` / `MARKETING_PAGES.faq` for FAQ Q&A source; do not change sitemap map
- `src/lib/seo-metadata.ts` — do not regress; leave alone unless a tiny shared export is required (prefer new module)
- `src/lib/seo-jsonld.ts` (new) — builders: `organizationJsonLd()`, `softwareApplicationJsonLd()`, `faqPageJsonLd(markdown)`, plus `serializeJsonLd(data)` with `<` scrub; parse FAQ as brand line + `Question?` / answer blocks (trailing CTA line without `?` is not a question)
- `src/components/JsonLdScript.tsx` (new, optional thin) — native `<script type="application/ld+json" dangerouslySetInnerHTML=…>` (not `next/script`)
- `src/app/[locale]/page.tsx` — keep `generateMetadata`; wrap/extend default export to also render Organization + SoftwareApplication JSON-LD (Decision: home = core marketing surface per verify)
- `src/app/[locale]/faq/page.tsx` — keep `generateMetadata`; load FAQ markdown and render FAQPage JSON-LD alongside `MarketingMarkdownPage`
- Do not change: robots/sitemap routes, `public/llms*`, `MarketingMarkdownPage` body job, epic 4, other six marketing pages (Org/SA only on home)

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/seo-jsonld.ts` — add claim-safe Organization + SoftwareApplication builders from `siteDetails`/SERVICE-CAPABILITIES facts; FAQPage builder that extracts Q/A pairs from FAQ markdown; `serializeJsonLd` with `<` → `\u003c`
- [x] `src/components/JsonLdScript.tsx` — thin server component rendering one or more JSON-LD script tags via serialize helper
- [x] `src/app/[locale]/page.tsx` — render Organization + SoftwareApplication JSON-LD on home without changing `generateMetadata` / markdown body
- [x] `src/app/[locale]/faq/page.tsx` — load FAQ markdown, render FAQPage JSON-LD; keep existing metadata + MarketingMarkdownPage
- [x] Verify I/O matrix via `next build` + HTTP GET HTML spot-checks on `/en` and `/en/faq`

**Acceptance Criteria:**
- Given the app is running, when GET `/en`, then HTML contains `application/ld+json` with Organization and/or SoftwareApplication for Live Score under `https://football-live-bot.online`, and head still has story 3.2 alternates plus story 3.3 meta/OG/Twitter
- Given the app is running, when GET `/en/faq`, then HTML contains `application/ld+json` FAQPage with Question/acceptedAnswer entries, and payloads (home + faq) contain none of: predictions, Discord, player-follow, live highlights-cron, personal Premium

## Implementation Notes

- 2026-11-10: Added `src/lib/seo-jsonld.ts` with claim-safe `organizationJsonLd` / `softwareApplicationJsonLd` (from `siteDetails`; offers omitted) and `faqPageJsonLd` (brand line skip + `?` Q/A blocks; CTA without `?` skipped) plus `serializeJsonLd` (`<` → `\u003c`). Added `JsonLdScript` native script injector. Home renders Org + SoftwareApplication adjacent scripts; FAQ loads markdown and injects FAQPage alongside `MarketingMarkdownPage`. `generateMetadata` / seo-metadata / robots / sitemap / other marketing pages untouched.
- 2026-11-10: FAQ extractor uses blank-line blocks so the trailing CTA is not merged into the last `acceptedAnswer`. Verified: `pnpm exec next build` OK; GET `http://127.0.0.1:3021/en` → 2× ld+json (Organization + SoftwareApplication), canonical/hreflang/OG/Twitter present, no forbidden claim tokens; GET `/en/faq` → FAQPage with 3 Question/acceptedAnswer pairs, meta intact, CTA excluded from answers.
- 2026-11-10 (review patch): `extractFaqPairs` question terminator is `/[?؟？]$/` (no `/u` flag — TS target rejects unicode flag) so Arabic FAQ questions ending in `؟` populate FAQPage; re-verified `/en`, `/en/faq`, `/ar/faq`.

## Plan Change Log

## Review Triage Log

### 2026-11-10 — Review pass
- verdicts: 1 findings — high 0, medium 1, low 0, false 0, maybe-false 0
- findings:
  - `[medium]` `[patch]` Arabic FAQ questions ending in `؟` produced empty FAQPage `mainEntity` — fixed `extractFaqPairs` to accept `?`/`؟`/`？` (dropped `/u` after Next typecheck failure); GET `/ar/faq` now yields 3 Question pairs

## Design Notes

Next.js App Router has no Metadata API for JSON-LD — inject native `<script type="application/ld+json">` in the page component (official guide). Prefer `@graph` or adjacent scripts for Org+SoftwareApplication on home.

Golden claim-safe shape (fields only; implementer may adjust schema.org property names within SERVICE-CAPABILITIES):
- Organization: `name=Live Score`, `url=siteUrl`, `sameAs=[botUrl]`
- SoftwareApplication: `name=Live Score`, `applicationCategory` suitable for a Telegram football scores product, `operatingSystem` Telegram/Web, `url=siteUrl`, `offers` omitted or Chat Premium for group/channel only — never personal Premium
- FAQPage: `mainEntity` Question list from locale FAQ markdown Q/A pairs already on `/en/faq`

## Verification

**Commands:**
- `pnpm exec next build` -- expected: success
- After `pnpm exec next start`, GET `/en` and `/en/faq` -- expected: home has Organization and/or SoftwareApplication JSON-LD; FAQ has FAQPage JSON-LD; both omit forbidden claim tokens; meta/canonical/hreflang/OG/Twitter from 3.2/3.3 still present on those responses

## Auto Run Result

- Summary: Claim-safe JSON-LD ships on home (Organization + SoftwareApplication) and FAQ (FAQPage from locale markdown Q/A); Arabic `؟` question marks accepted after review patch.
- Files changed:
  - `src/lib/seo-jsonld.ts` — Organization / SoftwareApplication / FAQPage builders + serialize + FAQ extract
  - `src/components/JsonLdScript.tsx` — native `application/ld+json` injector
  - `src/app/[locale]/page.tsx` — home JSON-LD scripts
  - `src/app/[locale]/faq/page.tsx` — FAQPage JSON-LD beside markdown page
  - this plan — full plan + review/finalize
- Review: 1 finding (medium) patched; 0 deferred; 0 rejected
- Follow-up review recommendation: `false`
- Patched counts: high 0, medium 1, low 0
- Verification: `pnpm exec next build` success; `next start` GET `/en` → Org+SoftwareApplication; `/en/faq` and `/ar/faq` → FAQPage with 3 Questions; meta/canonical/hreflang/OG/Twitter intact; no forbidden claim tokens
- Residual risks: FAQ parser still couples to blank-line `Question?\nanswer` block shape; non-conforming locale FAQ formatting drops pairs
