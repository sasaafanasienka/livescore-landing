---
title: 'Canonical and hreflang alternates'
type: feature
ticket: 2
created: '2026-11-10'
status: built
baseline_revision: 'ead69f1b5b19922b6e93f60a41aca51b603ec11c'
route: full
route_source: auto
risk: high
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

**Problem:** Indexable marketing pages lack self-canonical and reciprocal hreflang alternates, so crawlers cannot map the six-locale surface.

**Approach:** Emit per-page Next.js Metadata `alternates` with absolute self-canonical under `https://football-live-bot.online` plus hreflang for `ar|en|es|fr|pt|ru` and `x-default` → en URL of the same page.

## Boundaries & Constraints

**Always:** Absolute host from `siteDetails.siteUrl`; reuse `absoluteMarketingPageUrl` / `locales` / `MARKETING_SITEMAP` urlPaths; hreflang keys = URL slugs (`pt`, not `pt-BR`); `x-default` = en alternate of the same path; claim-safe; only metadata/canonical/hreflang helpers + page/layout metadata.

**Never:** Live channels API; epic 4; change page jobs/IA/content bodies without need; edit `public/llms*`; edit robots/sitemap routes except shared-helper imports if required; delete files; commit `.agents/` / `_bmad/` / `skills-lock.json`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Home self-canonical | GET `/en` HTML | `<link rel="canonical" href="https://football-live-bot.online/en">` | 200 |
| Guide self-canonical | GET `/en/guide/groups` HTML | canonical `https://football-live-bot.online/en/guide/groups` | 200 |
| Full hreflang set | Either spot-check page | six `hreflang` (`ar` `en` `es` `fr` `pt` `ru`) + `x-default` pointing at the **en** URL of that same path | Absolute host; `pt` not `pt-BR` in href/hreflang |
| Reciprocal paths | Any locale of a locked route | languages map uses same `urlPath` across locales via `absoluteMarketingPageUrl` | Invalid locale still 404 via existing layout |

</intent-contract>

## Code Map

- `src/lib/seo-sitemap.ts` — reuse `absoluteMarketingPageUrl`, `isUrlLocale`; do not change sitemap builders/routes
- `src/i18n/routing.ts` — reuse `locales` / `UrlLocale` (`ar|en|es|fr|pt|ru`); `productLocales.pt → pt-BR` is content-only, not hreflang
- `src/lib/content.ts` — `MARKETING_SITEMAP` urlPaths for the eight locked routes
- `src/data/siteDetails.ts` — `siteUrl` already used by sitemap helper (read-only)
- `src/app/[locale]/layout.tsx` — existing `metadataBase` + static site-wide metadata; keep `metadataBase`; do not put page-specific canonical here
- `src/app/[locale]/**/page.tsx` (8 pages) — currently no `generateMetadata`; add thin wrappers calling the new helper with each page's `urlPath`
- Do not change: `src/app/robots.ts`, sitemap routes, `public/llms*`, markdown content, middleware matcher

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/seo-metadata.ts` — add `marketingPageAlternates(locale, urlPath)` returning Next `Metadata['alternates']`: self-canonical absolute URL for the active locale + `languages` map for all six URL locales + `x-default` → en absolute URL; reuse `absoluteMarketingPageUrl` / `locales` / `isUrlLocale`
- [x] `src/app/[locale]/page.tsx` + seven sibling marketing `page.tsx` files — export `generateMetadata` that validates locale and returns `{ alternates: marketingPageAlternates(...) }` with that route's `urlPath` from `MARKETING_SITEMAP`
- [x] Verify I/O matrix via `next build` + HTTP GET HTML head spot-checks on `/en` and `/en/guide/groups` under `next start`

**Acceptance Criteria:**
- Given the app is running, when GET `/en`, then HTML head contains self-canonical `https://football-live-bot.online/en` and hreflang alternates for `ar` `en` `es` `fr` `pt` `ru` plus `x-default` pointing at `https://football-live-bot.online/en`
- Given the app is running, when GET `/en/guide/groups`, then HTML head contains self-canonical `https://football-live-bot.online/en/guide/groups` and the six locale hreflangs plus `x-default` all targeting the same path under each locale with `x-default` → the en URL

## Implementation Notes

### 2026-11-10 — canonical + hreflang

**Decisions:**
- New helper `marketingPageAlternates(locale, urlPath)` in `src/lib/seo-metadata.ts` builds absolute `canonical` + `languages` (all six URL locales from `locales` + `x-default` → en) via `absoluteMarketingPageUrl`; hreflang key is URL slug `pt` (not `pt-BR`).
- Each of the eight marketing `page.tsx` files exports thin `generateMetadata` that gates on `isUrlLocale` (empty metadata if invalid; layout still 404s) and passes the locked `MARKETING_SITEMAP` `urlPath` string for that route.
- Absolute URLs intentionally, even with layout `metadataBase`, so preview/host drift cannot relativize hreflang.
- Frontmatter `context: []` was empty; Code Map files were loaded instead.

**Files touched:**
- `src/lib/seo-metadata.ts` (new)
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
- `pnpm exec next start -p 4325 -H 127.0.0.1` then GET `/en` and `/en/guide/groups` — 200; absolute self-canonical; six `hreflang` (`ar|en|es|fr|pt|ru`) + `x-default` → en URL of the same path; `pt` not `pt-BR`

**Surprises:**
- Many local ports already occupied / some (`3500`) returned `EACCES`; used `127.0.0.1:4325` after free-port scan.
- Context7 MCP not available in this session; Next Metadata `alternates` shape confirmed via Next.js docs instead.

## Plan Change Log

## Review Triage Log

### 2026-11-10 — Review pass
- verdicts: 0 findings — high 0, medium 0, low 0, false 0, maybe-false 0
- findings:
  - (none)

## Design Notes

Next Metadata API: `alternates.canonical` + `alternates.languages` (keys include `x-default`). Prefer absolute URLs from `absoluteMarketingPageUrl` so preview/host drift cannot relativize hreflang incorrectly even though `metadataBase` is already set.

Golden:
- `/en` → canonical `https://football-live-bot.online/en`; `languages.pt` → `https://football-live-bot.online/pt`; `x-default` → en URL
- `/en/guide/groups` → canonical `…/en/guide/groups`; `x-default` → `…/en/guide/groups`

## Verification

**Commands:**
- `pnpm exec next build` -- expected: success
- After `pnpm exec next start`, GET `/en` and `/en/guide/groups` -- expected: head has absolute self-canonical under `https://football-live-bot.online` and six hreflang + `x-default=en` for that page path

## Auto Run Result

- Summary: Every indexable marketing page now emits absolute self-canonical plus reciprocal hreflang for `ar|en|es|fr|pt|ru` with `x-default` → en via shared `marketingPageAlternates` and per-page `generateMetadata`.
- Files changed:
  - `src/lib/seo-metadata.ts` — absolute canonical + languages helper reusing `absoluteMarketingPageUrl` / `locales`
  - `src/app/[locale]/page.tsx` and seven sibling marketing pages — thin `generateMetadata` wrappers with locked `urlPath`s
  - this plan — full plan + review/finalize
- Review: 0 findings; 0 patches; 0 deferred
- Follow-up review recommendation: `false`
- Patched counts: high 0, medium 0, low 0
- Verification: `pnpm exec next build` success; `next start` GET `/en` and `/en/guide/groups` — absolute self-canonical under `https://football-live-bot.online`; six `hrefLang` + `x-default` → en URL of the same path; `pt` not `pt-BR`
- Residual risks: spot-check covered two URLs only (plan verify); remaining six routes share the same helper pattern
