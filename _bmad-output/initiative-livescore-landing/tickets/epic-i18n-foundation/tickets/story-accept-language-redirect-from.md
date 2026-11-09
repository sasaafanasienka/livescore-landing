---
id: 2
type: story
title: "Accept-Language redirect from /"
parent: epic-i18n-foundation
covers: [R3]
after: [1]
hitl: false
risk: high
---

# Accept-Language redirect from /

## Description

Root / negotiates Accept-Language and redirects to the matching locale prefix, falling back to /en, without permanently locking crawlers to one locale.

## Requirements

Verify: Request / with Accept-Language: ru redirects to a /ru URL; request / without a usable language preference redirects to /en.

## References

- parent — _bmad-output/initiative-livescore-landing/tickets/epic-i18n-foundation/epic-i18n-foundation.md
