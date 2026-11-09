---
tracker_id: ""
type: epic
title: "Live official channels without Mini App login"
parent: initiative-livescore-landing
covers: ["R6"]
sources: []
companions: []
after: ["epic-marketing-content"]
risk: high
refined: false
---

# Live official channels without Mini App login

## Description

Wires the official channels marketing surface to the product list contract `{ id, title, logo, link }` through a public-safe path (no end-user Telegram Mini App login). Owns the cross-repo touch point on Live Score (`GET /api/channels` façade or equivalent) and the landing consumer.

## Outcome

Visitors see the current official league channels list on the marketing site; updating channels in the product updates the site without editing content files.

## Done when

1. Channels page/section renders live items from the agreed contract.
2. Anonymous public visitors can load the list (C5).
3. Changing the upstream list changes the site without a content-file commit.
4. Failure/empty states are usable (no blank crash page).
5. Integrated check against a running API (or agreed stub with contract tests) passes in a production-like deploy.

## Boundaries

- In: public-safe channels access path, landing fetch/render, empty/error UX for the list.
- Out: inventing channel content in git as source of truth; other dynamic product datasets (C3); Mini App `/channels` UX rewrite.
- Touch point owned: Live Score public channels exposure (new public route, BFF, or approved alternative).
- Sibling: SEO epic may already list the URL; this epic fills data only.

## References

- parent — `_bmad-output/initiative-livescore-landing/initiative-livescore-landing.md`, section Requirements (R6) and Constraints (C5)
- source snapshot — `_bmad-output/initiative-livescore-landing/sources/SERVICE-CAPABILITIES.md`, Official league channels

## Notes

- Open question: public endpoint vs BFF vs build-time fetch — must settle before implementation stories.
- Waits on epic-marketing-content because: channels page slot and locale content model.
- Source conflict risk: catalog `GET /api/channels` requires Mini App auth today vs C5 — resolve via product change or mediated path, not by ignoring C5.
