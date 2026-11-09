---
title: 'next-intl locale shell with host and bot CTA'
type: feature
ticket: '1'
created: '2026-11-09'
status: done
baseline_revision: 'bdf018888c39fe1fdd05f76b2d913be602cd932b'
route: full
route_source: auto
risk: medium
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** App is a single-locale Finwise template on the wrong host with no next-intl `[locale]` routes, no RTL, and no Live Score → Telegram bot CTA.

**Approach:** Add next-intl App Router routing for `ar|en|es|fr|pt|ru` (`pt` URL ↔ product `pt-BR`), set `siteUrl`/`metadataBase` to `https://football-live-bot.online`, render Live Score nav/footer shell with primary CTA `https://t.me/LiveScoreAppBot` on locale home (placeholder body). No locale switcher (1.4). No Accept-Language negotiation (1.2).

## Boundaries & Constraints

**Always:**
- Locales URL: ar, en, es, fr, pt, ru; product/content id for pt = pt-BR
- Brand name Live Score; CTA https://t.me/LiveScoreAppBot
- Canonical host https://football-live-bot.online (no trailing slash inconsistency in metadataBase)
- `ar` sets `dir="rtl"` on `<html>`
- Package manager: pnpm
- next-intl with `[locale]` segment

**Never:**
- Locale switcher (story 1.4)
- Accept-Language `/` negotiation (story 1.2) — if next-intl requires `/` handling, only temporary defaultLocale redirect with `localeDetection: false`
- Full marketing content pages / content/{locale} contract beyond mapping note (1.3)
- SEO kit, channels API, redesign, CMS
- Delete files; commit/push

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Locale home | GET `/en` (and ar/es/fr/pt/ru) | 200, Live Score chrome, bot CTA href | Invalid locale → 404 |
| Arabic RTL | GET `/ar` | `<html lang="ar" dir="rtl">` | — |
| Metadata base | Any locale page metadata | `metadataBase` / siteUrl = `https://football-live-bot.online` | — |
| Root `/` | GET `/` | Deferred to 1.2; if scaffolding forces, redirect to `/en` only (no Accept-Language) | — |

</frozen-after-approval>

## Code Map

- `package.json` / `pnpm-lock.yaml` — add `next-intl` via pnpm
- `next.config.mjs` — wrap with `createNextIntlPlugin()`
- `src/i18n/routing.ts` — `defineRouting` locales + defaultLocale `en`; document pt→pt-BR map export
- `src/i18n/request.ts` — `getRequestConfig` + messages; map `pt`→messages key `pt` (URL) while exporting `toProductLocale('pt')=>'pt-BR'`
- `src/i18n/navigation.ts` — `createNavigation` Link/etc for locale-aware links
- `src/middleware.ts` — `createMiddleware(routing)`; `localeDetection: false` to avoid stealing 1.2
- `messages/{ar,en,es,fr,pt,ru}.json` — minimal shell strings (brand, CTA label, placeholder)
- `src/data/siteDetails.ts` — siteName Live Score, siteUrl football-live-bot.online, metadata titles
- `src/app/layout.tsx` — pass-through root (html/body move to locale layout)
- `src/app/[locale]/layout.tsx` — html lang/dir, metadataBase, Header/Footer, NextIntlClientProvider, generateStaticParams, setRequestLocale
- `src/app/[locale]/page.tsx` — placeholder body + primary bot CTA
- `src/app/page.tsx` — keep file; minimal stub or rely on middleware default redirect — do not implement Accept-Language
- `src/components/Header.tsx` / `Footer.tsx` — Live Score branding; primary CTA → t.me/LiveScoreAppBot; locale-aware home Link; no switcher
- Do not change: epic tickets.toml covers/after; SEO files; marketing section components beyond not using them on locale home

## Tasks & Acceptance

**Execution:**
- [x] `package.json` — `pnpm add next-intl` — i18n dependency
- [x] `src/i18n/routing.ts` + `request.ts` + `navigation.ts` + `src/middleware.ts` + `next.config.mjs` — next-intl App Router scaffolding
- [x] `messages/*.json` — minimal chrome/CTA copy per URL locale
- [x] `src/data/siteDetails.ts` — host + Live Score brand
- [x] `src/app/layout.tsx` + `src/app/[locale]/layout.tsx` + `src/app/[locale]/page.tsx` — locale shell, RTL, metadataBase, placeholder home
- [x] `src/components/Header.tsx` + `src/components/Footer.tsx` — shell + bot CTA, no switcher
- [x] `src/app/page.tsx` — leave for 1.2 / temporary default redirect only if required

**Acceptance Criteria:**
- Given app running, when GET `/ar|/en|/es|/fr|/pt|/ru`, then each returns 200
- Given GET `/ar`, when HTML inspected, then `dir="rtl"` (and lang=ar)
- Given locale page, when metadata/base inspected, then uses `https://football-live-bot.online`
- Given locale home, when rendered, then Live Score chrome and `t.me/LiveScoreAppBot` CTA present

## Implementation Notes

- Installed `next-intl@4.14.9` via pnpm; plugin wraps `next.config.mjs`.
- `localeDetection: false`; middleware matcher includes `/` so next-intl issues temporary defaultLocale redirect (`/` → `/en` 307) — Accept-Language remains story 1.2.
- Shell CTA/href uses `siteDetails.botUrl` = `https://t.me/LiveScoreAppBot`; brand from messages + siteDetails.
- Quick review patch: added `URL_LOCALES` alias export.
- Verified: build OK; curl 200 on six locales; `/ar` has `dir="rtl"`; CTA + host present.

## Plan Change Log

## Review Triage Log

- 2026-11-09 quick: `src/i18n/routing.ts` missing `URL_LOCALES` — verdict `low`, route `patch` — added `export const URL_LOCALES = locales`.
- 2026-11-09 quick: Inter/`globals.css` redesign vs HEAD — verdict `false` — story did not edit `globals.css`; Inter fonts were orchestrator-approved pre-existing dirty baseline.

## Design Notes

next-intl on Next 14: use `src/middleware.ts` (not `proxy.ts`). Prefer `setRequestLocale` + `generateStaticParams` (no `next/root-params`). Keep `localeDetection: false` so 1.2 owns Accept-Language. Export `URL_LOCALES` and `toProductLocale()` for downstream 1.3 without creating `content/` tree yet.

## Verification

**Commands:**
- `pnpm exec next build` -- expected: success; routes for six locales
- `pnpm exec next start` then curl six locale roots -- expected: HTTP 200 each
- curl `/ar` body -- expected: `dir="rtl"` and LiveScoreAppBot href
- Inspect metadataBase / siteUrl in code or HTML absolute links -- expected: football-live-bot.online
