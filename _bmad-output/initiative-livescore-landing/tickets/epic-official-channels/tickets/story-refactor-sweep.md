---
id: 4
type: story
title: "Refactor sweep"
parent: epic-official-channels
after: [1, 2, 3]
hitl: false
risk: low
---

# Refactor sweep

## Description

Cleanup-only pass over deferred nits from this epic's plans and reviews (adapter typing, duplicated state branching, label-key naming, test helpers); no new scope, no new features.

## Requirements

Verify: pnpm exec next build and pnpm run lint pass; offline checks (pnpm dlx tsx asserts, GET /api/official-channels on :4313) still green; the story plan at its start lists exactly the cleanup items and nothing beyond them.

## References

- parent — _bmad-output/initiative-livescore-landing/tickets/epic-official-channels/epic-official-channels.md
