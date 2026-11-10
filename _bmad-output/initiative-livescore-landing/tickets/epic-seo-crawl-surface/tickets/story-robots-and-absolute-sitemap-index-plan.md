---
title: 'Robots and absolute sitemap index'
type: feature
ticket: 1
created: '2026-11-10'
status: built
baseline_revision: '3c005f922ce361ab4e5fe9315fee62e8aa995965'
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

**Problem:** No crawl kit yet — crawlers lack `robots.txt` and a complete absolute-URL sitemap for the locked 8 routes × 6 locales.

**Approach:** Ship `robots.txt` that allows indexable locale marketing pages and points at a sitemap index; emit a sitemap index plus per-locale sitemaps with absolute `https://football-live-bot.online` URLs for all 8 locked routes × 6 URL locales (including `official-channels`).

## Boundaries & Constraints

**Always:** Absolute host `https://football-live-bot.online` (from `siteDetails.siteUrl`); reuse `MARKETING_SITEMAP` + `locales` / URL locale slugs `ar|en|es|fr|pt|ru`; Decision shape = sitemap index + per-locale sitemaps; robots points at the index; claim-safe / no invented product surface.

**Never:** Live channels API; epic 4; change page jobs/IA/content bodies without need; own or change `metadataBase`/`siteUrl` ownership beyond reading it; `llms*`, canonical/hreflang, per-page meta, JSON-LD (later stories); delete files; commit `.agents/` / `_bmad/` / `skills-lock.json`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Robots allow + sitemap | GET `/robots.txt` | Allows locale marketing crawl; `Sitemap:` absolute URL to sitemap index | 200 text/plain |
| Sitemap index | GET sitemap index URL | Lists absolute URLs for all six per-locale sitemaps | 200 application/xml |
| Per-locale sitemap | GET each locale sitemap | 8 absolute `football-live-bot.online` URLs (home, guide/groups, guide/channels, official-channels, pricing, faq, privacy, terms) | 200; unknown locale → 404 |
| Absolute host | Any sitemap URL entry | Starts with `https://football-live-bot.online/` and uses URL locale prefix (incl. `/pt/…`) | No relative or wrong-host URLs |

</intent-contract>

## Code Map

- `src/data/siteDetails.ts` — `siteUrl: "https://football-live-bot.online"` (reuse; do not change ownership)
- `src/lib/content.ts` — `MARKETING_SITEMAP` (8 locked `urlPath` entries) — reuse for URL emission
- `src/i18n/routing.ts` — `locales` / `UrlLocale` (`ar|en|es|fr|pt|ru`) — reuse URL prefixes
- `src/middleware.ts` — matcher only `/` + `/(ar|en|es|fr|pt|ru)/:path*` — root SEO routes stay outside next-intl (do not broaden matcher onto robots/sitemaps)
- `src/app/` — no existing `robots.ts` / sitemap routes — add here
- Do not change: locale page jobs under `src/app/[locale]/**`, content markdown, epic-4 channels API

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/seo-sitemap.ts` — shared builders: absolute page URLs from `siteDetails.siteUrl` + `locales` + `MARKETING_SITEMAP`; absolute per-locale sitemap locs for the index — single source for 8×6 coverage
- [x] `src/app/robots.ts` — `MetadataRoute.Robots`: allow indexable marketing surface; `sitemap` = absolute sitemap-index URL
- [x] `src/app/sitemap.xml/route.ts` — sitemap **index** XML listing absolute per-locale sitemap URLs
- [x] `src/app/sitemaps/[locale]/route.ts` — per-locale urlset (8 absolute page URLs); invalid locale → 404
- [x] Verify against I/O matrix via `next build` + HTTP GETs on production-like `next start`

**Acceptance Criteria:**
- Given the app is running, when GET `/robots.txt`, then body allows crawling locale marketing pages and references the sitemap index with an absolute `football-live-bot.online` URL
- Given the app is running, when GET the sitemap index, then it lists absolute URLs for all six per-locale sitemaps
- Given the app is running, when GET each per-locale sitemap, then it lists exactly the eight locked routes for that locale as absolute `https://football-live-bot.online/...` URLs (home, guide/groups, guide/channels, official-channels, pricing, faq, privacy, terms)
- Given all six locale sitemaps, when URLs are counted across locales, then coverage is 8×6 with URL prefixes `ar|en|es|fr|pt|ru` (not product id `pt-BR` in paths)

## Implementation Notes

- Per-locale handler at `src/app/sitemaps/[locale]/route.ts` (plan path). Public `/sitemaps/{locale}.xml` via `next.config.mjs` rewrite → `/sitemaps/:locale` (folder `[locale].xml` is treated as a literal segment by Next 14, so rewrite is required).
- Shared builders in `src/lib/seo-sitemap.ts`; robots allow `/` + absolute sitemap index; no middleware matcher changes.
- `generateStaticParams` for the six URL locales; invalid locale → 404 from the route handler.
- Verified 2026-11-10: `pnpm exec next build` OK; `next start` GETs — robots allow + absolute Sitemap; index has 6 locs; each locale sitemap 8 absolute URLs; 48 total; `/sitemaps/xx.xml` → 404.

## Plan Change Log


## Review Triage Log

### 2026-11-10 — Review pass
- verdicts: 1 findings — high 0, medium 0, low 0, false 1, maybe-false 0
- findings:
  - `[false]` `[reject]` Review package allegedly missing `next.config.mjs` rewrite so `/sitemaps/{locale}.xml` would 404 — tree `next.config.mjs` already rewrites `/sitemaps/:locale.xml` → `/sitemaps/:locale`; HTTP GET matrix on `next start` returned 200×6 locale sitemaps + 48 absolute URLs (review-diff staging artifact only)

## Design Notes

Next.js 14 `generateSitemaps` yields `/sitemap/[id].xml` chunks but does **not** emit a sitemap-index document; Decision requires an explicit index. Prefer route handlers:

- Index at `/sitemap.xml` (`app/sitemap.xml/route.ts`)
- Per-locale at `/sitemaps/{locale}.xml` (`app/sitemaps/[locale]/route.ts`)

`robots` `Sitemap:` → `https://football-live-bot.online/sitemap.xml`.

Golden page URL: `https://football-live-bot.online/en/guide/groups` (empty `urlPath` → `https://football-live-bot.online/{locale}` with no trailing slash inconsistency vs existing `siteUrl`).

## Verification

**Commands:**
- `pnpm exec next build` -- expected: success
- After `pnpm exec next start`, GET `/robots.txt` -- expected: allow for locale pages; `Sitemap: https://football-live-bot.online/sitemap.xml`
- GET `/sitemap.xml` -- expected: sitemapindex with six absolute `/sitemaps/{locale}.xml` locs
- GET `/sitemaps/{ar,en,es,fr,pt,ru}.xml` each -- expected: 8 absolute `https://football-live-bot.online/{locale}/…` URLs covering the locked set (48 total across locales)

## Auto Run Result

- Summary: Shipped robots.txt (Allow `/` + absolute Sitemap to index), sitemap index at `/sitemap.xml`, and six per-locale sitemaps at `/sitemaps/{locale}.xml` with absolute `https://football-live-bot.online` URLs for all 8 locked routes × 6 locales (48).
- Files changed:
  - `src/lib/seo-sitemap.ts` — absolute URL + XML builders from `siteUrl` / `locales` / `MARKETING_SITEMAP`
  - `src/app/robots.ts` — MetadataRoute robots pointing at sitemap index
  - `src/app/sitemap.xml/route.ts` — sitemap index XML
  - `src/app/sitemaps/[locale]/route.ts` — per-locale urlset + invalid locale 404
  - `next.config.mjs` — rewrite `/sitemaps/:locale.xml` → `/sitemaps/:locale`
  - this plan — full plan + review/finalize
- Review: 1 finding rejected (`false` — incomplete review-diff staging); 0 patches; 0 deferred
- Follow-up review recommendation: `false`
- Patched counts: high 0, medium 0, low 0
- Verification: `pnpm exec next build` success; `next start` GET `/robots.txt` allow + absolute Sitemap; `/sitemap.xml` 6 absolute locale locs; six locale sitemaps 8 URLs each; total 48; `/sitemaps/xx.xml` → 404
- Residual risks: public `.xml` contract depends on Next rewrite; bare `/sitemaps/{locale}` also serves (harmless)
