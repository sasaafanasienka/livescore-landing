---
tracker_id: ""
type: initiative
title: "Live Score marketing site ranks and converts on football-live-bot.online"
parent: 
covers: 
sources:
  - _bmad-output/initiative-livescore-landing/sources/intake-brief.md
  - _bmad-output/initiative-livescore-landing/sources/SERVICE-CAPABILITIES.md
companions:
  - _bmad-output/initiative-livescore-landing/competitor-ia.md
  - _bmad-output/initiative-livescore-landing/content-and-seo-surface.md
after: []
risk: high
---

# Live Score marketing site ranks and converts on football-live-bot.online

## Description

Ship a multi-locale marketing site on the existing Next.js template that presents only what Live Score actually ships (Telegram bot + Mini App: personal, groups, channels, chat Premium, official league channels), mirrors the competitor’s content jobs from footylive.org without claiming their extras, and exposes a crawlable SEO surface (sitemaps, robots, hreflang, structured data, `llms.txt`, `llms-full.txt`) with in-repo agent-editable copy except the live official-channels list.

## Outcome

Football fans and channel/group admins searching for Telegram live-score bots find and understand Live Score on `https://football-live-bot.online` in six languages, with search engines and LLM crawlers able to index the full public surface.

## Requirements

1. **R1 (intake domain, content-and-seo-surface Domain):** Site is served under canonical host `https://football-live-bot.online` with consistent absolute URLs in metadata and sitemaps.
2. **R2 (intake Locales, content-and-seo-surface Locales):** Public marketing content is available in `ar`, `en`, `es`, `fr`, `pt-BR`, and `ru`; `ar` is usable RTL.
3. **R3 (competitor-ia Proposed site map, intake Intent):** Site covers the adapted competitor page jobs: home, group guide, channel guide, official channels, pricing, FAQ, privacy, terms — each locale-complete.
4. **R4 (SERVICE-CAPABILITIES Overview / Audiences / Bot / Premium / Explicitly Not Shipped):** Marketing claims match shipped product facts (bot `LiveScoreAppBot`, personal/group/channel + Mini App, chat Premium 49 Stars / 30d / 24h grace / free 1 team|league) and omit catalog non-goals and soft-disabled-as-live claims.
5. **R5 (intake Content storage, content-and-seo-surface Content ownership):** All marketing copy and SEO text files live in the repo and are editable without a CMS; only the official channels list is loaded from the product API.
6. **R6 (SERVICE-CAPABILITIES Official league channels, intake Live data exception):** Official channels page/section shows live `{ id, title, logo, link }` items from the product channels list contract (public-safe access path required).
7. **R7 (intake SEO bar / llms, content-and-seo-surface SEO artifacts):** Production SEO kit ships and works: `robots.txt`, complete sitemap coverage, canonical + hreflang, per-page locale metadata/OG/Twitter, relevant JSON-LD, plus `llms.txt` and `llms-full.txt`.
8. **R8 (intake Intent, competitor-ia Keep CTA):** Primary CTAs deep-link into the Telegram bot / Mini App entry the product already uses (`LiveScoreAppBot`), not a fake web app clone of the Mini App.

## Constraints

1. **C1 (intake Content storage):** No CMS; content changes are file PRs / agent edits in git.
2. **C2 (SERVICE-CAPABILITIES Explicitly Not Shipped / Soft-disabled):** Copy must not claim predictions, Discord, player-follow, or a live scheduled highlights pipeline.
3. **C3 (intake Live data exception):** No other dynamic product datasets on the marketing site beyond official channels (and incidental build-time config).
4. **C4 (intake Competitor IA reference):** footylive.org informs information architecture and section jobs only — not brand, visuals, or feature parity.
5. **C5 (SERVICE-CAPABILITIES Official league channels auth note):** Channels fetch must not require end-user Telegram Mini App login on the public marketing site (implies a public or server-mediated path).

## Done when

1. All six locales render the agreed page set on `football-live-bot.online` without missing-route 404s for those paths.
2. `robots.txt`, sitemap(s), `llms.txt`, and `llms-full.txt` are publicly reachable and list/cover the indexable URLs.
3. Spot-check: marketing statements about Premium quotas, bot identity, and audiences match `SERVICE-CAPABILITIES.md`.
4. Official channels list updates when the API list changes, without a content-file edit.
5. A crawler-facing check (Search Console URL inspection or equivalent) shows locale alternates / canonicals coherent on at least home + one guide.

## Boundaries

- This initiative owns the marketing site repo (`livescore-landing`), not Mini App / bot / server product features — except any minimal public channels exposure agreed for R6/C5.
- Out: Discord landing, prediction game, tipster content, CMS, automated MT pipeline as a product requirement, admin panel docs.
- Out: rebuilding the Mini App inside the marketing site.
- Touch point: Live Score `GET /api/channels` (or a public façade) — owner: epic-official-channels.
- R1 split: epic-i18n-foundation owns app metadata/`siteUrl`; epic-seo-crawl-surface owns absolute URLs in sitemaps/SEO artifacts.
- Shared decisions home: locale URL slug + content-file layout → epic-i18n-foundation; public channels contract → epic-official-channels.
- Tracer: epic-i18n-foundation → epic-marketing-content → epic-seo-crawl-surface; epic-official-channels after marketing-content.

## References

- source — `_bmad-output/initiative-livescore-landing/sources/intake-brief.md`
- source — `_bmad-output/initiative-livescore-landing/sources/SERVICE-CAPABILITIES.md` (snapshot; live catalog `C:/DIY/live-score/docs/SERVICE-CAPABILITIES.md`)
- companion — `_bmad-output/initiative-livescore-landing/competitor-ia.md`
- companion — `_bmad-output/initiative-livescore-landing/content-and-seo-surface.md`
- competitor — https://footylive.org/
- product bot — https://t.me/LiveScoreAppBot

## Notes

- Assumption: Display brand in UI is **Live Score**; host name `football-live-bot.online` is the canonical domain only.
- Assumption: Guide pages for groups and channels are in scope (competitor parity of jobs), even though exact copy is new.
- Assumption: Pricing may be a dedicated route or a crawlable home section plus FAQ — both acceptable if indexed.
- Open question: How does the public site call official channels when `GET /api/channels` requires Telegram Mini App auth — new public endpoint on live-score, BFF with server credential, or build-time fetch?
- Open question: Legal entity name, contact, and governing law for Privacy/Terms pages.
- Decision: 2026-11-09 — production domain is `football-live-bot.online`.
- Decision: 2026-11-09 — locales locked to `ar`, `en`, `es`, `fr`, `pt-BR`, `ru`.
- Decision: 2026-11-09 — slice into four epics (capability / early-usable): i18n-foundation → marketing-content → seo-crawl-surface; official-channels after marketing-content. Declined merge of content+SEO.
- Decision: 2026-11-09 — first demo is epic 1 (six locales + RTL + shell + bot CTA). Least-certain work is official-channels (public API path).
- Decision: 2026-11-09 — Portuguese URL slug is `/pt` (product/content id stays `pt-BR`).
- Decision: 2026-11-09 — `/` negotiates Accept-Language then redirects to `/{locale}` with fallback `/en`; default locale `en`.
- Decision: 2026-11-09 — content layout `content/{locale}/{page}.md`; i18n via `next-intl`.
