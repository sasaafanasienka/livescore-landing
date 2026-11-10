---
title: 'Official channels BFF and live list on en'
type: feature
ticket: 1
created: '2026-11-10'
status: done
baseline_revision: '50fe3e18c80c759d1602c06016088e85c030b352'
route: full
route_source: auto
risk: high
review: quick
review_source: pinned
lenses_ran:
  - quick
review_loop_iteration: 0
followup_review_recommended: false
context: []
warnings: []
deferred:
  - summary: >-
      With a warm Next data cache and the upstream down, the page and BFF keep serving the last good channel list (stale-while-revalidate) instead of reporting `mode: "error"`.
    evidence: |-
      Observed on `next start -p 4312` with `OFFICIAL_CHANNELS_API_URL` pointed at a closed port after a previous run had cached a stub response for the same URL: both the page (`data-mode="live"`) and `GET /api/official-channels` returned the cached items. Clearing `.next/cache/fetch-cache` and restarting produced the expected `mode: "error"` on both surfaces. Cold-cache degradation is the verified behavior; warm-cache staleness is inherent to `fetch(..., { next: { revalidate } })`.
    location: >-
      src/lib/official-channels.ts:186
    severity: low
---

<intent-contract>

## Intent

**Problem:** `/{locale}/official-channels` is a static placeholder ("No channel directory is listed on this page"), so a public visitor cannot see the product's official channel list without opening the Telegram Mini App, and the browser must never call the Mini-App-authed `GET /api/channels`.

**Approach:** Tracer vertical slice вЂ” one server module holds the `{ id, title, logo, link }` contract and the upstream adapter (`OFFICIAL_CHANNELS_API_URL`, `OFFICIAL_CHANNELS_REVALIDATE`, fixture switch); a nodejs BFF route re-serves `{ data: { items }, mode }`; the `en` page renders that list over the existing md shell with en labels from a dedicated `OfficialChannels` namespace. Other five locales stay untouched.

## Boundaries & Constraints

**Always:** page and BFF read one shared server module (page never HTTP-calls its own BFF); upstream order preserved (no local sort); `logo` nullable в†’ initials placeholder, never `<img src="">`; channel links `https://t.me/<username>` with `target="_blank"` + `rel="noopener noreferrer"`; BFF always HTTP 200 with degraded state in `mode`; no cookies/`initData`/tokens/secrets; en shell copy claim-safe from `SERVICE-CAPABILITIES` (app-owner official channels в‰  user `/channel` profiles); no new dependencies.

**Never:** robots.ts, `sitemap.xml/**`, `sitemaps/**`, `src/lib/seo-*.ts`, `public/llms*`, JSON-LD, hreflang, `MARKETING_SITEMAP`; Mini-App `GET /api/channels` from browser or server; channel lists authored in `content/*.md`; the other five locales' content/messages; CMS, Mini App `/channels`, other datasets; writes to `C:/DIY/live-score`; `cache: "no-store"` on the upstream fetch; committing `.tmp/`, `.agents/`, `_bmad/`, `skills-lock.json`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Fixture | `OFFICIAL_CHANNELS_FIXTURE=1`, no upstream URL | BFF `{ data: { items: [3 fixture items] }, mode: "fixture" }` in fixture order; page shows fixture titles + `https://t.me/...` links | 200 |
| Unconfigured | no env at all | BFF `{ data: { items: [] }, mode: "unconfigured" }`, no network call; page 200 with empty state | 200 |
| Upstream down | `OFFICIAL_CHANNELS_API_URL` в†’ closed port / timeout / non-200 | BFF `{ data: { items: [] }, mode: "error" }`; page 200 with error state + bot CTA, no stack trace, no upstream URL | 200 |
| Upstream ok | stub `{ data: { items: [...] } }` | items normalized `{ id, title, logo, link }`, upstream order kept, rows with empty/non-string `id`/`title`/`link` dropped, missing `logo` в†’ `null`, `mode: "live"` | 200 |
| Item without logo | `logo: null` | initials circle, no `<img>` element for that row | n/a |
| Other locale | `GET /ru/official-channels` | unchanged static shell, no list, no missing-namespace error | 200 |
| Client chunks | `.next/static/**/*.js` | no `/api/channels` string | n/a |

</intent-contract>

## Code Map

- `src/lib/official-channels.ts` вЂ” NEW. `OfficialChannel` / `OfficialChannelsMode` / `OfficialChannelsResult`; `getOfficialChannels()`; `officialChannelsRevalidateSeconds()`; fixture list; payload normalizer. Env read per call (never module top level).
- `src/app/api/official-channels/route.ts` вЂ” NEW. `runtime = "nodejs"`, `dynamic = "force-dynamic"`, `GET()` в†’ `Response.json({ data: { items }, mode })`.
- `src/components/OfficialChannelsList.tsx` вЂ” NEW. Async server component: heading, count, `<ul>/<li>`, external anchors, initials placeholder, empty and error states (bot CTA), labels from `getTranslations({ locale, namespace: "OfficialChannels" })`.
- `src/components/MarketingMarkdownPage.tsx` вЂ” optional `children` slot rendered between md body and CTA (8 existing call sites pass none в†’ unchanged).
- `src/app/[locale]/official-channels/page.tsx` вЂ” `export const dynamic = "force-dynamic"`; render `<OfficialChannelsList />` only when `params.locale === "en"`; `generateMetadata` untouched.
- `messages/en.json` вЂ” add `OfficialChannels` namespace: `listHeading`, `emptyTitle`, `emptyBody`, `errorTitle`, `errorBody`, `logoAlt`, `openChannel`, `loading`, `count`.
- `content/en/official-channels.md` вЂ” shell only (title, intro, official-vs-`/channel` line, bot CTA); no channel list, no "no directory is listed" claim.
- Do not change: `robots.ts`, `src/app/sitemap.xml/**`, `src/app/sitemaps/**`, `src/lib/seo-*.ts`, `public/llms*`, `MARKETING_SITEMAP`, `messages/{ar,es,fr,pt,ru}.json`, `content/{ar,es,fr,pt-BR,ru}/official-channels.md`, layout, other page files.

## Tasks & Acceptance

**Execution:**
- [ ] `src/lib/official-channels.ts` вЂ” types, safe env parse (default 300 s), normalizer (drop invalid rows, `logo` в†’ `null`, http(s)-only `link`/`logo`), fixture (3 items `fixture-1..3`, `https://t.me/...`, `logo: null`), `fetch` with `next: { revalidate, tags: ["official-channels"] }` + `AbortSignal.timeout(5000)`, every failure в†’ `{ items: [], mode: "error" }` without throw
- [ ] `src/app/api/official-channels/route.ts` вЂ” nodejs BFF returning the shared loader result as `{ data: { items }, mode }`, always 200
- [ ] `src/components/OfficialChannelsList.tsx` вЂ” list/empty/error rendering with en labels, accessible semantics
- [ ] `src/components/MarketingMarkdownPage.tsx` вЂ” optional `children` slot
- [ ] `src/app/[locale]/official-channels/page.tsx` вЂ” dynamic rendering, en-only list, shell + list + CTA composition
- [ ] `messages/en.json` вЂ” `OfficialChannels` namespace only (no edits to `Brand`/`Shell`)
- [ ] `content/en/official-channels.md` вЂ” claim-safe shell rewrite
- [ ] Verify per `## Verification` (tsc, build, three servers, chunk scan)

**Acceptance Criteria:**
- Given `OFFICIAL_CHANNELS_FIXTURE=1` and no upstream URL, when GET `/en/official-channels`, then the HTML shows the fixture titles with `https://t.me/...` anchors and no "no directory" placeholder text, and GET `/api/official-channels` returns `mode: "fixture"` with the fixture order
- Given no channels env, when GET `/api/official-channels` and `/en/official-channels`, then the BFF returns `{ items: [], mode: "unconfigured" }` and the page renders the empty state with HTTP 200
- Given `OFFICIAL_CHANNELS_API_URL` pointing at a closed port, when GET `/en/official-channels`, then the page is 200 with the error state text and a bot CTA and contains no stack trace or upstream URL, and the BFF returns `{ items: [], mode: "error" }`
- Given the built app, when scanning `.next/static`, then no client chunk contains `/api/channels`, and BFF items carry exactly `id`, `title`, `logo`, `link`
- Given a product-side list change with `OFFICIAL_CHANNELS_REVALIDATE` seconds elapsed, when the page is requested again, then the rendered list follows upstream without any `content/*.md` edit or content commit

## Implementation Notes

### 2026-11-10 вЂ” tracer slice on en

**Decisions:**
- One shared server module `src/lib/official-channels.ts` serves both the page and `GET /api/official-channels`; the page never HTTP-calls its own BFF (recorded for 4.2/4.3).
- `mode` is read from env per call (never at module top level). Precedence: fixture в†’ `unconfigured` в†’ `live` / `error`. The BFF and the page both stay HTTP 200.
- Page renders per request (`export const dynamic = "force-dynamic"`) instead of `export const revalidate`: page-level ISR bakes `mode` into the build artifact, so the fixture / unconfigured / error switch could not be observed on one build (the story's own verify runs three starts on one build). Freshness is the Next data cache вЂ” `fetch(..., { next: { revalidate: OFFICIAL_CHANNELS_REVALIDATE ?? 300, tags: ["official-channels"] } })`; a product-side change reaches the page with no content edit, commit or deploy (verified: stub payload change appeared after the revalidate window).
- Fixture gate: exact `OFFICIAL_CHANNELS_FIXTURE=1` **and** no configured upstream. A hard `NODE_ENV === "production"` gate contradicts the story's `next start` fixture verification (`next start` is production), so the guard is "fixture never wins over a configured upstream" вЂ” with `OFFICIAL_CHANNELS_API_URL` set the live path always runs. Residual risk recorded below.
- Normalization drops rows without non-empty string `id`/`title`/`link`, and also non-http(s) `link` (defensive against `javascript:`), keeps upstream order, `logo` в†’ `null` when absent/not http(s).
- Timeout `AbortSignal.timeout(5000)`; non-200, timeout, malformed JSON and malformed shape all collapse to `{ items: [], mode: "error" }`; nothing about the failure leaves the module (no URL, no stack).
- `MarketingMarkdownPage` gained an optional `children` slot between the md shell copy and the CTA (8 existing call sites pass none).
- en shell copy rewritten without the false "No channel directory is listed on this page" claim; added `title`/`description` frontmatter so the story-3.3 metadata keeps a real description (the derived one would have degraded to the bare title). List labels live in the new `OfficialChannels` namespace; `loading` is defined but not yet rendered (4.3 streaming).
- The list renders for `en` only; other five locales keep the static shell, so their missing `OfficialChannels` namespace is never requested.

**Files touched:**
- `src/lib/official-channels.ts` (new)
- `src/app/api/official-channels/route.ts` (new)
- `src/components/OfficialChannelsList.tsx` (new)
- `src/components/MarketingMarkdownPage.tsx`
- `src/app/[locale]/official-channels/page.tsx`
- `messages/en.json`
- `content/en/official-channels.md`
- this plan

**Surprises / risks:**
- Build output still prints `в—Џ (SSG)` for `/[locale]/official-channels` because of the layout `generateStaticParams`, but the page is absent from `prerender-manifest.json` routes/dynamicRoutes вЂ” it is genuinely dynamic.
- Warm data cache: after an upstream outage, Next's stale-while-revalidate keeps serving the last good list while revalidation fails, so `mode: "error"` appears only on a cold cache (or after the entry is evicted). Cold-cache degraded verification passes.
- Delegation depth in this session allowed no subagents (max depth 1), so the full-route handoff and the quick review lens were executed in-session against the staged diff instead of by child agents.

## Plan Change Log

## Review Triage Log

### 2026-11-10 вЂ” Review pass
- verdicts: 5 findings вЂ” high 0, medium 0, low 4, false 1, maybe-false 0
- findings:
  - `[low]` `[patch]` meta description on `/en/official-channels` derived to the bare title ("Official league channels"), weakening the story-3.3 SEO surface after the shell rewrite вЂ” fixed by adding `title`/`description` frontmatter to `content/en/official-channels.md`; verified the head shows the frontmatter description and the body does not leak YAML
  - `[low]` `[patch]` `count` label read "1 official channels" for a single item вЂ” fixed with an ICU plural in `messages/en.json` (`one {# official channel} other {# official channels}`); verified "3 official channels" in the fixture render
  - `[low]` `[reject]` `OfficialChannels.loading` message is defined but never rendered вЂ” the story requires the key in the namespace for the 4.3 streaming work, so deleting it would break that contract; one unused string costs nothing at runtime
  - `[low]` `[defer]` with a warm data cache and the upstream down, stale-while-revalidate keeps serving the last good list instead of flipping to `mode: "error"` вЂ” real Next data-cache behavior, seen when the degraded scenario reused a cached stub response; degraded state appears on a cold cache (verified), so this is recorded as a documented residual rather than patched
  - `[false]` page-level ISR (`export const revalidate = 300`) was replaced by `force-dynamic`, which reads like a freshness regression вЂ” disproved: freshness lives in the fetch data cache and was verified end-to-end (stub payload change visible after the revalidate window, no content edit or deploy), while page ISR would have made the story's own three-start verification impossible on one build


## Design Notes

- **Mode precedence:** fixture flag в†’ `unconfigured` (no URL, no network) в†’ `live` / `error`. `mode` is the only degraded signal; HTTP is always 200 so the page and BFF never 5xx on upstream trouble.
- **Fixture vs production:** a hard `NODE_ENV === "production"` gate would make the sanctioned `next build` + `next start` fixture verification impossible (`next start` is production), so the guard is: fixture needs the exact flag `"1"` and never wins over a configured upstream вЂ” with `OFFICIAL_CHANNELS_API_URL` set, the live path always runs, so fixture can never shadow real channel data in a production deploy.
- **Rendering:** the page is `dynamic = "force-dynamic"` rather than page-level ISR. Freshness comes from the Next data cache: the upstream fetch is cached `OFFICIAL_CHANNELS_REVALIDATE` seconds (default 300) under tag `official-channels`, so a product-side change appears without a content commit or deploy. Page ISR would bake `mode` into the build artifact and make the fixture/unconfigured/error switch on one build unobservable.
- **No Suspense/loading boundary:** the loader resolves before render and returns a state instead of pending; `loading` stays in messages for story 4.3 streaming work.
- **Placeholder logo:** first grapheme of `title` (`Array.from`), `aria-hidden` circle; `img` only for http(s) `logo`, with `alt` from `logoAlt`.

## Verification

**Commands:**
- `pnpm exec tsc --noEmit` вЂ” expected: no errors
- `pnpm exec next build` вЂ” expected: success
- `$env:OFFICIAL_CHANNELS_FIXTURE='1'; pnpm exec next start -p 4310` then `Invoke-WebRequest http://127.0.0.1:4310/en/official-channels` and `/api/official-channels` вЂ” expected: 200, fixture titles + `https://t.me/...`, `mode: "fixture"`
- restart without env on `-p 4311` вЂ” expected: BFF `{ items: [], mode: "unconfigured" }`, page 200 with empty state
- restart with `OFFICIAL_CHANNELS_API_URL='http://127.0.0.1:4399/api/public/channels'` on `-p 4312` вЂ” expected: page 200 with error state, BFF `{ items: [], mode: "error" }`
- scan `.next/static` for `/api/channels` вЂ” expected: no match

## Auto Run Result

- Summary: Tracer slice for epic 4 вЂ” a shared server contract/adapter (src/lib/official-channels.ts), a public nodejs BFF (GET /api/official-channels) that re-serves `{ data: { items }, mode }`, and the live official-channels list rendered server-side on `/en/official-channels` over the existing md shell, with en labels from the new `OfficialChannels` namespace and empty/error states that keep the page at HTTP 200.
- Files changed:
  - `src/lib/official-channels.ts` вЂ” contract types, env parsing, payload normalizer, fixture data, upstream fetch (revalidate + `official-channels` tag, 5 s abort), degradation to `mode: "error"`
  - `src/app/api/official-channels/route.ts` вЂ” nodejs `force-dynamic` GET returning `{ data: { items }, mode }`, always 200, anonymous
  - `src/components/OfficialChannelsList.tsx` вЂ” server-rendered list: heading, ICU count, `<ul>/<li>`, external `t.me` anchors with `target=_blank`/`rel=noopener noreferrer`, initials placeholder for null `logo`, empty and error states (bot CTA)
  - `src/components/MarketingMarkdownPage.tsx` вЂ” optional `children` slot between shell copy and CTA
  - `src/app/[locale]/official-channels/page.tsx` вЂ” `dynamic = "force-dynamic"`, en-only list, metadata unchanged
  - `messages/en.json` вЂ” `OfficialChannels` namespace (listHeading, count, emptyTitle/Body, errorTitle/Body, logoAlt, openChannel, loading)
  - `content/en/official-channels.md` вЂ” claim-safe shell rewrite plus title/description frontmatter; no channel list, no false "no directory" claim
  - this plan
- Review: 5 findings вЂ” 2 patched (low), 1 rejected (low), 1 deferred (low), 1 false; 0 high/medium. Follow-up review recommended: false (patched verdicts were low only).
- Verification:
  - `pnpm exec tsc --noEmit` вЂ” no errors
  - `pnpm exec next build` вЂ” success (lint + types step ran, no warnings)
  - fixture (`OFFICIAL_CHANNELS_FIXTURE=1`, `:4310`) вЂ” BFF 200 `mode: "fixture"` with fixture-1..3 in order; page 200, `data-mode="fixture"`, fixture titles + `https://t.me/...` anchors, no old placeholder claim
  - unconfigured (no env, `:4311`) вЂ” BFF `{ items: [], mode: "unconfigured" }`; page 200 `data-mode="unconfigured"` with empty state
  - degraded (closed port, `:4312`, cold cache) вЂ” BFF `{ items: [], mode: "error" }`; page 200 `data-mode="error"` with error copy + bot CTA, no stack trace, no upstream URL in HTML
  - live (stub upstream, `:4313`) вЂ” 4 valid items in upstream order, invalid rows dropped, `logo` null preserved, `mode: "live"`; payload bump visible after the revalidate window with no content edit
  - adapter matrix via `pnpm dlx tsx` вЂ” unconfigured, non-200, malformed JSON, malformed shape, 5 s timeout (5012 ms), revalidate parsing, fixture gate, normalizer edge cases: all pass
  - client chunks вЂ” 27 files under `.next/static`: 0 containing `/api/channels`, 0 containing `/api/official-channels`, 0 containing `OFFICIAL_CHANNELS_API_URL`
  - untouched surfaces вЂ” `robots.txt` 200, `/sitemaps/en.xml` 200 and still lists `/en/official-channels`, canonical + six hreflang + x-default intact, other five locales keep the static shell
- Residual risks:
  - warm data cache keeps serving the last good list during an upstream outage (deferred item above); a cold cache or evicted entry shows the error state
  - fixture mode is gated by the exact `OFFICIAL_CHANNELS_FIXTURE=1` flag and never wins over a configured upstream; a production deploy that sets the flag with no upstream URL would still serve fixture data (operator error, documented)
  - only `en` renders the list; the other five locales, their labels and RTL are story 4.3, and the real upstream endpoint plus the Live Score patch are story 4.2
  - the page renders per request (`force-dynamic`) for every locale, so `/{locale}/official-channels` is no longer statically prerendered; content is identical, only rendering cost changes
