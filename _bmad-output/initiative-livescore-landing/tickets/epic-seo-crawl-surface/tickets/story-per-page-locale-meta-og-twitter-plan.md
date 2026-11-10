---
title: 'Per-page locale meta OG Twitter'
type: feature
ticket: 3
created: '2026-11-10'
status: done
baseline_revision: '46d009fa136ba8f39fdecf4b841093af5152b539'
route: full
route_source: auto
risk: medium
review: quick
review_source: pinned
lenses_ran:
  - quick
review_loop_iteration: 0
followup_review_recommended: false
context: []
warnings: []
deferred: []
---

<intent-contract>

## Intent

**Problem:** Indexable marketing pages only inherit site-wide layout title/description/OG/Twitter, so every route and locale looks identical to crawlers.

**Approach:** Extend each marketing page's `generateMetadata` with per-page, per-locale title/description plus Open Graph and Twitter card fields, sourced from markdown frontmatter when present otherwise derived claim-safely from that locale's markdown body, while keeping story 3.2 `marketingPageAlternates`.

## Boundaries & Constraints

**Always:** Absolute OG `url` via `absoluteMarketingPageUrl` / host `https://football-live-bot.online`; preserve `marketingPageAlternates` on every page metadata return; claim-safe text only (no predictions/Discord/player-follow/live highlights-cron/personal Premium); reuse existing layout OG/Twitter image paths; locales `ar|en|es|fr|pt|ru`.

**Never:** JSON-LD / `application/ld+json` (story 3.4); live channels API; epic 4; change page jobs/IA/body rendering without need; break canonical/hreflang; delete files; commit `.agents/` / `_bmad/` / `skills-lock.json`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Home EN distinct meta | GET `/en` HTML | `<title>` and meta description differ from pricing/faq; og:title/og:description/twitter:title/twitter:description match page values; alternates from 3.2 still present | 200 |
| Pricing EN distinct | GET `/en/pricing` HTML | title/description/OG/Twitter distinct from home and faq; absolute og:url for that path | 200 |
| FAQ EN distinct | GET `/en/faq` HTML | title/description/OG/Twitter distinct from home and pricing | 200 |
| Home AR locale text | GET `/ar` HTML | title/description (and OG/Twitter mirrors) use Arabic-derived or frontmatter text, not the English layout defaults alone | 200 |
| Pricing AR locale text | GET `/ar/pricing` HTML | Arabic-appropriate distinct meta + OG/Twitter; alternates intact | 200 |
| FAQ AR locale text | GET `/ar/faq` HTML | Arabic-appropriate distinct meta + OG/Twitter; alternates intact | 200 |
| Frontmatter present | md starts with `---` title/description | those values win for title/description/OG/Twitter text | Invalid YAML → fall back to derive |
| No frontmatter | current content/*.md shape | derive distinct title from brand line + lede; description from first body paragraph; claim-safe truncate | Missing file still fails page render as today |

</intent-contract>

## Code Map

- `src/lib/seo-metadata.ts` — extend beside `marketingPageAlternates`; add shared builder returning title/description/openGraph/twitter + `alternates`
- `src/lib/content.ts` — reuse `getPageMarkdown` / `MARKETING_PAGES` / page slugs; optional thin frontmatter parse helper here or inside seo-metadata
- `src/app/[locale]/layout.tsx` — keep site-wide defaults + `metadataBase` + images; do not move page-specific title/desc here
- `src/app/[locale]/**/page.tsx` (8) — existing thin `generateMetadata` returning only `alternates`; extend to call shared page metadata builder with that route's `urlPath` + `MARKETING_PAGES.*`
- `src/data/siteDetails.ts` — brand/`siteUrl` fallbacks only; do not replace per-page values
- Do not change: robots/sitemap, `public/llms*`, JSON-LD, MarketingMarkdownPage body job, epic 4

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/seo-metadata.ts` — add `marketingPageMetadata(locale, urlPath, page)` (async): read locale markdown; prefer YAML frontmatter `title`/`description` when present; else derive distinct claim-safe title/description from brand line + first body paragraph; return Metadata with title, description, openGraph (title/description/url/type + reuse layout image paths), twitter (summary_large_image + title/description + reuse twitter image), and `alternates: marketingPageAlternates(...)`
- [x] `src/app/[locale]/page.tsx` + seven sibling marketing `page.tsx` — make `generateMetadata` async and return `marketingPageMetadata(...)` for that route's urlPath + MARKETING_PAGES slug (keep `isUrlLocale` gate)
- [x] Verify I/O matrix via `next build` + HTTP GET HTML head spot-checks on home/pricing/faq for `en` and `ar`

**Acceptance Criteria:**
- Given the app is running, when GET `/en`, `/en/pricing`, and `/en/faq`, then each HTML head has a distinct title and description and matching og:/twitter: title/description (not only the shared layout defaults), and still includes story 3.2 canonical/hreflang alternates
- Given the app is running, when GET `/ar`, `/ar/pricing`, and `/ar/faq`, then each HTML head has distinct locale-appropriate (Arabic-sourced) title/description with matching OG/Twitter tags, and alternates remain intact

## Implementation Notes

### 2026-11-10 — per-page locale meta OG/Twitter

**Decisions:**
- Extended `src/lib/seo-metadata.ts` with async `marketingPageMetadata(locale, urlPath, page)` beside existing `marketingPageAlternates`; thin optional YAML frontmatter parse for `title`/`description` only (no new deps); invalid/unclosed YAML falls back to derive from full markdown.
- Derive path: brand = first non-empty line; description = first body paragraph (~160 chars, word-boundary truncate); title = `brand — ledeFirstSentence` (~70 chars). OG `url` via `absoluteMarketingPageUrl`; images reuse layout paths `/images/og-image.jpg` and `/images/twitter-image.jpg`.
- All eight marketing `page.tsx` `generateMetadata` are async, keep `isUrlLocale` gate, return `marketingPageMetadata(...)` for that route's urlPath + `MARKETING_PAGES` slug.
- Layout site-wide defaults kept as fallbacks; no JSON-LD; `MarketingMarkdownPage` body job unchanged (current content has no frontmatter).
- Frontmatter `context: []` was empty; Code Map files were loaded instead.

**Files touched:**
- `src/lib/seo-metadata.ts`
- `src/app/[locale]/page.tsx`
- `src/app/[locale]/guide/groups/page.tsx`
- `src/app/[locale]/guide/channels/page.tsx`
- `src/app/[locale]/official-channels/page.tsx`
- `src/app/[locale]/pricing/page.tsx`
- `src/app/[locale]/faq/page.tsx`
- `src/app/[locale]/privacy/page.tsx`
- `src/app/[locale]/terms/page.tsx`
- this plan (tasks + notes only)

**Verification:**
- `pnpm exec next build` — success (Next 14.2.35)
- `pnpm exec next start -p 4326 -H 127.0.0.1` then GET `/en`, `/en/pricing`, `/en/faq`, `/ar`, `/ar/pricing`, `/ar/faq` — 200; distinct per-page title/description; og:/twitter: mirrors; absolute og:url; Arabic-sourced text on `/ar*`; canonical + six `hrefLang` + `x-default` intact

**Surprises / risks:**
- If frontmatter is added to markdown later without stripping in the body pipeline, `MarketingMarkdownPage` would render the YAML block; meta would still prefer frontmatter. Strip-on-read deferred (plan: do not change body job without need).
- Title soft-cap ~70 can cut Arabic mid-phrase (expected truncate).
- Exported `pageMetaTextFromMarkdown` for matrix verification of frontmatter vs derive (parent verify pass); re-ran `next build` + GET spot-checks on `:4330` + `pnpm dlx tsx` frontmatter asserts — all OK.

## Plan Change Log

## Review Triage Log

### 2026-11-10 — Review pass
- verdicts: 2 findings — high 0, medium 1, low 1, false 0, maybe-false 0
- findings:
  - `[medium]` `[patch]` privacy/terms derive used `TODO` as brand — fixed: skip sole-token `TODO` brand lines so brand/`lede` come from the real body (`Live Score` + placeholder paragraph)
  - `[low]` `[patch]` successful frontmatter parse with empty body fell back to raw markdown via `body || markdown` — fixed: pass stripped `body` as-is after successful parse

## Design Notes

Content files today have no YAML frontmatter; first line is usually the brand ("Live Score"). Distinct titles: `brand — ledeFirstSentence` (truncated). Descriptions: first body paragraph truncated (~155–160 chars). Optional frontmatter overrides when added later. OG `url` = `absoluteMarketingPageUrl(locale, urlPath)`. Images stay layout defaults (`/images/og-image.jpg`, `/images/twitter-image.jpg`).

Golden:
- `/en/pricing` title contains pricing lede signal, not identical to `/en` or `/en/faq`
- `/ar` meta text is Arabic-derived, not English layout-only defaults

## Verification

**Commands:**
- `pnpm exec next build` -- expected: success
- After `pnpm exec next start`, GET `/en`, `/en/pricing`, `/en/faq`, `/ar`, `/ar/pricing`, `/ar/faq` -- expected: distinct per-page title/description + og/twitter mirrors; ar uses Arabic-sourced text; canonical + six hreflang + x-default still present

## Auto Run Result

- Summary: Every indexable marketing page now emits per-locale title/description plus Open Graph and Twitter card metadata via shared `marketingPageMetadata`, while preserving story 3.2 `marketingPageAlternates`. Text prefers optional YAML frontmatter, else claim-safe derive from markdown body (skipping `TODO` placeholders).
- Files changed:
  - `src/lib/seo-metadata.ts` — `marketingPageMetadata` + frontmatter/derive helpers; `pageMetaTextFromMarkdown` export; TODO skip + empty-body frontmatter fix
  - `src/app/[locale]/page.tsx` and seven sibling marketing pages — async `generateMetadata` → `marketingPageMetadata`
  - this plan — full plan + review/finalize
- Review: 2 findings; 2 patches; 0 deferred; 0 rejected
- Follow-up review recommendation: `false`
- Patched counts: high 0, medium 1, low 1
- Verification: `pnpm exec next build` success; `next start` GET `/en|/en/pricing|/en/faq|/ar|/ar/pricing|/ar/faq` — distinct titles, OG/Twitter mirrors, absolute og:url, Arabic-sourced `/ar*`, canonical + hreflang intact; privacy/terms no longer `TODO` titles; `pnpm dlx tsx` frontmatter/empty-body/TODO matrix asserts OK
- Residual risks: if YAML frontmatter is later added to markdown without stripping in `MarketingMarkdownPage`, YAML may render in the page body (meta still correct); title soft-cap ~70 can truncate Arabic mid-phrase
