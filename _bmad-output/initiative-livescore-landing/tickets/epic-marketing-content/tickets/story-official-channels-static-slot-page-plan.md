---
title: 'Official-channels static slot page'
type: feature
ticket: 4
created: '2026-11-09'
status: done
baseline_revision: 'f0a05d30efffd7ae9a0f188e8ed4226244bdc5b0'
route: oneshot
route_source: pinned
risk: low
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

**Problem:** `/{locale}/official-channels` 404s; locked sitemap expects `official-channels.md` as a static placeholder/slot so epic 4 can wire the live list later.

**Approach:** Mirror `pricing/page.tsx` for `/[locale]/official-channels`; ship six-locale `official-channels.md` bodies as an explicit static slot/placeholder (no API fetch, no fake live channel list); reuse `MARKETING_PAGES.officialChannels`; CTA LiveScoreAppBot.

</intent-contract>

## Implementation Notes

Oneshot: reuse `MARKETING_PAGES.officialChannels` / `getPageMarkdown` / pricing page shell; new route + six content files only — no SEO kit, CMS, nav epic, live channels API/fetch, mock channel list, or epic 3/4 work.

Allowed claim surface (SERVICE-CAPABILITIES only): page is a **static placeholder/slot** for official app-owner league channels (distinct from user-registered `/channel` notification profiles); live list is Mini App / epic 4 — do **not** fetch `GET /api/channels` or invent channel titles/links. Brand Live Score. CTA `https://t.me/LiveScoreAppBot`. Forbid: predictions, Discord, player-follow, live highlights-cron, personal Premium.

- Added `src/app/[locale]/official-channels/page.tsx` mirroring pricing: locale guard, `getPageMarkdown(..., MARKETING_PAGES.officialChannels)`, CTA via `siteDetails.botUrl`; no fetch.
- Wrote claim-safe placeholder `content/{ar,en,es,fr,pt-BR,ru}/official-channels.md` stating static slot, Mini App for live list, distinct from `/channel` profiles; no invented channel titles/links; brand Live Score; avoided string “personal Premium”.
- `MARKETING_PAGES` / `MARKETING_SITEMAP` already listed officialChannels — unchanged.

## Plan Change Log

## Review Triage Log

### 2026-11-09 — Review pass
- verdicts: 0 findings — high 0, medium 0, low 0, false 0, maybe-false 0
- findings:

## Verification

**Commands:**
- `pnpm exec next build` -- expected: success
- After `pnpm exec next start` (or `next dev`), for each of `/ar/official-channels` `/en/official-channels` `/es/official-channels` `/fr/official-channels` `/pt/official-channels` `/ru/official-channels`: HTTP 200; body is clearly a placeholder/slot (not a live channel directory); contains `https://t.me/LiveScoreAppBot`; omits predictions / Discord / player-follow / live highlights-cron / personal Premium; page module has no channels API fetch

**Manual checks (if no CLI):**
- Spot-read all six `official-channels.md` — placeholder/slot only; no invented channel list; claim-safe vs SERVICE-CAPABILITIES
- Confirm `src/app/[locale]/official-channels/page.tsx` mirrors pricing loader with `MARKETING_PAGES.officialChannels` and no fetch

## Auto Run Result

- Summary: Stable `/{locale}/official-channels` route + six claim-safe placeholder `official-channels.md` bodies (static slot only, no API/mock channel list); CTA LiveScoreAppBot; reuses `MARKETING_PAGES.officialChannels`.
- Files changed:
  - `src/app/[locale]/official-channels/page.tsx` — locale official-channels page mirroring pricing loader/CTA, no fetch
  - `content/{ar,en,es,fr,pt-BR,ru}/official-channels.md` — claim-safe placeholder/slot copy
  - this plan — oneshot plan + review/finalize
- Review: 0 findings; 0 patched; 0 deferred; 0 rejected
- Follow-up review recommendation: `false` — no patches this pass
- Patched counts: high 0, medium 0, low 0
- Verification: `pnpm exec next build` success; HTTP 200 + placeholder signal + bot CTA + forbidden-claim omit scan + no page API fetch for `/ar|/en|/es|/fr|/pt|/ru` `/official-channels`
- Residual risks: nav/footer Official channels link still sibling epic work; epic 4 still owns live list wiring
- Commit: `462243749c8f5ee2cbc0f4ff79c9a256603e51cc`
