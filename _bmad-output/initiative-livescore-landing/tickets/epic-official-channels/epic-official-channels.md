---
tracker_id: ""
type: epic
title: "Live official channels without Mini App login"
parent: initiative-livescore-landing
covers: ["R6"]
sources:
  - _bmad-output/initiative-livescore-landing/initiative-livescore-landing.md
  - _bmad-output/initiative-livescore-landing/sources/SERVICE-CAPABILITIES.md
companions:
  - _bmad-output/initiative-livescore-landing/content-and-seo-surface.md
after: ["epic-marketing-content"]
risk: high
refined: true
---

# Live official channels without Mini App login

## Description

Replaces the static official-channels slot (`/{locale}/official-channels`, shipped by epic-marketing-content) with a live list served through a public-safe path: a Next.js Route Handler `GET /api/official-channels` on the landing host does the server-side fetch into an upstream public endpoint on Live Score and re-serves `{ data: { items: [{ id, title, logo, link }] } }`. Owns the cross-repo touch point (contract + ready patch for Live Score), the landing fetch/render, the six-locale list copy, and the empty/error states.

## Outcome

Visitors see the current official league channels list on the marketing site; the product updating its channels updates the site on revalidation, without editing content files and without a Telegram Mini App login.

## Requirements

1. **R1 (parent R6):** `/{locale}/official-channels` renders a live list of `{ id, title, logo, link }` items supplied by the product's owner-channels list contract, replacing the static placeholder text; no item is authored in `content/*.md`.
2. **R2 (parent R6):** Anonymous public visitors load the list — no Telegram Mini App login, `initData`, or user token is required, and no end-user cookie is needed to render it (parent C5).
3. **R3 (refine 2026-11-10):** The upstream contract `GET /api/public/channels` → `{ data: { items: [{ id, title, logo, link }] } }` (same shape as the Mini App list, no `auth` middleware, data from `listOwnerChannels`) is recorded in this repo together with a ready-to-apply patch and its owner/path, so the product-side change can be applied without re-deciding the contract.
4. **R4 (refine 2026-11-10):** The browser never calls the Mini-App-authed `GET /api/channels`: the landing exposes its own server-side route `GET /api/official-channels` (nodejs runtime) returning `{ data: { items }, mode }`, configured by env (see Notes D1, D3), and the page reads from that route only.
5. **R5 (refine 2026-11-10):** The list stays fresh without a content commit or a content deploy: a product-side change becomes visible through revalidation of the server-side fetch (Notes D5); a build-time-only fetch is not acceptable as the only path.
6. **R6 (refine 2026-11-10):** Item rendering follows the capability facts: nullable `logo` renders a placeholder/initials instead of a broken image, `link` renders as an external `https://t.me/<username>` link (`rel="noopener noreferrer"`), and upstream order is preserved (no local sorting).
7. **R7 (refine 2026-11-10):** Empty, unconfigured and failure states are usable: unset upstream env → empty list with an explanatory empty state; upstream timeout, non-200 or malformed payload → page still renders 200 with an error/degraded state; no blank page, no crash, no stack trace in HTML.
8. **R8 (refine 2026-11-10):** All six locales render the list, the empty state and the failure state with labels from `messages/{locale}.json` (list namespace); `ar` is RTL with logical CSS properties; `content/{locale}/official-channels.md` keeps only the shell copy (Notes D6).
9. **R9 (refine 2026-11-10):** Claims and existing surfaces are not disturbed: list copy states that these are the app owner's official channels, distinct from a user's `/channel` profiles, and adds nothing beyond `SERVICE-CAPABILITIES` "Official league channels"; robots/sitemap/hreflang/JSON-LD/`llms*` are unchanged and `/official-channels` remains reachable and sitemapped in all six locales.
10. **R10 (refine 2026-11-10):** Fixture data is possible only behind an explicit dev switch (`OFFICIAL_CHANNELS_FIXTURE=1`), is never a source of truth for channels, and cannot leak into a production render (Notes D4).

## Constraints

1. **C1 (parent C1):** No CMS and no channel list in git as source of truth; copy changes remain file edits, list changes come from the product.
2. **C2 (parent C2):** No claim of predictions, Discord, player-follow, a live scheduled highlights pipeline, or personal Premium — in the list labels or in new copy.
3. **C3 (parent C3):** Official channels stay the only dynamic product dataset on the marketing site; no other product list is wired by this epic.
4. **C4 (parent C5):** The public path must not require end-user Telegram Mini App login; a server-mediated public path is the binding shape.
5. **C5 (refine 2026-11-10):** The product-side change lives in Live Score and is applied by its owner; this repo ships contract + patch + config and must work with the upstream absent (unconfigured/failure states), so landing work never blocks on the product deploy.
6. **C6 (refine 2026-11-10):** Epic-3 SEO surfaces are done and frozen: no robots/sitemap/hreflang/JSON-LD/`llms*` edits, and `MARKETING_SITEMAP` keeps `official-channels`.

## Done when

1. With `OFFICIAL_CHANNELS_API_URL` pointed at a stub upstream returning two items, `/en/official-channels` shows both titles and their `https://t.me/...` links, and `GET /api/official-channels` returns the same items in upstream order.
2. Anonymous requests (no cookies, no tokens) to the page and to the BFF get 200, and the served client bundles make no request to `/api/channels`.
3. Changing the stub payload and revalidating changes the rendered list with no `content/*.md` edit and no content commit.
4. Unconfigured env renders a usable empty state; upstream 500/timeout renders a 200 page with a usable failure state; neither crashes nor leaks a stack trace.
5. All six locales (`ar` RTL) render list, empty and failure labels from `messages/*.json`, and `/{locale}/official-channels` stays in the sitemap for all six.
6. Production-like deploy verification (`next build` + `next start` + HTTP asserts) passes for the above.

## Boundaries

- In: landing BFF route, upstream adapter (env/revalidate/timeout), contract recording + upstream patch artifact, live list rendering, six-locale list labels, empty/loading/error states, fixture switch for tests.
- Out: writing channel content in git as source of truth; SEO kit rewrite; CMS; Mini App `/channels` UX; other dynamic product datasets; predictions/Discord/player-follow/highlights-cron/personal Premium.
- Touch point: Live Score public channels exposure — `GET /api/public/channels` on `C:/DIY/live-score/apps/server/src/app.ts` (beside `app.get("/api/channels", auth, …)`), data from `packages/core/src/channels/owner-channels.ts` (`listOwnerChannels`); owner: epic-official-channels (ships contract + patch; applied by the live-score owner).
- Must not change: static shell copy of other marketing pages, Mini App `/channels` page, robots/sitemap/hreflang/JSON-LD/`llms*`, `MARKETING_SITEMAP` membership.
- Sibling: epic-marketing-content owns the slot page and content model (done); epic-seo-crawl-surface owns the URL's SEO surface (done) — this epic only fills data.

## References

- parent — `_bmad-output/initiative-livescore-landing/initiative-livescore-landing.md`, section Requirements (R6) and Constraints (C3, C5)
- source snapshot — `_bmad-output/initiative-livescore-landing/sources/SERVICE-CAPABILITIES.md`, "Official league channels" (list endpoint, response shape, eligibility, ordering, nullability)
- companion — `_bmad-output/initiative-livescore-landing/content-and-seo-surface.md` (content ownership: only the channels list comes from the API)
- product — `C:/DIY/live-score/apps/server/src/app.ts`, `GET /api/channels` with `auth` (~line 761) and the admin/actor routes around it
- product — `C:/DIY/live-score/packages/core/src/channels/owner-channels.ts`, `listOwnerChannels(db, appOwnerUserId)` (pure DB read; no user context)
- product — `C:/DIY/live-score/docs/SERVICE-CAPABILITIES.md`, "Official league channels"
- landing slot — `_bmad-output/initiative-livescore-landing/tickets/epic-marketing-content/tickets/story-official-channels-static-slot-page.md`
- landing route — `src/app/[locale]/official-channels/page.tsx`, `src/lib/content.ts`, `src/lib/seo-sitemap.ts`, `src/i18n/routing.ts`, `messages/*.json`, `content/*/official-channels.md`

## Notes

- Decision: 2026-11-10 — D1 public path is the landing BFF, not a client call: browser never talks to the Mini-App-authed `GET /api/channels`; Next.js Route Handler `src/app/api/official-channels/route.ts` (runtime `nodejs`) performs the server-side fetch and re-serves `{ data: { items }, mode }`. Answers the old open question (public endpoint vs BFF vs build-time) as: **public upstream endpoint + landing server-side BFF**; build-time-only and browser-direct are both rejected.
- Decision: 2026-11-10 — D2 upstream target contract `GET /api/public/channels` on Live Score → `{ data: { items: [{ id, title, logo, link }] } }`: same shape as the Mini App list, **no `auth` middleware**, data from `listOwnerChannels` (Notes R3).
- Decision: 2026-11-10 — D3 config: `OFFICIAL_CHANNELS_API_URL` (full upstream endpoint URL; unset → `mode: "unconfigured"`, `items: []`), `OFFICIAL_CHANNELS_REVALIDATE` (seconds, default 300), fetch timeout via `AbortSignal` (default ~5 s). No secrets or tokens — the path is public.
- Decision: 2026-11-10 — D4 stub/fixture: unset env → `{ data: { items: [] }, mode: "unconfigured" }` + usable empty state; a same-shape fixture is allowed **only** with explicit `OFFICIAL_CHANNELS_FIXTURE=1` (dev/contract tests) and is never the source of truth; no channel lists in `content/*.md`.
- Decision: 2026-11-10 — D5 revalidate strategy: BFF uses `fetch(url, { next: { revalidate, tags: ["official-channels"] } })` and the page declares `export const revalidate`; a product-side change reaches the page without a content commit or content deploy. No pure build-time-only fetch.
- Decision: 2026-11-10 — D6 copy split: `content/{locale}/official-channels.md` keeps the shell only (title, intro, the "official owner channels, not your `/channel` profiles" line); list headings and empty/error/loading labels come from `messages/{locale}.json` (dedicated list namespace) + BFF payload. The list is never rendered from md.
- Decision: 2026-11-10 — D7 locales: six — URL `ar|en|es|fr|pt|ru`, content ids `ar|en|es|fr|pt-BR|ru` (`/pt` → `pt-BR`); every list UI string exists in all six; `ar` RTL via logical CSS properties.
- Decision: 2026-11-10 — D8 claims: only `SERVICE-CAPABILITIES` "Official league channels" facts — the app owner's public Telegram channels, `logo` nullable, `link` = `https://t.me/<username>`, upstream ordering preserved (no local sort), empty list possible; official channels ≠ user-registered `/channel` profiles. Nothing invented beyond capabilities.
- Decision: 2026-11-10 — D9 out of scope: SEO kit rewrite, CMS, Mini App `/channels` UX, other dynamic datasets, predictions/Discord/player-follow/highlights-cron/personal Premium. Epic 3 (done) is untouched: robots/sitemap/hreflang/JSON-LD/`llms*` unchanged, `official-channels` stays in `MARKETING_SITEMAP`, URL stays working in all six locales.
- Decision: 2026-11-10 — D10 cross-repo touch point not applied in this session: writes to `C:/DIY/live-score` are blocked (sandbox workspace-write, verified), so the product change ships as a recorded contract plus a ready patch `docs/upstream/live-score-public-channels.patch` (exact diff and paths) inside this repo, with owner/path in Boundaries; landing implementation does not wait on the product. Apply target: `apps/server/src/app.ts`, next to `app.get("/api/channels", auth, …)`, calling `listOwnerChannels(options.db, options.appOwnerUserId ?? null)`.
- Decision: 2026-11-10 — D11 tracer bullet = story 1 (BFF route + upstream adapter + fixture mode + live list on `en` over the existing slot); least-certain second = story 2 (real public-safe upstream: patch, integration env, contract-shape test against the stub, degradation when upstream is down); then story 3 (remaining locales, full empty/error/loading and accessibility states); close with story 4 "Refactor sweep" (>3 entries). Declined: build-time-only fetch, browser-direct fetch, committing channel lists, a separate end-to-end suite (entry `verify` lines are the checks). Tooling `.agents/` / `_bmad/` / `skills-lock.json` stays uncommitted.
- Decision: 2026-11-10 — D12 (implementation, story 4.1): the page and the BFF share `src/lib/official-channels.ts` instead of the page HTTP-calling its own route (a self-fetch would need a deploy-time base URL); the page is `force-dynamic` and freshness comes from the upstream `fetch` data cache (`OFFICIAL_CHANNELS_REVALIDATE`, tag `official-channels`), because page-level ISR would bake the degraded `mode` into the build and break per-mode runtime checks. R4 still holds: no browser path to the authed Mini App route, and `GET /api/official-channels` remains the only public HTTP surface.
- Decision: 2026-11-10 — D13 (implementation, story 4.1): the fixture switch is `OFFICIAL_CHANNELS_FIXTURE=1` **and** no `OFFICIAL_CHANNELS_API_URL` — a configured upstream always wins, so fixture rows cannot shadow real channels in a deploy that sets both.
- Decision: 2026-11-10 — D14 (implementation, story 4.2): upstream `id` is the product DB id and is **numeric** (`OwnerChannelItem.id: number`); the landing normalizes it to a string key so the agreed item shape `{ id, title, logo, link }` stays stable for React keys and the BFF. Recorded in `docs/upstream/README.md` with the rest of the contract.
- Decision: 2026-11-10 — D15 (implementation, story 4.2): the product-side change ships only as `docs/upstream/live-score-public-channels.patch` (verified with `git apply --check` against live-score `7bfb6d2`), not applied and not committed in `C:/DIY/live-score`; the operator runbook in `docs/upstream/README.md` covers apply, rollback, env, refresh and failure triage.
- Source conflict: C5 (initiative Constraints) — shipped `GET /api/channels` requires Telegram Mini App auth (`apps/server/src/app.ts`), so the public site cannot call it directly; resolved by D1 + D2 (public upstream route + landing BFF), not by ignoring C5.
- Waits on epic-marketing-content because: channels page slot and locale content model — satisfied (epic done); entries carry no cross-epic `after`.
