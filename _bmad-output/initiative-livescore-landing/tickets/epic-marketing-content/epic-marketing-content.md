---
tracker_id: ""
type: epic
title: "Claim-safe marketing pages in git"
parent: initiative-livescore-landing
covers: ["R3", "R4", "R5", "R8"]
sources:
  - _bmad-output/initiative-livescore-landing/initiative-livescore-landing.md
companions:
  - _bmad-output/initiative-livescore-landing/competitor-ia.md
  - _bmad-output/initiative-livescore-landing/content-and-seo-surface.md
  - _bmad-output/initiative-livescore-landing/sources/SERVICE-CAPABILITIES.md
after: ["epic-i18n-foundation"]
risk: high
refined: true
---

# Claim-safe marketing pages in git

## Description

Delivers the adapted competitor page jobs—home, group guide, channel guide, official-channels slot, pricing, FAQ, privacy, terms—in all six locales from in-repo content files. Copy and CTAs stay claim-safe against `SERVICE-CAPABILITIES.md`. Official channels may be a static shell/placeholder until epic 4 wires the live list.

## Outcome

A prospect in any supported language can learn what Live Score actually ships, follow group/channel setup guides, see chat Premium facts, and start the bot without leaving the marketing site for a fake Mini App clone.

## Requirements

1. **R1 (parent R3):** Site covers the adapted competitor page jobs — home, group guide, channel guide, official-channels slot, pricing, FAQ, privacy, terms — each locale-complete under the agreed locale-prefixed sitemap without missing-route 404s for those paths.
2. **R2 (parent R4):** Marketing claims match shipped product facts (bot `LiveScoreAppBot`, personal/group/channel + Mini App, chat Premium **49** Stars / **30** days / **24h** grace / free **1** team|league) and omit catalog non-goals and soft-disabled-as-live claims (no predictions, Discord, player-follow, live highlights-cron, personal Premium).
3. **R3 (parent R5):** All marketing copy for these pages lives in-repo at `content/{locale}/{page}.md` (product locale ids; `pt-BR` for URL `/pt`); no CMS. Official channels list stays API-owned (epic 4) — this epic ships a static slot/placeholder only.
4. **R4 (parent R8):** Primary CTAs deep-link into the Telegram bot / Mini App entry the product already uses (`LiveScoreAppBot` → `https://t.me/LiveScoreAppBot`), not a fake web Mini App clone.
5. **R5 (refine 2026-11-09):** Every indexable marketing page exists at the locked locale-prefixed paths and maps to the locked content filenames (see Notes Decision sitemap).
6. **R6 (refine 2026-11-09):** Primary nav and footer expose the locked labels and routes so every sitemap page is reachable from the shell without hash-only Finwise leftovers.
7. **R7 (refine 2026-11-09):** Pricing is a **dedicated route** (not only a home section); home may still summarize free vs Premium but the canonical pricing URL is the dedicated page.
8. **R8 (refine 2026-11-09):** Privacy and Terms ship as **placeholders** with an explicit TODO plus a minimal operator template (service operator **Live Score**; contact via the Telegram bot); missing legal entity/law does **not** block this epic.

## Constraints

1. **C1 (parent C1):** No CMS; content changes are file PRs / agent edits in git.
2. **C2 (parent C2):** Copy must not claim predictions, Discord, player-follow, or a live scheduled highlights pipeline.
3. **C3 (parent C3):** No other dynamic product datasets on the marketing site beyond official channels (this epic does not fetch channels).
4. **C4 (parent C4):** footylive.org informs page jobs only — not brand, visuals, or feature parity.

## Done when

1. Agreed page set exists for every locale without missing-route 404s on the locked sitemap.
2. Spot-check of Premium, bot identity, and audience claims matches the capabilities catalog.
3. No CMS; content editable as repo files under `content/{locale}/{page}.md`.
4. Primary CTAs open `LiveScoreAppBot` / existing Mini App entry paths.
5. Predictions, Discord, player-follow, live highlights-cron, and personal Premium are absent from copy.
6. Official-channels route is a stable slot/placeholder ready for epic 4 live list wiring.
7. Privacy/Terms placeholders include TODO + operator/contact template without blocking ship.

## Boundaries

- In: page IA, content model, locale copy, FAQ/legal/pricing/guides, CTA wiring, claim QA, nav/footer labels for the sitemap, official-channels static slot.
- Out: robots/sitemaps/`llms*` (epic 3); live channels fetch (epic 4); product API changes; CMS; Mini App clone; Discord surface.
- Sibling handoff: leaves a channels page/section slot and stable routes for SEO and channels epics.
- Bound by initiative C1–C4.

## References

- parent — `_bmad-output/initiative-livescore-landing/initiative-livescore-landing.md`, section Requirements (R3, R4, R5, R8)
- companion — `_bmad-output/initiative-livescore-landing/competitor-ia.md`
- companion — `_bmad-output/initiative-livescore-landing/content-and-seo-surface.md`
- source snapshot — `_bmad-output/initiative-livescore-landing/sources/SERVICE-CAPABILITIES.md`

## Notes

- Decision: 2026-11-09 — Pricing is a **dedicated route** `/{locale}/pricing` (not home-section-only). Home may keep a short free-vs-Premium summary that links to pricing.
- Decision: 2026-11-09 — Legal Privacy/Terms are **placeholders** with explicit `TODO` for entity/law/contact details plus minimal template: operator = **Live Score**; contact = via Telegram bot `LiveScoreAppBot`. Does not block this epic; full counsel copy is later.
- Decision: 2026-11-09 — Locale-prefixed sitemap (URL prefix `ar|en|es|fr|pt|ru`; content folder `ar|en|es|fr|pt-BR|ru`):
  - `/{locale}` → `home.md`
  - `/{locale}/guide/groups` → `guide-groups.md`
  - `/{locale}/guide/channels` → `guide-channels.md`
  - `/{locale}/official-channels` → `official-channels.md` (static slot/placeholder; live list = epic 4)
  - `/{locale}/pricing` → `pricing.md`
  - `/{locale}/faq` → `faq.md`
  - `/{locale}/privacy` → `privacy.md`
  - `/{locale}/terms` → `terms.md`
- Decision: 2026-11-09 — Nav labels (EN canonical keys; localize via messages/content, same targets): primary **Groups** → `/guide/groups`, **Channels** → `/guide/channels`, **Official channels** → `/official-channels`, **Pricing** → `/pricing`, **FAQ** → `/faq`; footer **Privacy** → `/privacy`, **Terms** → `/terms`. Brand mark remains **Live Score** (home). Drop Finwise `#features` / `#testimonials` / `#pricing` hash nav.
- Waits on epic-i18n-foundation because: locale routing, RTL, siteUrl, brand shell, content-file layout.
