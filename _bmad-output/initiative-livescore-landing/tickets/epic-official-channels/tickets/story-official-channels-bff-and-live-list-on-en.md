---
id: 1
type: story
title: "Official channels BFF and live list on en"
parent: epic-official-channels
covers: [R1, R4, R5, R6, R10]
after: []
hitl: false
risk: high
---

# Official channels BFF and live list on en

## Description

Tracer: thin vertical slice — contract type { id, title, logo, link }, Next.js Route Handler GET /api/official-channels (nodejs) with an upstream adapter (OFFICIAL_CHANNELS_API_URL, OFFICIAL_CHANNELS_REVALIDATE default 300, AbortSignal timeout ~5s, tags [official-channels]), unconfigured mode { data: { items: [] }, mode: unconfigured }, OFFICIAL_CHANNELS_FIXTURE=1 fixture mode, and the live list rendered over the existing /en/official-channels slot with en list labels; md keeps only the shell.

## Requirements

Verify: pnpm exec next build passes; with $env:OFFICIAL_CHANNELS_FIXTURE='1' pnpm exec next start -p 4310, GET /en/official-channels shows the fixture titles and https://t.me/... links and GET /api/official-channels returns { data: { items }, mode: "fixture" } with upstream order preserved; with both env vars unset the same GET returns items [] and mode "unconfigured" and the page shows the empty state; a pnpm dlx tsx assert over .next/static finds no /api/channels string in client chunks and the response shape matches the { id, title, logo, link } type.

## References

- parent — _bmad-output/initiative-livescore-landing/tickets/epic-official-channels/epic-official-channels.md
