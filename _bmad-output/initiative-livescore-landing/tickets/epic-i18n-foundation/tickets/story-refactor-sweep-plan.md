---
title: 'Refactor sweep'
type: chore
ticket: '5'
created: '2026-11-09'
status: done
baseline_revision: '8740b3e998179504acef4b1930be752563c2b704'
route: oneshot
route_source: auto
risk: low
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `src/app/page.tsx` still documents story-1.1 behavior (`localeDetection: false`, `/`→`/en` only) after story 1.2 enabled Accept-Language negotiation; that deferred nit is the only open cleanup in this epic's deferred-work.

**Approach:** Comment-only fix in `page.tsx` to match current middleware/`routing.ts` (Accept-Language → locale prefix, fallback `en`); leave Finwise template leftovers alone (unused by locale shell, not listed in deferred-work; no deletes/redesign).

</frozen-after-approval>

## Implementation Notes

Oneshot (~comment-only): deferred-work has one entry; review-triage deferrals from 1.2/1.3/1.4 either patched already or this comment. Finwise strings in unused Hero/FAQ/benefits/cta are not on `[locale]` home path — skip.

- 2026-11-09: Updated `src/app/page.tsx` file comment to document `localeDetection: true` + `localeCookie: false` Accept-Language negotiation with `/en` fallback. No runtime code changes. Skipped Finwise leftovers (not deferred; unused by shell; no deletes).

## Plan Change Log

## Review Triage Log

- 2026-11-09 quick: no findings — verdict n/a

## Verification

**Commands:**
- `pnpm lint` -- expected: success
- `pnpm exec next build` -- expected: success
- After start: `curl` six locale roots -- expected: 200
- `curl -sI -H "Accept-Language: ru" http://127.0.0.1:<port>/` -- expected: redirect Location with `/ru`
- Fetch `/en` -- expected: body contains `content/en/home.md` text; locale switcher links present
