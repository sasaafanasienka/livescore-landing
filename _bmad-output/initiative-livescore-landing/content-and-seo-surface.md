# Content & SEO surface

Companion to initiative Requirements. HOW-level inventory; WHAT stays on the ticket.

## Locales

| Product / content id | URL prefix | Notes |
|----------------------|------------|-------|
| `ar` | `/ar` | RTL |
| `en` | `/en` | Default / fallback locale |
| `es` | `/es` | |
| `fr` | `/fr` | |
| `pt-BR` | `/pt` | URL slug shortened; content folder stays `pt-BR` |
| `ru` | `/ru` | |

Every marketing URL exists in all six (or returns explicit alternate strategy documented in SEO story).

Root `/` negotiates `Accept-Language` and redirects to a locale prefix (fallback `/en`). Indexable content lives under `/{locale}/…`; `hreflang` + `x-default` finalized in epic-seo-crawl-surface.

## Content ownership

- **In git:** all copy, FAQ, guides, legal, pricing tables, meta titles/descriptions, `llms.txt` / `llms-full.txt` bodies.
- **From API:** official league channels list only (`id`, `title`, `logo`, `link` shape from catalog).
- Agents edit content files; no CMS.

## SEO artifacts (must ship)

| Artifact | Expectation |
|----------|-------------|
| `robots.txt` | Allows indexing of locale pages; points to sitemap index |
| Sitemap index + per-locale (or equivalent complete coverage) | All indexable URLs; lastmod when practical |
| Canonical + hreflang | Every page declares self + all locale alternates |
| Meta + Open Graph + Twitter | Per page, per locale |
| JSON-LD | Organization / SoftwareApplication / FAQPage where applicable |
| `llms.txt` | Machine-readable site summary + key links |
| `llms-full.txt` | Expanded crawlable product/content summary for LLM agents |

## Product facts allowed in copy (from capabilities)

- Bot: `LiveScoreAppBot`
- Personal / group / channel audiences + Mini App routes at marketing altitude (no false Mini App deep-link maze)
- Notification types that ship; defaults as catalogued
- Chat Premium: `chat_prem`, **49** Stars, **30** days, **24h** grace; free chat quota **1** combined team\|league favourite
- Official channels: discoverable owner channels via list API (auth path TBD for public site)
- Soft-disabled / not configured: do not overclaim (highlights cron empty; personal Premium absent)

## Domain

Canonical host: `https://football-live-bot.online`
