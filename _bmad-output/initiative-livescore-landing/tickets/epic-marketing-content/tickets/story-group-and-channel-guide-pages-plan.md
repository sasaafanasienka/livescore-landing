---
title: 'Group and channel guide pages'
type: feature
ticket: 3
created: '2026-11-09'
status: built
baseline_revision: '3da4f1ce15cfa8515ddd93bc99cdd8daa2483b57'
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

**Problem:** `/{locale}/guide/groups` and `/{locale}/guide/channels` 404; locked sitemap expects `guide-groups.md` / `guide-channels.md` covering bot `/group` and `/channel` registration without unshipped claims.

**Approach:** Mirror `pricing/page.tsx` for nested `guide/groups` and `guide/channels` routes; ship six-locale claim-safe bodies from SERVICE-CAPABILITIES group/channel register facts only; CTA LiveScoreAppBot.

</intent-contract>

## Implementation Notes

Oneshot: reuse `MARKETING_PAGES.guideGroups` / `guideChannels`, `getPageMarkdown`, pricing page shell; two new App Router pages + twelve content files — no SEO, CMS, nav, channels API, or epic 3/4.

Allowed claim surface (SERVICE-CAPABILITIES only): register from **private** chat via `/group` or `/channel` → Telegram `requestChat` + required rights → `chat_shared` → profile; non-private → error; free **1** team|league favourite; Chat Premium for more; distinct from official league channels list. Brand Live Score. CTA `https://t.me/LiveScoreAppBot`. Forbid: predictions, Discord, player-follow, live highlights-cron, personal Premium.

- Added `src/app/[locale]/guide/groups/page.tsx` and `src/app/[locale]/guide/channels/page.tsx` mirroring pricing: locale guard, `getPageMarkdown` with `MARKETING_PAGES.guideGroups` / `guideChannels`, CTA via `siteDetails.botUrl`.
- Wrote claim-safe `content/{ar,en,es,fr,pt-BR,ru}/guide-groups.md` and `guide-channels.md` covering private `/group` / `/channel` register jobs, free 1 team|league, Chat Premium for more, distinct from official league channels; brand Live Score; no forbidden claims; avoided string “personal Premium”.
- `MARKETING_PAGES` / `MARKETING_SITEMAP` already listed both pages — unchanged.
- Review patch: softened all twelve bodies so post-share registration is conditional on type/rights/access (success not guaranteed), matching SERVICE-CAPABILITIES.

## Plan Change Log

## Review Triage Log

### 2026-11-09 — Review pass
- verdicts: 1 findings — high 0, medium 1, low 0, false 0, maybe-false 0
- findings:
  - `[medium]` `[patch]` All twelve guide md files claimed registration always completes after share — contradicted SERVICE-CAPABILITIES (“success is not guaranteed on every share”); rewrote each locale to gate completion on type/rights/access and note conflict/share failures

## Verification

**Commands:**
- `pnpm exec next build` -- expected: success
- After `pnpm exec next start` (or `next dev`), for each locale `/ar|/en|/es|/fr|/pt|/ru` and each path `/guide/groups` + `/guide/channels`: HTTP 200; body references bot group/channel registration (`/group` or `/channel` job); contains `https://t.me/LiveScoreAppBot`; omits predictions / Discord / player-follow / live highlights-cron / personal Premium

**Manual checks (if no CLI):**
- Spot-read all twelve guide md files against SERVICE-CAPABILITIES Groups/Channels + Bot Commands only
- Confirm guides do not invent official-channels API or unshipped product claims

## Auto Run Result

- Summary: Nested `/{locale}/guide/groups` and `/{locale}/guide/channels` routes + twelve claim-safe guide bodies covering private `/group` and `/channel` registration jobs; CTA LiveScoreAppBot; no forbidden claims.
- Files changed:
  - `src/app/[locale]/guide/groups/page.tsx` — groups guide page mirroring pricing loader/CTA
  - `src/app/[locale]/guide/channels/page.tsx` — channels guide page mirroring pricing loader/CTA
  - `content/{ar,en,es,fr,pt-BR,ru}/guide-groups.md` — claim-safe group register copy
  - `content/{ar,en,es,fr,pt-BR,ru}/guide-channels.md` — claim-safe channel register copy
  - this plan — oneshot plan + review/finalize
- Review: 1 finding patched (medium claim-safety); 0 deferred; 0 rejected
- Follow-up review recommendation: `false` — only one medium patch this pass
- Patched counts: high 0, medium 1, low 0
- Verification: `pnpm exec next build` success (pre- and post-patch); HTTP 200 + `/group`|/channel` + bot CTA + forbidden-claim omit scan pass for all six locales × both paths
- Residual risks: nav/footer guide links still sibling epic work; locale wording polish possible without second lens
- Commit: `f27b39e14690ce445e9c7f2c9a688e16f7a80904`
