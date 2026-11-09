# Intake brief — Live Score marketing site

Captured 2026-11-09 from product-owner session. Authoritative for marketing-site intent; product facts defer to `SERVICE-CAPABILITIES.md`.

## Intent

Build a production marketing / SEO landing site for the Live Score Telegram product, using the Next.js template already in `livescore-landing`, aimed at first-page organic discovery.

## Decisions already made

| Decision | Value |
|----------|-------|
| Production domain | `https://football-live-bot.online` |
| Locales | `ar`, `en`, `es`, `fr`, `pt-BR`, `ru` (all present in the product app) |
| Content storage | In-repo; agents/NNs edit content files |
| Live data exception | Official league channels list fetched from product API |
| Competitor IA reference | https://footylive.org/ (structure to adapt; not feature parity) |
| Required AI crawler files | `llms.txt` and `llms-full.txt` |
| SEO bar | Sitemaps, robots, hreflang/canonical, metadata, structured data — production-grade |

## Product pointer

- Bot username: `LiveScoreAppBot` (no `@`)
- Surfaces: personal DM, groups, channels, Mini App
- Capability inventory: sibling source `SERVICE-CAPABILITIES.md` (snapshot from `C:\DIY\live-score\docs\SERVICE-CAPABILITIES.md`)

## Non-goals from product catalog

Do not market features the catalog marks absent or soft-disabled as live: match predictions / tipster, Discord, player-follow UX, scheduled highlights cron as currently running, personal Premium (chat-only Premium).

## Channels API note (landing-relevant)

Catalog: `GET /api/channels` returns `{ data: { items: [{ id, title, logo, link }] } }` and currently requires Telegram Mini App auth. Landing needs a public-safe consumption path — unresolved at intake.
