---
id: 3
type: story
title: "Six-locale list copy and full states"
parent: epic-official-channels
covers: [R7, R8, R9]
after: [1, 2]
hitl: false
risk: medium
---

# Six-locale list copy and full states

## Description

Finishes the remaining five locales plus ar RTL: list heading, empty, loading and error labels in messages/{ar,en,es,fr,pt,ru}.json (URL locale ids, pt for pt-BR content), logical CSS properties for ar, and the complete empty/error/loading/accessibility states (aria-live, list semantics, focusable links) over the states proven in stories 1-2; content/*/official-channels.md keeps shell copy only and SEO surfaces stay untouched.

## Requirements

Verify: pnpm exec next build passes; pnpm exec next start -p 4312 then GET /{ar,en,es,fr,pt,ru}/official-channels each returns 200 and renders that locale's list labels from messages/*.json (ar document has dir=rtl and logical-property layout), the empty state appears for all six when env is unset, the error state appears for all six with the upstream down, and GET /sitemap.xml still lists /{locale}/official-channels for all six locales; a pnpm dlx tsx assert checks every list label key exists in all six message files.

## References

- parent — _bmad-output/initiative-livescore-landing/tickets/epic-official-channels/epic-official-channels.md
