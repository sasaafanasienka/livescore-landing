---
title: 'SEO single-page crawl surface'
type: feature
ticket: ''
created: '2026-11-10'
status: built
baseline_revision: '52e4d26ec416377332b5b629612d00713f80315b'
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - docs/seo-audit-2026-11-10.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The site still exposes 8 marketing routes × 6 locales (48 URLs) while the real product is one longform home per locale; the extra routes are thin/orphan/TODO and must not be indexed.

**Approach:** Collapse the crawl/route surface to 6 locale homes only: delete the seven marketing sub-routes and their markdown, shrink MARKETING_SITEMAP, enrich home-only sitemaps (lastmod + hreflang), add locale 404, update contracts. Brand/meta/JSON-LD/llms/footer legal/GA/GSC/FAQ-DOM/ISR/OG are deferred follow-ups.

## Boundaries & Constraints

**Always:**
- Indexable URLs after this ship: only `/{ar|en|es|fr|pt|ru}`.
- Delete seven marketing subpage route trees under `src/app/[locale]/` (`guide/`, `official-channels/`, `pricing/`, `faq/`, `privacy/`, `terms/`) and matching `content/*/{guide-groups,guide-channels,official-channels,pricing,faq,privacy,terms}.md`. Human authorized these deletions.
- Shrink `MARKETING_PAGES` / `MARKETING_SITEMAP` to home only; sitemap urlset emits one loc per locale with `lastmod` + xhtml hreflang alternates (+ x-default → en).
- Deleted paths return real 404 (locale `not-found`), not soft-200. No redirects.
- Keep `GET /api/official-channels`, home `OfficialChannelsHome`, and home longform landing.
- Update `scripts/contracts/home-landing.contract.ts` so it no longer requires dedicated pricing/faq pages.

**Never:**
- Implement brand rename, home meta rewrite, JSON-LD enrichment, llms rewrite, footer Telegram legal links, GA/GSC, FAQ/tab crawl visibility, ISR, or OG wiring in this plan (deferred).
- Delete unrelated files (home content, API, shell, images except unused route code/content listed above).
- Invent new marketing routes.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Sitemap locale | GET `/sitemaps/en.xml` | Exactly one `<url>` → `…/en`, with `lastmod` + 6 hreflang + x-default | Invalid locale → existing 404 |
| Deleted route | GET `/en/pricing` (and peers) | HTTP 404 | Locale not-found UI |
| Home still works | GET `/en` | 200, HomeLanding renders | — |
| Sitemap index | GET `/sitemap.xml` | Lists six per-locale sitemap locs | — |

</frozen-after-approval>

## Code Map

- `src/lib/content.ts` — shrink `MARKETING_PAGES` / `MARKETING_SITEMAP` to home only.
- `src/lib/seo-sitemap.ts` — `buildUrlsetXml` gains `lastmod` + xhtml `hreflang` alternates for home locs; `localeMarketingPageUrls` becomes one URL.
- `src/app/sitemaps/[locale]/route.ts`, `src/app/sitemap.xml/route.ts`, `src/app/robots.ts` — consumers; adjust if signatures change.
- Delete: `src/app/[locale]/{guide,official-channels,pricing,faq,privacy,terms}/**`.
- Delete: `content/{ar,en,es,fr,pt-BR,ru}/{guide-groups,guide-channels,official-channels,pricing,faq,privacy,terms}.md`.
- Remove `src/components/MarketingMarkdownPage.tsx` if nothing imports it after route deletion.
- `scripts/contracts/home-landing.contract.ts` — replace “dedicated pricing + faq routes still present” with asserts those paths are absent.
- Add `src/app/[locale]/not-found.tsx` — locale-aware 404 shell.
- Keep: `src/app/[locale]/page.tsx`, `HomeLanding`, `api/official-channels`, `official-channels.ts`.
- `content/README.md` — update route/content map if it still lists 8 pages.

## Tasks & Acceptance

**Execution:**
- [ ] `src/lib/content.ts` — MARKETING_SITEMAP / MARKETING_PAGES = home only
- [ ] `src/lib/seo-sitemap.ts` (+ sitemap routes) — home-only locs; lastmod + xhtml hreflang
- [ ] Delete seven locale marketing route trees + matching content md; drop unused `MarketingMarkdownPage`
- [ ] `src/app/[locale]/not-found.tsx` — real 404 UI under locale layout
- [ ] `scripts/contracts/home-landing.contract.ts` — assert deleted routes gone
- [ ] `content/README.md` — document 6-home surface if outdated

**Acceptance Criteria:**
- Given production build, when GET `/sitemaps/{locale}.xml`, then exactly one home `loc` with `lastmod` and xhtml alternates for all six locales + x-default
- Given GET `/en/pricing` (and other deleted paths), when requested, then 404
- Given GET `/en`, when requested, then 200 with HomeLanding
- Given `home-landing.contract.ts`, when run, then pass without requiring pricing/faq page files

## Implementation Notes

## Plan Change Log

## Review Triage Log

- 2026-11-10 quick pass — verdicts high=0 medium=1 low=1 false=3 maybe-false=0; routes: patch=1 defer=2 reject-false=3
  - false — brand rename in siteDetails/BrandMark/messages — carried from pre-existing dirty longform tree before this plan’s implementer; frozen Never deferred brand; SEO implementer did not touch those files
  - false — siteDetails metadata.title rewrite — same pre-existing dirty longform diff vs baseline; deferred meta ship
  - false — moreLink/seeAll leftover copy fields — unused before this ship; UI never rendered them; not a regression from route deletion
  - defer (medium) — public/llms.txt + llms-full.txt still list 8×6 routes after deletion — real drift; frozen Never deferred llms rewrite; already recorded in deferred-work split entry
  - defer (medium) — Organization sameAs uses botUrl Mini App deep link — pre-existing dirty siteDetails.botUrl change; JSON-LD enrichment deferred
  - patch — OfficialChannelsList.tsx orphan after deleting official-channels page — deleted unused component; grep clean; check:home-landing 9/9

## Design Notes

Sitemap urlset should include `xmlns:xhtml` and per-url:
```xml
<url>
  <loc>https://football-live-bot.online/en</loc>
  <lastmod>YYYY-MM-DD</lastmod>
  <xhtml:link rel="alternate" hreflang="en" href="…/en"/>
  …six locales…
  <xhtml:link rel="alternate" hreflang="x-default" href="…/en"/>
</url>
```
`lastmod`: build time ISO date is acceptable for this ship (content mtime optional).

## Verification

**Commands:**
- `pnpm exec tsx scripts/contracts/home-landing.contract.ts` — expected: pass
- `pnpm build` — expected: success; no pricing/faq/guide/privacy/terms/official-channels page routes in build output
- Spot-check after `pnpm exec next start -p 3005`: `/en` = 200; `/en/pricing` = 404; `/sitemaps/en.xml` = one url + lastmod + hreflang
