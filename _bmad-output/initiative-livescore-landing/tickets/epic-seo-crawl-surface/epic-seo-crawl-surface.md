---
tracker_id: ""
type: epic
title: "Crawlable SEO and LLM surfaces"
parent: initiative-livescore-landing
covers: ["R1", "R7"]
sources: []
companions: []
after: ["epic-marketing-content"]
risk: medium
refined: false
---

# Crawlable SEO and LLM surfaces

## Description

Production crawl kit on top of stable marketing routes: `robots.txt`, complete sitemap coverage with absolute `https://football-live-bot.online` URLs, canonical + hreflang, per-page locale metadata/OG/Twitter, relevant JSON-LD, plus `llms.txt` and `llms-full.txt`.

## Outcome

Search engines and LLM crawlers can discover, alternate-link, and summarize the full public marketing surface without manual URL lists.

## Done when

1. `robots.txt`, sitemap(s), `llms.txt`, and `llms-full.txt` are publicly reachable.
2. Sitemaps list all indexable locale URLs with absolute host URLs.
3. Home + at least one guide show coherent canonical and hreflang alternates.
4. Per-page meta/OG (and JSON-LD where applicable) present per locale.
5. Deployed (or production-equivalent) verification of the above passes.

## Boundaries

- In: robots, sitemaps, hreflang/canonical hardening, metadata/OG/Twitter, JSON-LD, llms files.
- Out: writing marketing body copy (epic 2); channels live data (epic 4).
- R1 here: absolute URL emission in sitemaps/SEO artifacts — app metadata base owned by epic 1.
- May list the channels route before live data exists.

## References

- parent — `_bmad-output/initiative-livescore-landing/initiative-livescore-landing.md`, section Requirements (R1, R7)
- companion — `_bmad-output/initiative-livescore-landing/content-and-seo-surface.md`

## Notes

- Waits on epic-marketing-content because: stable locale page routes to enumerate.
