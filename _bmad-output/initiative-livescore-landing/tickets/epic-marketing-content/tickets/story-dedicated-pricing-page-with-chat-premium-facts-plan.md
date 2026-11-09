---
title: 'Dedicated pricing page with chat Premium facts'
type: feature
ticket: 2
created: '2026-11-09'
status: built
baseline_revision: '72b6874d660b5489ab2db74a99027de2343ded35'
route: oneshot
route_source: pinned
risk: high
review: quick
review_source: pinned
lenses_ran:
  - quick
review_loop_iteration: 0
followup_review_recommended: false
context:
  - C:/DIY/livescore-landing/_bmad-output/initiative-livescore-landing/sources/SERVICE-CAPABILITIES.md
warnings: []
deferred: []
---

<intent-contract>

## Intent

**Problem:** `/[locale]/pricing` is missing; Premium facts live only as a home summary, so the locked sitemap pricing URL 404s and chat Premium facts have no dedicated claim-safe surface.

**Approach:** Add `/{locale}/pricing` mirroring the home page loader/CTA pattern, ship six locale `pricing.md` bodies with exact chat Premium facts only (49 Stars / 30 days / 24h grace / free 1 team|league), brand Live Score, CTA LiveScoreAppBot.

</intent-contract>

## Implementation Notes

Oneshot: reuse `MARKETING_PAGES.pricing` / `getPageMarkdown` / home page shell; new route + six content files only — no SEO kit, CMS, nav epic, channels API, or personal Premium.

- Added `src/app/[locale]/pricing/page.tsx` mirroring home: locale guard, `getPageMarkdown(..., MARKETING_PAGES.pricing)`, CTA via `siteDetails.botUrl`.
- Wrote claim-safe `content/{ar,en,es,fr,pt-BR,ru}/pricing.md` with Chat Premium 49 Stars / 30 days / 24h grace / free 1 team|league; brand Live Score; no forbidden claims; avoided the string “personal Premium” so omit-scan stays green (personal = free favourites alerts only).
- `MARKETING_PAGES` / `MARKETING_SITEMAP` already listed pricing — unchanged.

## Plan Change Log

## Review Triage Log

### 2026-11-09 — Review pass
- verdicts: 0 findings — high 0, medium 0, low 0, false 0, maybe-false 0
- findings:

## Verification

**Commands:**
- `pnpm exec next build` -- expected: success
- After `pnpm exec next start` (or `next dev`), for each of `/ar/pricing` `/en/pricing` `/es/pricing` `/fr/pricing` `/pt/pricing` `/ru/pricing`: HTTP 200; body contains facts from that locale's `content/{productLocale}/pricing.md` (`pt` → `pt-BR`) including **49** Stars, **30** days, **24** h grace, free **1** team|league; body contains `https://t.me/LiveScoreAppBot`; body omits predictions / Discord / player-follow / live highlights-cron / personal Premium

**Manual checks (if no CLI):**
- Spot-read all six `pricing.md` against SERVICE-CAPABILITIES Premium table only
- Confirm no personal Premium product sold; Chat Premium for group/channel only

## Auto Run Result

- Summary: Dedicated `/{locale}/pricing` route + six claim-safe `pricing.md` bodies with exact Chat Premium facts (49 Stars / 30 days / 24h grace / free 1 team|league); CTA LiveScoreAppBot; no personal Premium / forbidden claims.
- Files changed:
  - `src/app/[locale]/pricing/page.tsx` — locale pricing page mirroring home loader/CTA
  - `content/{ar,en,es,fr,pt-BR,ru}/pricing.md` — claim-safe Chat Premium copy
  - this plan — oneshot plan + review/finalize
- Review: 0 findings; 0 patched; 0 deferred; 0 rejected
- Follow-up review recommendation: `false` — no patches this pass
- Patched counts: high 0, medium 0, low 0
- Verification: `pnpm exec next build` success; HTTP 200 + Premium facts + bot CTA + forbidden-claim omit scan pass for `/ar|/en|/es|/fr|/pt|/ru` `/pricing`
- Residual risks: nav/footer Pricing link still epic sibling work; locale wording polish possible without second lens
- Commit: `f9c937cf8d2c10e4556c40346dace224a3ab0a90`
