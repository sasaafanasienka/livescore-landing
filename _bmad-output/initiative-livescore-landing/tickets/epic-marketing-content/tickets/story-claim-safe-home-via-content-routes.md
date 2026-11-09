---
id: 1
type: story
title: "Claim-safe home via content routes"
parent: epic-marketing-content
covers: [R1, R3, R4, R5]
after: []
hitl: true
risk: medium
---

# Claim-safe home via content routes

## Description

Tracer: extends the content/{locale}/{page}.md loader into a marketing page-route contract, replaces the home placeholder with claim-safe Live Score home copy in all six locales, keeps the LiveScoreAppBot CTA, and documents the locked sitemap URL↔file map for sibling stories.

## Requirements

Verify: Each of /ar /en /es /fr /pt /ru returns 200 with claim-safe home body from content/{locale}/home.md (pt→pt-BR); primary CTA opens https://t.me/LiveScoreAppBot; home copy has no predictions/Discord/player-follow/live highlights-cron/personal Premium.

## References

- parent — _bmad-output/initiative-livescore-landing/tickets/epic-marketing-content/epic-marketing-content.md
