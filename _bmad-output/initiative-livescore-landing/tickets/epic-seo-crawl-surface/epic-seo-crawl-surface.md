---
tracker_id: ""
type: epic
title: "Crawlable SEO and LLM surfaces"
parent: initiative-livescore-landing
covers: ["R1", "R7"]
sources:
  - _bmad-output/initiative-livescore-landing/initiative-livescore-landing.md
companions:
  - _bmad-output/initiative-livescore-landing/content-and-seo-surface.md
  - _bmad-output/initiative-livescore-landing/competitor-ia.md
  - _bmad-output/initiative-livescore-landing/sources/SERVICE-CAPABILITIES.md
after: ["epic-marketing-content"]
risk: medium
refined: true
---

# Crawlable SEO and LLM surfaces

## Description

Production crawl kit on top of stable marketing routes from epic-marketing-content: `robots.txt`, sitemap index + per-locale sitemaps with absolute `https://football-live-bot.online` URLs, canonical + hreflang (all six locales + `x-default=en`), per-page locale metadata/OG/Twitter, relevant JSON-LD, plus `llms.txt` and `llms-full.txt` under `public/`.

## Outcome

Search engines and LLM crawlers can discover, alternate-link, and summarize the full public marketing surface (8 locked routes × 6 locales) without manual URL lists.

## Requirements

1. **R1 (parent R1):** SEO artifacts (sitemaps and other crawl surfaces this epic owns) emit absolute URLs under canonical host `https://football-live-bot.online` — app `metadataBase` / `siteUrl` remains epic-i18n-foundation.
2. **R2 (parent R7):** Production SEO kit ships and works: `robots.txt`, complete sitemap coverage, canonical + hreflang, per-page locale metadata/OG/Twitter, relevant JSON-LD, plus `llms.txt` and `llms-full.txt`.
3. **R3 (refine 2026-11-10):** A sitemap **index** plus **per-locale** sitemaps together list every indexable marketing URL with absolute host URLs (lastmod when practical).
4. **R4 (refine 2026-11-10):** Every indexable page declares a self-canonical and hreflang alternates for all six URL locales (`ar` `en` `es` `fr` `pt` `ru`) with `x-default` pointing at `en`.
5. **R5 (refine 2026-11-10):** Every indexable page exposes per-locale title/description plus Open Graph and Twitter card metadata (not only the site-wide layout defaults).
6. **R6 (refine 2026-11-10):** `robots.txt` allows indexing of the indexable locale marketing pages and points at the sitemap index.
7. **R7 (refine 2026-11-10):** JSON-LD ships where applicable: Organization and/or SoftwareApplication on core marketing surfaces; FAQPage on the FAQ route — claims inside structured data stay within `SERVICE-CAPABILITIES` (no predictions, Discord, player-follow, live highlights-cron, personal Premium).
8. **R8 (refine 2026-11-10):** Indexable surface is the locked eight routes × six locales under `https://football-live-bot.online` (home, guide/groups, guide/channels, official-channels, pricing, FAQ, privacy, terms) — including `official-channels` before live data exists.
9. **R9 (refine 2026-11-10):** `llms.txt` and `llms-full.txt` live under `public/` and are publicly reachable; bodies summarize the site and key absolute links for LLM agents (in-repo editable; claim-safe).

## Constraints

1. **C1 (parent C1):** No CMS; SEO text files and llms bodies are file PRs / agent edits in git.
2. **C2 (parent C2):** Structured data and llms summaries must not claim predictions, Discord, player-follow, or a live scheduled highlights pipeline.
3. **C3 (parent C3):** No new dynamic product datasets for SEO (official-channels stays a static indexable URL until epic 4).
4. **C4 (content-and-seo-surface SEO artifacts):** Sitemap shape is index + per-locale (or equivalent complete coverage — Decision locks index + per-locale).

## Done when

1. `robots.txt`, sitemap index (+ per-locale sitemaps), `llms.txt`, and `llms-full.txt` are publicly reachable.
2. Sitemaps list all 8×6 indexable locale URLs with absolute `https://football-live-bot.online` host URLs.
3. Home + at least one guide show coherent self-canonical and hreflang alternates (all six + `x-default=en`).
4. Per-page meta/OG/Twitter (and JSON-LD where applicable) present per locale on the indexable set.
5. Deployed (or production-equivalent) verification of the above passes.

## Boundaries

- In: robots, sitemap index + per-locale sitemaps, hreflang/canonical hardening, per-page metadata/OG/Twitter, JSON-LD, `public/llms.txt` + `public/llms-full.txt`.
- Out: writing marketing body copy (epic 2); channels live data (epic 4); CMS; Mini App clone; changing page jobs/IA without need; app `siteUrl`/`metadataBase` ownership (epic 1).
- R1 here: absolute URL emission in sitemaps/SEO artifacts — app metadata base owned by epic 1.
- May list the channels route before live data exists.
- Bound by initiative C1–C3 for claim/dynamic scope.

## References

- parent — `_bmad-output/initiative-livescore-landing/initiative-livescore-landing.md`, section Requirements (R1, R7)
- companion — `_bmad-output/initiative-livescore-landing/content-and-seo-surface.md`
- companion — `_bmad-output/initiative-livescore-landing/competitor-ia.md`
- source snapshot — `_bmad-output/initiative-livescore-landing/sources/SERVICE-CAPABILITIES.md`

## Notes

- Waits on epic-marketing-content because: stable locale page routes to enumerate.
- Decision: 2026-11-10 — sitemap shape = **sitemap index + per-locale sitemaps**.
- Decision: 2026-11-10 — hreflang = all six URL locales + `x-default=en`.
- Decision: 2026-11-10 — `llms.txt` and `llms-full.txt` live under `public/`.
- Decision: 2026-11-10 — `robots.txt` allows indexable locale marketing pages and points to the sitemap index.
- Decision: 2026-11-10 — JSON-LD: Organization / SoftwareApplication / FAQPage where applicable; claims from SERVICE-CAPABILITIES only.
- Decision: 2026-11-10 — Indexable set = all 8 locked routes × 6 locales under `https://football-live-bot.online` (including official-channels before live data).
- Locked sitemap (from epic-marketing-content Notes; URL prefix `ar|en|es|fr|pt|ru`):
  - `/{locale}` → `home.md`
  - `/{locale}/guide/groups` → `guide-groups.md`
  - `/{locale}/guide/channels` → `guide-channels.md`
  - `/{locale}/official-channels` → `official-channels.md`
  - `/{locale}/pricing` → `pricing.md`
  - `/{locale}/faq` → `faq.md`
  - `/{locale}/privacy` → `privacy.md`
  - `/{locale}/terms` → `terms.md`
- Decision: 2026-11-10 — tracer bullet = story 1 `Robots and absolute sitemap index` (hitl). Least-certain next = story 2 canonical + hreflang + x-default. Parallel after 2: meta/OG/Twitter (ordered after 2 — same metadata lane) and JSON-LD; llms* after 1. Closing refactor sweep; declined separate e2e suite — entry `verify` lines are the checks. Tooling `.agents/` / `_bmad/` / `skills-lock.json` stays gitignored (same as epic 2).
