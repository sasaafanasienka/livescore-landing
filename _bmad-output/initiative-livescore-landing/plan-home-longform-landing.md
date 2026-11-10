---
title: 'Longform claim-safe home landing'
type: feature
ticket: ''
created: '2026-11-10'
status: built
baseline_revision: '0a88912369aa1b7d5dde11e2b5575123ecd5cca2'
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - _bmad-output/initiative-livescore-landing/competitor-ia.md
  - _bmad-output/initiative-livescore-landing/content-and-seo-surface.md
  - _bmad-output/initiative-livescore-landing/sources/SERVICE-CAPABILITIES.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Home (`/{locale}`) is a single centered markdown blob + CTA. That is not a marketing landing. Competitor IA (footylive.org section jobs) and the product need one long page: sell → show product → explain → price → channels → FAQ → CTA → footer.

**Approach:** Replace the home markdown shell with a sectioned HomeLanding composed in the Finwise/Next template. Structure mirrors the competitor home jobs adapted to Live Score facts; copy and CTAs stay claim-safe. Dedicated `/pricing` and `/faq` routes stay; home carries matching sections plus deep links.

## Boundaries & Constraints

**Always:**
- Section order on home: Hero (selling copy + bot CTA) → Notifications benefits + screenshot → Mini App capabilities + screenshot → How it works (tabs) → Pricing (tabs) → Official channels (heading, description, carousel/links) → FAQ → closing CTA → existing shell Footer.
- Pricing tabs: (1) Personal — free, unlimited, no Stars plan; (2) Groups & channels — free tier (1 team|league favourite) + Chat Premium **49** Stars / **30** days / **24h** grace.
- How-it-works tabs cover Personal / Groups / Channels setup steps consistent with catalog (`/start`, `/group`, `/channel`, Mini App favourites/settings).
- Primary CTAs → `https://t.me/LiveScoreAppBot` (`siteDetails.botUrl`).
- Claims only from `SERVICE-CAPABILITIES.md`. Brand **Live Score**, bot **LiveScoreAppBot**.
- Keep locale-prefixed sitemap and existing Header/Footer routes. Reuse official-channels list data path for the home channels section.
- Screenshot slots remain real `<Image>` placeholders the operator can swap by replacing files under `public/images/`.
- **Decision (screenshots):** Wire named assets `public/images/home-notifications.webp` and `public/images/home-miniapp.webp` (create placeholder files now; drop-in replace by filename later).
- **Decision (locales):** Full longform home copy in all six locales (`ar|en|es|fr|pt-BR|ru`).
- **Decision (FAQ):** Compact claim-safe home FAQ (~8–12 questions) adapted from competitor themes we actually ship.

**Never:**
- Predictions, Discord, player-follow, live highlights-cron, personal Premium / Stars for personal chats, fake web Mini App clone, CMS.
- Pixel-clone footylive brand/CSS or copy their non-shipped feature claims.
- Delete dedicated `/pricing`, `/faq`, guides, or official-channels routes.
- Remove files.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Happy home | `GET /en` (and each of 6 locales) | 200; all sections above visible; CTA opens bot URL | No error expected |
| Channels OK | Upstream/list available | Carousel/list shows linked official channels | — |
| Channels degraded | Upstream error / empty / unconfigured | Section still renders heading+description; list shows existing degraded/empty UI pattern from official-channels | No crash; no client `/api/channels` round-trip required if server fetch used |
| Claim scan | Home copy + FAQ/pricing section strings | No banned claim tokens (predictions, Discord, player-follow, personal Premium, live highlights pipeline) | Fail verification if present |
| Tab UI | Click How-it-works / Pricing tabs | Panel content switches; one selected tab | Keyboard-accessible tabs |

</frozen-after-approval>

## Code Map

- `src/app/[locale]/page.tsx` — swap `MarketingMarkdownPage` for HomeLanding; keep JSON-LD + `generateMetadata`.
- `src/components/MarketingMarkdownPage.tsx` — leave for non-home marketing pages; do not force home through it.
- Dead Finwise section comps (`Hero.tsx`, `Benefits.tsx`, `FAQ.tsx`, `CTA.tsx`, `Section.tsx`, `Pricing/*`, `data/faq.ts`, `data/pricing.ts`, `data/hero.ts`) — pattern/CSS reuse only; strip Finwise/AppStore claims; prefer new `src/components/home/*` rather than resurrecting Finwise data.
- `src/app/[locale]/official-channels/page.tsx` + `OfficialChannelsList` + `src/lib/official-channels.ts` — reuse server fetch + list/degraded UI inside home channels section (carousel wrapper OK).
- `content/{locale}/home.md` — stop being the sole home body; either shrink to meta-only frontmatter or stop loading for body. Dedicated `content/{locale}/faq.md` + `pricing.md` stay for their routes; home section copy lives in structured locale modules (prefer `content/home/` or `messages` + typed section data — decide in tasking toward in-repo editable files, not CMS).
- `messages/{locale}.json` `Shell.*` — CTA label reuse; do not stuff entire page into Shell.
- `src/components/Header.tsx` / `Footer.tsx` / `data/menuItems.ts` — keep; home does not replace footer.
- Claim source: `_bmad-output/.../sources/SERVICE-CAPABILITIES.md`.

## Tasks & Acceptance

**Execution:**
- [x] `src/components/home/*` — build HomeLanding + section components (Hero, Notifications, MiniApp, HowItWorksTabs, PricingTabs, OfficialChannelsHome, FaqAccordion, ClosingCta) using Finwise spacing/typography tokens, Headless UI tabs/disclosure where needed — page composition needs real sections, not markdown paste.
- [x] `src/app/[locale]/page.tsx` — render HomeLanding; preserve metadata/JSON-LD — home entrypoint switch.
- [x] Structured locale copy for home sections in all six locales — claim-safe selling/benefits/how/pricing + compact FAQ (~8–12) strings.
- [x] `public/images/home-notifications.webp` + `public/images/home-miniapp.webp` — create placeholders and wire Image slots to those paths.
- [x] Home official-channels section — embed list via existing server data path + carousel/horizontal scroller with external Telegram links.
- [x] Claim/regression check script or manual grep gate in Verification — prevent banned claims regressing into home.

**Acceptance Criteria:**
- Given any in-scope locale home URL, when loaded, then sections appear in the Intent order with bot CTA(s) pointing at LiveScoreAppBot.
- Given Pricing tabs, when Personal selected, then copy states personal use is free/unlimited with no Stars plan; when Groups & channels selected, then free 1 favourite + Chat Premium 49/30/24h facts.
- Given How-it-works tabs, when each audience tab is selected, then steps match catalog registration/use paths without competitor-only features.
- Given official channels section, when list resolves, then channel links are present; when degraded, then section still renders without breaking the page.
- Given home copy, when scanned for banned claims, then none appear.
- Given `/pricing` and `/faq`, when requested, then they still 200 (dedicated routes untouched in job).

## Implementation Notes

- 2026-11-10: Implementer shipped `src/components/home/*`, `content/home/{locale}.json` (6 locales), named screenshot placeholders, `check:home-claims`. Parent added `scripts/contracts/home-landing.contract.ts` + `pnpm check:home-landing` to cover frozen I/O matrix rows (happy copy/composition, channels ok/degraded markup, claims, Headless tabs, dedicated routes).

## Plan Change Log

## Review Triage Log

### 2026-11-10 quick pass

| finding | verdict | route | evidence |
|---------|---------|-------|----------|
| Suspense fallback omits channels heading/description | medium | patch | Verified: `OfficialChannelsHomeFallback` is only `OfficialChannelsLoading` inside section; matrix Always wants heading+description on the section. Dedicated `/official-channels` keeps shell outside Suspense. |
| OfficialChannelsHome forks list UI vs OfficialChannelsList | false | reject | Frozen Always requires reuse of the **list data path** (`getOfficialChannels`); that is used. Component-level compose of `OfficialChannelsList` is Code Map preference, not a demonstrated user-facing defect. |
| claim-gate misses `live highlights pipeline` | medium | patch | Verified: `scripts/check-home-claims.mjs` only matches `highlights? cron`; matrix Claim scan lists `live highlights pipeline`. |
| Defaults copy omits catalog `highlight: on` | low | patch | Verified in `content/home/en.json` (+localese): “favour goals and finals” while catalog defaults also set `highlight: on`. Direct copy correction. |
| FaqAccordion hardcoded English `FAQ` eyebrow | medium | patch | Verified `FaqAccordion.tsx` line with literal `FAQ` while `ar` title is localized. |
| Screenshot assets unproven by review diff/contract | false | reject | `public/images/home-*.webp` exist in the tree (valid WebP); review diff excluded binaries by design. Not an unmet AC. |

## Design Notes

Competitor home jobs (live footylive.org, 2026-11-10): Hero mockup+CTAs → feature promos → audience blocks → feature grid → How It Works tabs (Groups / Channels / Personal) → Free vs Premium → FAQ accordion → bottom CTA → footer. Adapt jobs, not claims: our How-it-works + Pricing tab labels follow user intent (Personal free; Groups&Channels free+paid), notifications + Mini App get dedicated screenshot bands, official channels become a carousel powered by our list API path.

Finwise is the visual chassis (gradients/grid already in unused Hero). Do not reintroduce App Store buttons or Finwise pricing tiers.

## Verification

**Commands:**
- `pnpm lint` -- expected: clean
- `pnpm build` -- expected: success; locale homes compile
- `pnpm check:home-claims` -- expected: no banned claim tokens
- `pnpm check:home-landing` -- expected: matrix contract cases pass

**Manual checks:**
- `/en` scroll: section order + both tab groups + channels carousel + FAQ open/close + CTA
- `/ru` (and any other shipped locale): same structure
- Channels degraded: heading/description still visible
