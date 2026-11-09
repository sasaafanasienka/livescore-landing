---
title: 'Locale switcher in the shell'
type: feature
ticket: '4'
created: '2026-11-09'
status: done
baseline_revision: 'b089b689fdaf298d3013c04ea74c06e11e52348d'
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

**Problem:** Brand shell has nav/footer/CTA but no locale switcher; visitors cannot move between `ar|en|es|fr|pt|ru` while keeping the current path (R5 switcher half).

**Approach:** Add a shell locale switcher using next-intl navigation helpers (`Link` / `usePathname` / `useRouter` from `@/i18n/navigation`) that lists all six URL locales and switches prefix while preserving the path; keep `localeCookie: false` so Accept-Language on `/` stays intact (no sticky `/` cookie).

</frozen-after-approval>

## Implementation Notes

Oneshot: small client switcher (~UI + wire into Header). Reuse `URL_LOCALES` / `routing.locales`, `usePathname` + `Link locale=` or `router.replace({pathname, params}, {locale})`. Do not flip `localeCookie`. Do not touch content contract, SEO, middleware matcher, Accept-Language.

- 2026-11-09: Added `src/components/LocaleSwitcher.tsx` — client listing `URL_LOCALES` via `Link` + `usePathname` + `locale=` (router.replace+params typed poorly on this next-intl version).
- Wired into `Header.tsx` (desktop bar + mobile drawer). Left `localeCookie: false`; updated comment in `routing.ts`.
- Quick patches: outer element `div` (not nested `<nav>`); active locale is `<span>` not disabled `<a>`; mobile switcher moved into drawer.
- Verified: build OK; `/en` HTML lists ar/en/es/fr/pt/ru with `/ru` link; `/ru` 200; Accept-Language `/` → `/ru` still.

## Plan Change Log

## Review Triage Log

- 2026-11-09 quick: nested `<nav>` in Header — verdict `low`, route `patch` — switched switcher root to `<div aria-label="Locale">`.
- 2026-11-09 quick: active locale `pointer-events-none` still focusable — verdict `low`, route `patch` — render `<span aria-current="page">` when active.
- 2026-11-09 quick: mobile six-locale row cramped beside hamburger — verdict `low`, route `patch` — move switcher into mobile drawer.

## Verification

**Commands:**
- `pnpm exec next build` -- expected: success
- After `pnpm exec next start`, fetch `/en` HTML -- expected: switcher lists `ar en es fr pt ru`
- From `/en` home, follow/switch to `ru` -- expected: lands on `/ru` (same path shape; home → `/ru`)
- `curl -sI -H "Accept-Language: ru" http://127.0.0.1:<port>/` -- expected: still redirects to `/ru` (cookie still off)
