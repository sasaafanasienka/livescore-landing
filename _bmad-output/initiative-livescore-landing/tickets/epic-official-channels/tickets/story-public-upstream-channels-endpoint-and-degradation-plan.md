---
title: 'Public upstream channels endpoint and degradation'
type: feature
ticket: '2'
created: '2026-11-10'
status: done
baseline_revision: '16aadab25626003706eee46e77f62486cfb7f17f'
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
warnings: [oversized]
deferred: []
---

<intent-contract>

## Intent

**Problem:** The landing reads a public upstream channel list that does not exist yet, and the adapter has never seen a real payload: `listOwnerChannels` returns a numeric `id`, while `normalizeOfficialChannels` requires a string `id` and silently drops every row — so the live path would render "live" with zero channels in production. Nothing in this repo records the upstream contract, ships the product-side endpoint, or proves timeout/500/malformed degradation end to end.

**Approach:** Record the contract and ship a ready unified-diff patch for Live Score (`GET /api/public/channels`, no `auth`, `listOwnerChannels(options.db, options.appOwnerUserId ?? null)`), plus an operator README; make the adapter accept the real numeric `id`; and add an executable stub-backed contract test that pins shape, ordering, nullability, invalid-row dropping and every degraded mode.

## Boundaries & Constraints

**Always:** contract stays `{ data: { items: [{ id, title, logo, link }] } }` with `logo` nullable and `link` = `https://t.me/<username>`; landing `OfficialChannel.id` stays a string (numeric upstream ids are coerced); upstream order preserved; every upstream failure degrades to `{ items: [], mode: "error" }` at HTTP 200; the patch is an artifact of THIS repo and must pass `git apply --check` against `C:/DIY/live-score`; stub on `127.0.0.1:4399`; no new dependencies (`pnpm dlx tsx` only).

**Never:** write, apply, commit or `git add` anything inside `C:/DIY/live-score` (read + `apply --check` only); touch `robots.ts`, `src/app/sitemap.xml/**`, `src/app/sitemaps/**`, `src/lib/seo-*.ts`, `public/llms*`, JSON-LD, hreflang, `MARKETING_SITEMAP`; add/edit other-locale content or `messages/{ar,es,fr,pt,ru}.json` (story 4.3); CMS/SEO/Mini-App UX/other datasets; delete files; change the BFF response contract; put secrets or the upstream URL into HTML; commit `.tmp/`, `.agents/`, `_bmad/`, `skills-lock.json`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Stub live, numeric ids | stub `{ data: { items: [{ id: 7, … }, { id: 3, … }] } }` | `items` with string ids `"7"`,`"3"` in upstream order, `logo` null preserved, `mode: "live"` | none |
| Stub live, string ids + junk rows | two valid string-id rows, one missing `title`, one `javascript:` link, one `link: null` | only valid rows, order kept, junk dropped, still `mode: "live"` | none |
| HTTP 500 | stub returns 500 | `{ items: [], mode: "error" }` | caught, no throw |
| Malformed JSON | stub body `{"data":` | `mode: "error"` | `response.json()` inside try |
| Wrong shape | `{"items": []}` / `{"data": {"items": "x"}}` | `mode: "error"` | normalizer returns null |
| Timeout | stub accepts and never responds | `mode: "error"`, elapsed ≈5 s (<7 s) | `AbortSignal.timeout(5000)` |
| Unconfigured | no `OFFICIAL_CHANNELS_API_URL`, no fixture flag | `{ items: [], mode: "unconfigured" }`, no network call | none |
| Degraded page | `OFFICIAL_CHANNELS_API_URL` at a dead upstream | `/en/official-channels` 200 with `data-mode="error"` copy + bot CTA, no stack trace, no upstream URL in HTML, response <8 s | BFF stays 200 |
| Patch applies | clean `C:/DIY/live-score` at `7bfb6d234860fec6e38eaa6acca640adac241a45` | `git apply --check` exit 0; `status --short` stays empty | n/a |

</intent-contract>

## Code Map

- `src/lib/official-channels.ts` — the only production change. `normalizeOfficialChannels` drops rows whose `id` is not a non-empty string (line 132–138); upstream `OwnerChannelItem.id` is `number` (`C:/DIY/live-score/packages/core/src/channels/owner-channels.ts:5-10`, mini-app type `id: number` at `apps/mini-app/src/shared/api/client.ts:752`). Accept `number` (finite) and coerce with `String(...)`; keep the string path and the existing `title`/`link`/`logo` rules. Nothing else in this module changes.
- `docs/upstream/live-score-public-channels.patch` — NEW. Generated from `git show HEAD:apps/server/src/app.ts` (blob is LF; worktree is CRLF with `core.autocrlf=true`), block inserted after the groups mount and before the `// Discoverable owner channels` comment (`C:/DIY/live-score/apps/server/src/app.ts:757-760`): comment + `app.get("/api/public/channels", async (c) => { try { const items = await listOwnerChannels(options.db, options.appOwnerUserId ?? null); return c.json({ data: { items } }); } catch (error) { console.error(JSON.stringify({ msg: "failed to list public owner channels", error: error instanceof Error ? error.message : String(error) })); return c.json({ error: { message: "Failed to load channels" } }, 500); } })`. Diff produced with `git diff --no-index` on `a/`/`b/` copies under `.tmp/patchgen/` so the paths stay `a/apps/server/src/app.ts` / `b/apps/server/src/app.ts`. No `listOwnerChannels` import is needed (already imported at `app.ts:24`); no other route, mount or actor route is touched (`/api/channels/*` matcher and the global CORS middleware do not cover `/api/public`).
- `docs/upstream/README.md` — NEW. Contract table (path, method, auth, response shape, `id` numeric → landing string, nullable `logo`, `link` form, ordering, empty list when `TELEGRAM_APP_OWNER_USER_ID` is unset), owner/path, apply and rollback (`git apply` / `git apply -R`), why not `/api/channels` (C4/C5), env wiring and operator runbook.
- `scripts/contracts/official-channels.contract.ts` — NEW. `node:http` stub on `127.0.0.1:4399`, one case per matrix row, `node:assert/strict`, `OK`/`FAIL` lines, non-zero exit on failure; imports the adapter by relative path (`../../src/lib/official-channels`) so `tsc` still covers it.
- `package.json` — add `"check:official-channels": "pnpm dlx tsx scripts/contracts/official-channels.contract.ts"` beside the existing scripts.
- Read-only references: `src/app/api/official-channels/route.ts`, `src/components/OfficialChannelsList.tsx`, `src/app/[locale]/official-channels/page.tsx`, `messages/en.json` (`OfficialChannels` namespace already has `errorTitle`/`errorBody`).
- Do not change: `messages/*.json`, `content/**`, SEO kit, sitemap, robots, `public/llms*`, the BFF contract, `next.config.mjs`, lockfiles.

## Tasks & Acceptance

**Execution:**
- [ ] `src/lib/official-channels.ts` — accept numeric `id` and coerce to string in `normalizeOfficialChannels` — the real upstream would otherwise yield `mode: "live"` with zero items
- [ ] `docs/upstream/live-score-public-channels.patch` — generate the unified diff as in the Code Map, then iterate until `git -C C:/DIY/live-score apply --check <abs patch>` exits 0 with `live-score` status still clean
- [ ] `docs/upstream/README.md` — record contract, owner/path, apply/rollback, env + operator runbook, why the public path needs no secrets and why not `/api/channels`
- [ ] `scripts/contracts/official-channels.contract.ts` — stub server + every matrix row, sequential cases sharing one adapter/env switch, always close the server and the hanging socket
- [ ] `package.json` — `check:official-channels` script
- [ ] Verify per `## Verification` (tsc, build, patch check, contract test, live + degraded `next start`, sitemap/seo untouched)

**Acceptance Criteria:**
- Given a clean `C:/DIY/live-score`, when `git -C C:/DIY/live-score apply --check` runs against the recorded patch, then it exits 0, `git -C C:/DIY/live-score status --short` is empty afterwards, and the diff adds `app.get("/api/public/channels")` with no `auth` middleware, no other route edits, and a 500 branch returning `{ error: { message: "Failed to load channels" } }`
- Given `pnpm dlx tsx scripts/contracts/official-channels.contract.ts`, when the stub serves the contract, then every case prints OK, numeric upstream ids arrive as strings in upstream order with `logo` null preserved and junk rows dropped, `mode` is `live`; and when the stub returns 500 / broken JSON / a wrong shape / hangs, the adapter returns `mode: "error"` with an empty list
- Given `OFFICIAL_CHANNELS_API_URL` pointed at the stub and `next start`, when GET `/api/official-channels`, then the response is `{ data: { items }, mode: "live" }` with the stub items in upstream order, and GET `/en/official-channels` is 200 showing the same titles and `https://t.me/...` links
- Given the stub is stopped, when GET `/en/official-channels`, then it is 200 with `data-mode="error"`, the error copy, a bot CTA, no stack trace and no upstream URL in the HTML, answered in under 8 s
- Given the same build, when GET `/sitemap.xml` and `/en/official-channels` after the change, then both are 200 and `git diff --stat` over `src/lib/seo*`, `src/app/sitemap*`, `public/llms*` is empty

## Implementation Notes

### 2026-11-10 — public upstream contract, patch, stub contract test, degradation proof

**Decisions:**
- The real upstream `id` is `OwnerChannelItem.id: number` (`packages/core/src/channels/owner-channels.ts`, and `OwnerChannelItem` in the Mini App client). The story 4.1 normalizer required a string `id`, so every genuine row would have been dropped and the page would have rendered `mode: "live"` with zero channels. Added `readId()`: non-empty string kept, finite number coerced with `String()`, everything else dropped. `OfficialChannel.id` stays a string (React key + BFF payload unchanged).
- The patch is generated, not hand-written: a throwaway git repo under `.tmp/patchgen/` is seeded with `git cat-file blob HEAD:apps/server/src/app.ts` from Live Score (byte-identical, LF), the handler is inserted above the `// Discoverable owner channels` comment, and `git diff` produces `docs/upstream/live-score-public-channels.patch` (one hunk, 17 added lines, `a/apps/server/src/app.ts` paths). Live Score stayed read-only apart from `git apply --check`.
- EOL: the Live Score blob is LF while its worktree is CRLF (`core.autocrlf=true`, no `.gitattributes`). `git apply --check` accepts both the LF patch (committed) and a CRLF-converted copy (tested on purpose), so no `.gitattributes` change was needed in either repo.
- Contract test owns `127.0.0.1:4399`, one stub with five behaviors (`ok`, `server-error`, `broken-json`, `wrong-shape`, `hang`), `node:assert/strict`, per-case `OK`/`FAIL`, non-zero exit; it imports the adapter by relative path so `tsc --noEmit` still covers it. `package.json` gained `check:official-channels`.
- Degradation needed no product change: timeout/catch-all/`force-dynamic`/`en` labels were already right, so `src/components/OfficialChannelsList.tsx`, the page, `messages/*.json` and `content/**` were left untouched (4.3 owns the other locales).
- Operator docs went to `docs/upstream/README.md`; the root `README.md` is the untouched Finwise template, so a section there would have been off-topic.

**Files touched:**
- `src/lib/official-channels.ts` — `readId()` (numeric upstream id → string key) + normalizer docs
- `docs/upstream/live-score-public-channels.patch` (new) — unified diff for Live Score
- `docs/upstream/README.md` (new) — contract, apply/rollback, env, operator runbook
- `scripts/contracts/official-channels.contract.ts` (new) — stub-backed contract + degradation test
- `package.json` — `check:official-channels`
- this plan

**Surprises / risks:**
- Delegation depth in this session allows no subagents, so the full-route handoff and the Quick lens ran in this session against the staged diff (same precedent recorded by story 4.1).
- A dead-but-refusing upstream answers the page in ~0.26 s; a *hanging* upstream costs the full ~5 s abort per cold request (measured 5226 ms page / 5033 ms BFF). Documented in the runbook; acceptable per the ≤6 s story bound.
- Warm Next data cache can still serve the last good list during an outage (carried over from 4.1); cold-cache verification is what the story proves.
- The patch's `index` line carries synthetic blob hashes from the temp repo; plain `git apply`/`--check` ignore them, `--3way` would fall back to a normal apply.

## Plan Change Log

## Review Triage Log

### 2026-11-10 — Review pass
- verdicts: 2 findings — high 0, medium 0, low 2, false 0, maybe-false 0
- findings:
  - `[low]` `[patch]` operator runbook told readers to "revalidate tag `official-channels`" as a way to force a refresh — no on-demand revalidation endpoint is exposed by this app, so the instruction was unactionable — reworded to "restart the deployment; a warm data cache can keep the previous list until the window passes"
  - `[low]` `[patch]` the recorded contract omitted the landing-side normalization (row dropping, `logo` → `null`, numeric `id` → string, empty `items` = valid `live`), which is exactly the detail an integrator needs when the upstream shape drifts — added a normalization paragraph after the contract table

## Design Notes

- **Numeric `id` is the contract, not a bug in the product**: `OwnerChannelItem.id` is the DB `channels.id`. The epic's shape `{ id, title, logo, link }` never promised a string; the landing needs a string only as a React key. Coerce at the boundary, document `id: number` upstream → `id: string` in the BFF/README, and keep the string path for stubs/tests.
- **Patch realism beats a hand-written hunk**: generate the diff from the exact blob in live-score so context lines, line numbers and CRLF/LF identity match what the owner's `git apply` will see; validate with `--check` instead of trusting the generator.
- **Degradation already exists** (5 s abort, catch-all → `error`, page `force-dynamic`, error copy in `en`): the story only has to prove it, so the component, page and messages stay untouched. Warm Next data cache can still serve the last good list during an outage (deferred in story 4.1) — cold-cache verification only.
- **One process-safe stub**: the contract test owns `:4399` and closes it in `finally`; the runtime verification uses a separate throwaway node stub outside the repo so nothing tracked becomes a fixture.

## Verification

**Commands:**
- `pnpm exec tsc --noEmit` — expected: no errors
- `pnpm exec next build` — expected: success
- `git -C C:/DIY/live-score apply --check C:/DIY/livescore-landing/docs/upstream/live-score-public-channels.patch` — expected: exit 0, `git -C C:/DIY/live-score status --short` empty
- `pnpm dlx tsx scripts/contracts/official-channels.contract.ts` — expected: every case OK, exit 0
- `$env:OFFICIAL_CHANNELS_API_URL='http://127.0.0.1:4399/api/public/channels'; pnpm exec next start -p 4315` with a stub job on `:4399` — expected: `GET /api/official-channels` = stub items in upstream order, `mode: "live"`; `GET /en/official-channels` = 200 with the list
- stop the stub, then `GET /en/official-channels` — expected: 200, `data-mode="error"`, error text, no stack trace, elapsed <8 s; then stop the server
- `GET /sitemap.xml`, `GET /en/official-channels`, `git diff --stat -- src/lib/seo* src/app/sitemap* public/llms*` — expected: 200/200 and an empty diff

## Auto Run Result

- Summary: Recorded the Live Score public channels contract and shipped it as a ready unified-diff patch (`GET /api/public/channels`, no `auth`, `listOwnerChannels(options.db, options.appOwnerUserId ?? null)`, 500 → `{ error: { message: "Failed to load channels" } }`), made the landing adapter accept the product's real numeric `id` (previously every genuine row was dropped), added an executable stub-backed contract/degradation test, and documented the contract plus the operator runbook.
- Files changed:
  - `src/lib/official-channels.ts` — `readId()` accepts a finite numeric upstream `id` and coerces it to the string key; normalizer docs updated
  - `docs/upstream/live-score-public-channels.patch` (new) — one-hunk diff against `apps/server/src/app.ts` (17 added lines), generated from the Live Score blob at `7bfb6d234860fec6e38eaa6acca640adac241a45`
  - `docs/upstream/README.md` (new) — contract table, `id`/`logo`/ordering/empty semantics, landing normalization, why not `/api/channels`, apply/rollback, env vars, operator runbook
  - `scripts/contracts/official-channels.contract.ts` (new) — `node:http` stub on `127.0.0.1:4399`, 8 cases, `node:assert/strict`, non-zero exit on failure
  - `package.json` — `check:official-channels`
  - this plan
- Review: 2 findings — 2 patched (low). 0 deferred, 0 rejected. Follow-up review recommended: `false`.
- Verification:
  - `pnpm exec tsc --noEmit` — exit 0 (after switching the stub's `Set` iteration to `Array.from` for the ES5-target check)
  - `pnpm exec next build` — exit 0, `/api/official-channels` still `ƒ`
  - `git -C C:/DIY/live-score apply --check <abs patch>` — exit 0; `git -C C:/DIY/live-score status --short` empty before and after (nothing applied). Note: the literal form `git -C C:/DIY/live-score apply --check docs\upstream\...` resolves the patch path *inside* live-score (`-C` changes directory first) and fails with "can't open patch"; with the absolute patch path from the live-score directory it exits 0
  - `pnpm dlx tsx scripts/contracts/official-channels.contract.ts` (and `pnpm check:official-channels`) — 8/8 OK: unconfigured, numeric ids → strings + order + nullable logo, string ids + junk-row dropping, HTTP 500, broken JSON, wrong shape, 5 s timeout (hang), unconfigured again; exit 0
  - live run (`OFFICIAL_CHANNELS_API_URL=http://127.0.0.1:4399/api/public/channels`, `next start -p 4315`, stub job) — `GET /api/official-channels` = `{"data":{"items":[{id:"7"},{id:"3"},{id:"11"}]},"mode":"live"}` in upstream order, invalid row dropped; `GET /en/official-channels` = 200, `data-mode="live"`, three titles with `https://t.me/...` anchors in the same order
  - degradation (stub killed, cold fetch cache) — page 200 in 263 ms with `data-mode="error"`, error heading + bot CTA, no stack trace, no upstream URL; BFF 200 `{ items: [], mode: "error" }` in 14 ms
  - degradation via a hanging stub (cold cache) — page 200 in **5226 ms**, BFF 200 in **5033 ms**, both `mode: "error"`, no stack trace, no URL leak (5 s abort bound)
  - untouched surfaces — `/sitemap.xml` 200 (index of six per-locale maps), `/sitemaps/en.xml` 200 and still lists `official-channels`, `/en/official-channels` 200, `git diff --stat -- src/lib/seo* src/app/sitemap* src/app/sitemaps* public/llms*` empty
- Residual risks:
  - the product-side endpoint is not deployed by this repo: until the Live Score owner applies the patch, `OFFICIAL_CHANNELS_API_URL` pointed at `/api/public/channels` yields `mode: "error"` (404) or, with no URL at all, `mode: "unconfigured"`
  - warm Next data cache can keep serving the last good list while revalidation fails; only a cold cache shows `mode: "error"` immediately
  - a hanging upstream costs ~5 s per cold request (both page and BFF); the story bound (≤6 s) holds but that latency is visible to a visitor hitting the page cold
  - the patch's synthetic `index` line means `git apply --3way` falls back to a normal apply; plain `git apply` is the documented path
  - only `en` renders the list and its labels; the other five locales, RTL and the full loading state are story 4.3
