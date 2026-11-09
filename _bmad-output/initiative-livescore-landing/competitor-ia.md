# Competitor IA — footylive.org (adapted)

Snapshot from public pages / search snippets, 2026-11-09. Use as **structure reference**, not claim parity.

## Observed Telegram marketing surface

| Path / block | Role |
|--------------|------|
| `/` | Hero + feature grid + free vs premium + FAQ + CTA to bot |
| `/guide/groups` | How to connect a Telegram group |
| `/guide/channels` | How to connect a Telegram channel + channel premium table |
| Discord subtree (`/discord`, terms, privacy) | Separate product surface — **out for us** |
| Mini app at `/app` | Product app — **out** (ours stays Telegram Mini App) |
| Legal / FAQ blocks | Privacy, terms, support answers on home or linked pages |

## Feature themes on home (competitor)

Live alerts, group community, score predictions, channel autopost, multi-language, match stats, match cards, AI previews, free vs premium tables.

## Adaptation for Live Score

Keep the **page jobs**, drop claims we do not ship:

| Keep as page/section job | Drop / rewrite |
|--------------------------|----------------|
| Home hero → bot CTA | Predictions / leaderboards |
| Benefits: personal alerts, groups, channels, Mini App | Discord |
| Guide: groups | Player-follow |
| Guide: channels | AI match previews as product claim |
| Pricing / free vs Premium (chat Stars facts only) | Personal Premium tiers competitor-style |
| Official channels discovery | “13,000+ teams” etc. unless we can cite a real number |
| FAQ, Privacy, Terms | Soft-disabled highlights as always-on |

## Proposed site map (draft for Requirements)

Per locale prefix (exact routing scheme is implementation):

1. Home
2. Guide — Groups
3. Guide — Channels
4. Official channels (API-backed list)
5. Pricing (or home section + dedicated if needed for SEO)
6. FAQ (page or major home section with crawlable anchors)
7. Privacy
8. Terms
9. Static: `/robots.txt`, sitemap index + locale sitemaps, `/llms.txt`, `/llms-full.txt`
