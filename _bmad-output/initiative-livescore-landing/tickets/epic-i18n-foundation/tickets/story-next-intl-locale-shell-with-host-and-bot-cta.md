---
id: 1
type: story
title: "next-intl locale shell with host and bot CTA"
parent: epic-i18n-foundation
covers: [R1, R2, R5]
after: []
hitl: true
risk: medium
---

# next-intl locale shell with host and bot CTA

## Description

Installs next-intl App Router [locale] routing for ar/en/es/fr/pt/ru (pt→pt-BR), sets siteUrl to football-live-bot.online, applies ar RTL, and shows a Live Score nav/footer shell with primary CTA to LiveScoreAppBot on the locale home (placeholder body). R5 part: shell + CTA only — no locale switcher.

## Requirements

Verify: Each of /ar /en /es /fr /pt /ru returns 200; /ar is RTL; page metadata/base uses https://football-live-bot.online; home shows Live Score chrome and a t.me/LiveScoreAppBot CTA.

## References

- parent — _bmad-output/initiative-livescore-landing/tickets/epic-i18n-foundation/epic-i18n-foundation.md
