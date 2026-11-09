---
tracker_id: ""
type: epic
title: "Claim-safe marketing pages in git"
parent: initiative-livescore-landing
covers: ["R3", "R4", "R5", "R8"]
sources: []
companions: []
after: ["epic-i18n-foundation"]
risk: high
refined: false
---

# Claim-safe marketing pages in git

## Description

Delivers the adapted competitor page jobs—home, group guide, channel guide, official-channels slot, pricing, FAQ, privacy, terms—in all six locales from in-repo content files. Copy and CTAs stay claim-safe against `SERVICE-CAPABILITIES.md`. Official channels may be a static shell/placeholder until epic 4 wires the live list.

## Outcome

A prospect in any supported language can learn what Live Score actually ships, follow group/channel setup guides, see chat Premium facts, and start the bot without leaving the marketing site for a fake Mini App clone.

## Done when

1. Agreed page set exists for every locale without missing-route 404s.
2. Spot-check of Premium, bot identity, and audience claims matches the capabilities catalog.
3. No CMS; content editable as repo files.
4. Primary CTAs open `LiveScoreAppBot` / existing Mini App entry paths.
5. Predictions, Discord, player-follow, and live highlights-cron are absent from copy.

## Boundaries

- In: page IA, content model, locale copy, FAQ/legal/pricing/guides, CTA wiring, claim QA.
- Out: robots/sitemaps/`llms*` (epic 3); live channels fetch (epic 4); product API changes.
- Sibling handoff: leaves a channels page/section slot and stable routes for SEO and channels epics.
- Bound by initiative C1–C4.

## References

- parent — `_bmad-output/initiative-livescore-landing/initiative-livescore-landing.md`, section Requirements (R3, R4, R5, R8)
- companion — `_bmad-output/initiative-livescore-landing/competitor-ia.md`
- source snapshot — `_bmad-output/initiative-livescore-landing/sources/SERVICE-CAPABILITIES.md`

## Notes

- Assumption: pricing may be dedicated route or crawlable home section (initiative).
- Open question: legal entity/contact/law for Privacy/Terms — blocks accurate legal pages until answered.
- Waits on epic-i18n-foundation because: locale routing, RTL, siteUrl, brand shell, content-file layout.
