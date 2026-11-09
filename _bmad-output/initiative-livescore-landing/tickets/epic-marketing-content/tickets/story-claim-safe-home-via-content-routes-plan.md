---
title: 'Claim-safe home via content routes'
type: feature
ticket: 1
created: '2026-11-09'
status: done
baseline_revision: 'd586ab6139682b6d18ad75d161c063a56ef967c3'
route: oneshot
route_source: pinned
risk: medium
review: quick
review_source: pinned
lenses_ran:
  - quick
review_loop_iteration: 0
followup_review_recommended: true
context:
  - C:/DIY/livescore-landing/_bmad-output/initiative-livescore-landing/sources/SERVICE-CAPABILITIES.md
warnings: []
deferred: []
---

<intent-contract>

## Intent

**Problem:** Home still serves placeholder `content/{locale}/home.md` bodies; the marketing URL↔file sitemap for sibling pages is not locked in-repo beyond the home slug note.

**Approach:** Lock the sitemap page-route contract in `content/README.md` (+ thin page-slug map next to the existing loader), replace all six locale home bodies with claim-safe Live Score copy from SERVICE-CAPABILITIES, keep the existing LiveScoreAppBot CTA on `/[locale]`.

</intent-contract>

## Implementation Notes

Oneshot: tracer is content + contract docs/map reuse of `getPageMarkdown` / `[locale]/page.tsx` — no new page routes, SEO, CMS, or nav. Sibling stories own guides/pricing/FAQ/legal/channels.

- Kept CTA on `src/app/[locale]/page.tsx` via `siteDetails.botUrl` (`https://t.me/LiveScoreAppBot`); Shell.cta label unchanged.
- Added `MARKETING_PAGES` + `MARKETING_SITEMAP` in `src/lib/content.ts`; home page loads `MARKETING_PAGES.home`.
- Replaced placeholder bodies in `content/{ar,en,es,fr,pt-BR,ru}/home.md` with claim-safe copy (chat Premium facts only; no forbidden claims).
- Extended `content/README.md` with locked sitemap URL↔file map.
- Review patches: fixed RU free-quota phrasing; pt-BR lexicon (`equipe`/`registram-se`/`gerenciar`); corrected `MARKETING_SITEMAP` JSDoc.
- Files touched: `src/lib/content.ts`, `src/app/[locale]/page.tsx`, `content/README.md`, six `home.md`, this plan.

## Plan Change Log

## Review Triage Log

### 2026-11-09 — Review pass
- verdicts: 3 findings — high 0, medium 2, low 1, false 0, maybe-false 0
- findings:
  - `[medium]` `[patch]` RU free-quota grammar broken in `content/ru/home.md` — fixed to «бесплатно одно избранное — команда или лига»
  - `[low]` `[patch]` `MARKETING_SITEMAP` JSDoc claimed locale-prefixed paths — comment corrected to path under `/{locale}/` without locale prefix
  - `[medium]` `[patch]` `content/pt-BR/home.md` used PT-PT lexicon — switched to pt-BR (`equipe`, `registram-se`, `gerenciar`)

## Verification

**Commands:**
- `pnpm exec next build` -- expected: success
- After `pnpm exec next start` (or `next dev`), for each of `/ar` `/en` `/es` `/fr` `/pt` `/ru`: HTTP 200; body contains distinctive claim-safe phrases from that locale's `content/{productLocale}/home.md` (`pt` → `pt-BR`); body contains `https://t.me/LiveScoreAppBot` (CTA href); body must not contain predictions / Discord / player-follow / live highlights-cron / personal Premium claims

**Manual checks (if no CLI):**
- Spot-read all six `home.md` against SERVICE-CAPABILITIES; Chat Premium only as 49 Stars / 30d / 24h grace / free 1 team|league if mentioned
- `content/README.md` lists locked sitemap URL↔file map for sibling stories

## Auto Run Result

- Summary: Tracer locked marketing URL↔file sitemap + `MARKETING_PAGES`/`MARKETING_SITEMAP`, replaced six locale `home.md` placeholders with claim-safe Live Score copy, kept LiveScoreAppBot CTA on `/[locale]`.
- Files changed:
  - `src/lib/content.ts` — page slug map + sitemap constants
  - `src/app/[locale]/page.tsx` — load `MARKETING_PAGES.home`
  - `content/README.md` — locked sitemap documentation
  - `content/{ar,en,es,fr,pt-BR,ru}/home.md` — claim-safe home bodies
  - this plan — oneshot plan + review/finalize
- Review: 3 findings patched (2 medium locale copy, 1 low JSDoc); 0 deferred; 0 rejected
- Follow-up review recommendation: `true` — two medium copy patches (RU + pt-BR) were applied without a second lens pass; residual risk is remaining locale-wording drift in home bodies
- Patched counts: high 0, medium 2, low 1
- Verification: `pnpm exec next build` success; HTTP 200 + distinctive phrases + bot CTA + forbidden-claim scan pass for `/ar|/en|/es|/fr|/pt|/ru` (post-patch re-verify pass)
- Residual risks: sibling routes not implemented yet (expected); follow-up review recommended for locale copy polish
- Commit: `54985863ea4dd8d9739530e6dfbeaa168d0663ac`
