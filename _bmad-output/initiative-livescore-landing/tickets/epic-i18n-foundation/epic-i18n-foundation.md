---
tracker_id: ""
type: epic
title: "Six-locale foundation on the marketing host"
parent: initiative-livescore-landing
covers: ["R1", "R2"]
sources: []
companions: []
after: []
risk: medium
refined: false
---

# Six-locale foundation on the marketing host

## Description

Platform baseline for the marketing site: locale-aware routing for `ar`, `en`, `es`, `fr`, `pt-BR`, `ru` with usable Arabic RTL, canonical `siteUrl` wired to `https://football-live-bot.online`, and a brand shell that can deep-link to `LiveScoreAppBot`. Owns shared decisions for URL locale slugs and the in-repo content-file layout that later epics adopt.

## Outcome

A visitor can open any of the six locale roots on the marketing host, see a coherent Live Score shell (including RTL for `ar`), and reach the Telegram bot from the primary CTA.

## Done when

1. All six locale entry routes resolve without 404.
2. `ar` pages render RTL correctly in layout chrome.
3. Absolute metadata base URL uses `https://football-live-bot.online`.
4. Brand shell + bot CTA visible on the locale home shell (placeholder content OK).
5. Locale slug scheme and content-file layout are recorded for downstream epics.

## Boundaries

- In: i18n routing, RTL, site config/host, brand/nav/footer shell, shared layout decisions.
- Out: full page copy, SEO kit (`robots`/sitemaps/`llms*`), live channels API.
- R1 here: app-level canonical host / metadata base — not sitemap absolute URL emission (epic 3).
- Owns shared decisions: `pt-BR` URL slug, content directory convention.

## References

- parent — `_bmad-output/initiative-livescore-landing/initiative-livescore-landing.md`, section Requirements (R1, R2)
- companion — `_bmad-output/initiative-livescore-landing/content-and-seo-surface.md`

## Notes

- Assumption: default locale `en` (inherited from initiative).
- Open question: URL slug for `pt-BR` (`/pt-BR` vs `/pt`) — settle before or as first stories.
