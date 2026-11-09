---
title: 'Refactor sweep'
type: chore
ticket: 8
created: '2026-11-09'
status: built
baseline_revision: '65f221e9ec1f7743b0a53b34c853824ddb643d6f'
route: oneshot
route_source: pinned
risk: low
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

**Problem:** Epic marketing pages share near-identical `page.tsx` bodies, and `_bmad-output/initiative-livescore-landing/deferred-work.md` still lists a stale `src/app/page.tsx` localeDetection comment that epic-i18n-foundation already corrected.

**Approach:** Cleanup-only: clear the obsolete deferred entry; extract one shared marketing markdown+CTA renderer and thin-wrap existing locale page routes (no deletes, no new features/routes). Leave story 2.1 locale follow-up polish alone (non-trivial).

</intent-contract>

## Implementation Notes

Oneshot: deferred queue is already fixed in code; remaining work is bookkeeping + obvious DRY of eight identical marketing page modules. No SEO/CMS/channels API/epic 3–4.

- Confirmed `src/app/page.tsx` comment already matches `localeDetection: true` / `localeCookie: false` (epic1 refactor); cleared obsolete deferred-work entry only.
- Added `src/components/MarketingMarkdownPage.tsx` for shared locale-guard + markdown body + Shell CTA.
- Thin-wrapped eight existing `[locale]` marketing `page.tsx` routes onto that helper (files kept; no deletes).
- Skipped story 2.1 locale follow-up polish (non-trivial residual wording risk; left `followup_review_recommended` alone on that plan).

## Plan Change Log

## Review Triage Log

### 2026-11-09 — Review pass
- verdicts: 0 findings — high 0, medium 0, low 0, false 0, maybe-false 0
- findings: none

## Verification

**Commands:**
- `pnpm lint` -- expected: success
- `pnpm build` -- expected: success

**Manual checks (if no CLI):**
- `deferred-work.md` has no open stale localeDetection/`page.tsx` comment entry
- Each locked marketing route still renders markdown + LiveScoreAppBot CTA (no route/behavior change)

## Auto Run Result

- Summary: Cleanup-only refactor sweep — cleared obsolete deferred-work localeDetection entry (comment already fixed in epic1) and DRY'd eight marketing locale `page.tsx` routes into shared `MarketingMarkdownPage`.
- Files changed:
  - `_bmad-output/initiative-livescore-landing/deferred-work.md` — cleared stale entry
  - `src/components/MarketingMarkdownPage.tsx` — shared locale-guard + markdown + CTA
  - `src/app/[locale]/page.tsx` and sibling marketing routes — thin wrappers
  - this plan — oneshot plan + review/finalize
- Review: quick lens — 0 findings; 0 patched; 0 deferred; 0 rejected
- Follow-up review recommendation: `false` — no patches this pass
- Patched counts: high 0, medium 0, low 0
- Verification: `pnpm lint` success; `pnpm build` success (53 static pages)
- Residual risks: story 2.1 locale wording follow-up left as previously recommended; no new deferred items
- Commit: `d9f8ac0d793f4c0bb3b6203255b36d2c272aff06`
