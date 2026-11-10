---
id: 2
type: story
title: "Public upstream channels endpoint and degradation"
parent: epic-official-channels
covers: [R2, R3, R5]
after: [1]
hitl: false
risk: high
---

# Public upstream channels endpoint and degradation

## Description

Least-certain: writes the recorded upstream contract and the ready patch docs/upstream/live-score-public-channels.patch (GET /api/public/channels, no auth, listOwnerChannels) for the live-score owner, wires the adapter to a real stub upstream via OFFICIAL_CHANNELS_API_URL, adds a contract-shape test against that stub, and makes timeout/500/malformed responses degrade to a usable 200 error state instead of failing the page.

## Requirements

Verify: docs/upstream/live-score-public-channels.patch exists and its diff adds app.get("/api/public/channels") calling listOwnerChannels without the auth middleware; start a stub serving the contract on :4399 (pnpm dlx tsx), set $env:OFFICIAL_CHANNELS_API_URL='http://127.0.0.1:4399/api/public/channels', pnpm exec next start -p 4311, GET /api/official-channels returns the stub items in order; stop the stub (or return 500 / hang past the timeout) and GET /en/official-channels still returns 200 with the error state text and no stack trace; pnpm dlx tsx contract asserts pass against the stub payload.

## References

- parent — _bmad-output/initiative-livescore-landing/tickets/epic-official-channels/epic-official-channels.md
