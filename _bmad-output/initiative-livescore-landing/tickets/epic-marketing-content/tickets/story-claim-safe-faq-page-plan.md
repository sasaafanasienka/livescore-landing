---
title: 'Claim-safe FAQ page'
type: feature
ticket: 5
created: '2026-11-09'
status: built
baseline_revision: 'a927aa02ab8caab06d2da272c63388b0d7b2c650'
route: oneshot
route_source: pinned
risk: medium
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

**Problem:** `/[locale]/faq` is missing; locked sitemap FAQ URL 404s and there is no claim-safe Q&A surface for bot identity, audiences, and Chat Premium quota facts.

**Approach:** Add `/{locale}/faq` mirroring the pricing page loader/CTA pattern (`MARKETING_PAGES.faq` / `getPageMarkdown` / `siteDetails.botUrl`), ship six locale `faq.md` bodies covering bot `LiveScoreAppBot`, personal/group/channel(+Mini App) audiences, and Chat Premium 49 Stars / 30 days / 24h grace / free 1 team|league — catalog facts only, omit non-goals.

</intent-contract>

## Implementation Notes

Oneshot: reuse `MARKETING_PAGES.faq` (already mapped) + pricing page shell; new route + six content files only — no SEO kit, CMS, nav epic, channels API, or personal Stars plan claims. Avoid the exact string “personal Premium” so omit-scan stays green; say personal profiles have no Stars upgrade instead.

- Added `src/app/[locale]/faq/page.tsx` mirroring pricing: locale guard, `getPageMarkdown(..., MARKETING_PAGES.faq)`, CTA via `siteDetails.botUrl`.
- Wrote claim-safe `content/{ar,en,es,fr,pt-BR,ru}/faq.md` covering bot identity (`LiveScoreAppBot`), audiences (personal/group/channel + Mini App), and Chat Premium 49 Stars / 30 days / 24h grace / free 1 team|league; no forbidden claims; avoided “personal Premium” string.
- `MARKETING_PAGES` / `MARKETING_SITEMAP` already listed faq — unchanged.

## Plan Change Log

## Review Triage Log

### 2026-11-09 — Review pass
- verdicts: 0 findings — high 0, medium 0, low 0, false 0, maybe-false 0
- findings:

## Verification

**Commands:**
- `pnpm exec next build` -- expected: success
- After `pnpm exec next start` (or `next dev`), for each of `/ar/faq` `/en/faq` `/es/faq` `/fr/faq` `/pt/faq` `/ru/faq`: HTTP 200; body contains distinctive FAQ facts from that locale's `content/{productLocale}/faq.md` (`pt` → `pt-BR`) including bot `LiveScoreAppBot`, audience coverage, and Premium **49** Stars / **30** days / **24** h grace / free **1** team|league; body contains `https://t.me/LiveScoreAppBot`; body omits predictions / Discord / player-follow / live highlights-cron / personal Premium

**Manual checks (if no CLI):**
- Spot-read all six `faq.md` against SERVICE-CAPABILITIES bot/audience/Premium sections only
- Confirm Chat Premium facts only for group/channel; personal = no Stars plan wording without forbidden omit strings

## Auto Run Result

- Summary: Dedicated `/{locale}/faq` route + six claim-safe `faq.md` bodies covering bot identity (`LiveScoreAppBot`), personal/group/channel(+Mini App) audiences, and Chat Premium 49 Stars / 30 days / 24h grace / free 1 team|league; CTA LiveScoreAppBot; no forbidden claims.
- Files changed:
  - `src/app/[locale]/faq/page.tsx` — locale FAQ page mirroring pricing loader/CTA
  - `content/{ar,en,es,fr,pt-BR,ru}/faq.md` — claim-safe FAQ Q&A copy
  - this plan — oneshot plan + review/finalize
- Review: 0 findings; 0 patched; 0 deferred; 0 rejected
- Follow-up review recommendation: `false` — no patches this pass
- Patched counts: high 0, medium 0, low 0
- Verification: `pnpm exec next build` success; HTTP 200 + bot/audience/Premium facts + bot CTA + forbidden-claim omit scan pass for `/ar|/en|/es|/fr|/pt|/ru` `/faq`
- Residual risks: nav/footer FAQ link still epic sibling work; locale wording polish possible without second lens
- Commit: `d582fb01aedd30d1c81b7827418ab0c56c8bc718`
