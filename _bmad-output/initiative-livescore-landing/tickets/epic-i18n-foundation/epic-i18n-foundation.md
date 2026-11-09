---
tracker_id: ""
type: epic
title: "Six-locale foundation on the marketing host"
parent: initiative-livescore-landing
covers: ["R1", "R2"]
sources:
  - _bmad-output/initiative-livescore-landing/initiative-livescore-landing.md
companions: []
after: []
risk: medium
refined: true
---

# Six-locale foundation on the marketing host

## Description

Platform baseline for the marketing site: locale-aware routing for six languages with usable Arabic RTL, canonical `siteUrl` wired to `https://football-live-bot.online`, and a brand shell that deep-links to `LiveScoreAppBot`. Owns shared decisions for URL locale slugs and the in-repo content-file layout that later epics adopt.

## Outcome

A visitor hitting the marketing host is sent to an appropriate locale prefix, sees a coherent Live Score shell (RTL for Arabic), and can open the Telegram bot from the primary CTA.

## Requirements

1. **R1 (parent R1):** App-level metadata and absolute base URL use canonical host `https://football-live-bot.online` (sitemap absolute emission stays epic 3).
2. **R2 (parent R2):** Public routes exist under URL prefixes `ar`, `en`, `es`, `fr`, `pt`, `ru`; `ar` chrome/content direction is RTL.
3. **R3 (refine 2026-11-09):** `/` negotiates `Accept-Language` and redirects to the matching locale prefix, with fallback `/en`; each `/{locale}` root resolves (no 404).
4. **R4 (refine 2026-11-09):** Marketing content files follow `content/{locale}/{page}.md` using product locale ids (`pt-BR` for URL `/pt`); the mapping is documented for downstream epics.
5. **R5 (refine 2026-11-09):** Brand shell shows Live Score naming, a locale switcher, footer, and a primary CTA to `LiveScoreAppBot` on the locale home shell (placeholder body OK).

## Constraints

1. **C1 (refine 2026-11-09):** Internationalization uses an App Router library (`next-intl`) with a `[locale]` segment — not a one-off custom router as the sole mechanism.
2. **C2 (epic Boundaries):** No full visual redesign, no SEO kit (`robots`/sitemaps/`llms*`), no live channels API in this epic.

## Done when

1. `/` redirects to a locale prefix via language negotiation (fallback `en`).
2. All six locale roots (`/ar` `/en` `/es` `/fr` `/pt` `/ru`) resolve without 404.
3. `ar` pages render RTL correctly in layout chrome.
4. Absolute metadata base URL uses `https://football-live-bot.online`.
5. Brand shell + locale switcher + bot CTA visible on locale home (placeholder content OK).
6. Content path convention `content/{locale}/{page}.md` and `/pt` → `pt-BR` mapping are recorded for epic 2+.

## Boundaries

- In: i18n routing/library, RTL, site config/host, brand/nav/footer/locale switcher shell, content-path contract.
- Out: full page copy, SEO kit, live channels API, Accept-Language as the only discovery path for locales (sitemaps/hreflang = epic 3).
- R1 here: app metadata / `siteUrl` only.
- Owns: URL slug map (`pt` ↔ `pt-BR`), content directory convention.

## References

- parent — `_bmad-output/initiative-livescore-landing/initiative-livescore-landing.md`, section Requirements (R1, R2)
- companion — `_bmad-output/initiative-livescore-landing/content-and-seo-surface.md`

## Notes

- Decision: 2026-11-09 — Portuguese URL slug is `pt`; content/product locale id remains `pt-BR`.
- Decision: 2026-11-09 — `/` uses Accept-Language redirect with fallback `en` (302-style negotiation preferred so crawlers are not permanently locked).
- Decision: 2026-11-09 — content layout `content/{locale}/{page}.md`.
- Decision: 2026-11-09 — i18n library = `next-intl`.
- Decision: 2026-11-09 — shell = nav + switcher + footer + bot CTA; minimal brand rename, not redesign.
- Assumption: `hreflang` / `x-default` finalized in epic-seo-crawl-surface; this epic only guarantees crawlable `/{locale}` URLs.
- Assumption: default/fallback locale `en`.
