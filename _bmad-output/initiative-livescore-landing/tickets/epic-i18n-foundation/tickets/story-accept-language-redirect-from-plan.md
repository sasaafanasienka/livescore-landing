---
title: 'Accept-Language redirect from /'
type: feature
ticket: '2'
created: '2026-11-09'
status: done
baseline_revision: '860562262919f0513036501597e393fbfc55ee12'
route: oneshot
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `/` currently redirects only to `/en` because `localeDetection: false`; Accept-Language negotiation (R3) is missing, so RU (and other) browsers never land on their locale prefix.

**Approach:** Enable next-intl locale detection so `/` negotiates Accept-Language → matching URL prefix (`ar|en|es|fr|pt|ru`) with fallback `en`; keep temporary redirect semantics (next-intl 307 OK).

</frozen-after-approval>

## Implementation Notes

Oneshot: flip `localeDetection` to `true` in `src/i18n/routing.ts`; optionally harden `src/middleware.ts` only if detection alone fails verify. Preserve `productLocales` / `toProductLocale` / locale lists. Do not touch `[locale]/page`, content, Header/Footer, messages, SEO.

- 2026-11-09: Set `localeDetection: true` in `src/i18n/routing.ts`. Left `src/middleware.ts` as stock `createMiddleware(routing)` — next-intl redirects `/` with temporary 307 when `localePrefix: 'always'`. Did not edit `src/app/page.tsx` (ownership / parallel 1.3).
- 2026-11-09 quick patch: also set `localeCookie: false` so stale `NEXT_LOCALE` (set under story 1.1 `localeDetection: false`) cannot override Accept-Language on `/`. Re-verified with Cookie+AL curl.

## Plan Change Log

## Review Triage Log

- 2026-11-09 quick: cookie overrides Accept-Language — verdict `medium`, route `patch` — set `localeCookie: false`; curl with `Cookie: NEXT_LOCALE=en` + `Accept-Language: ru` → `/ru`.
- 2026-11-09 quick: stale comment in `src/app/page.tsx` — verdict `low`, route `defer` — ownership blocks edit during parallel 1.3; recorded in deferred-work.md.

## Verification

**Commands:**
- `pnpm exec next build` -- expected: success
- Start server; `curl -sI -H "Accept-Language: ru" http://127.0.0.1:<port>/` -- expected: 307/302 Location containing `/ru`
- `curl -sI http://127.0.0.1:<port>/` (no usable AL, or `Accept-Language: xx`) -- expected: redirect to `/en`
