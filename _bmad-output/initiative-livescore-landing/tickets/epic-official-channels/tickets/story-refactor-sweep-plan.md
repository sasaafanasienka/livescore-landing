---
title: 'Refactor sweep'
type: refactor
ticket: '4'
created: '2026-11-10'
status: done
baseline_revision: '0969dac7df6e63b88d00d6a7bdccc2b0ba431c59'
route: oneshot
route_source: auto
risk: low
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
followup_review_recommended: false
context: []
warnings: []
deferred: []
---

<intent-contract>

## Intent

**Problem:** epic-official-channels ships as working code, but its three plans and two review passes left a closed set of nits: a module that exports helpers nobody imports, a duplicated pair of state panels in the list component, a synthetic `index` line in the recorded upstream patch, and two low-severity review findings that were deferred instead of recorded anywhere durable (`deferred-work.md` still says "(none open)").

**Approach:** cleanup only, over the closed list below вЂ” no behavior change, no contract change (`{ data: { items }, mode }`), no new dependency, no copy change. Each candidate is either implemented here, rejected with a reason recorded in this plan, or moved to `_bmad-output/initiative-livescore-landing/deferred-work.md` with an owner and a done-criterion.

## Boundaries & Constraints

**Always:** `GET /api/official-channels` keeps returning `{ data: { items }, mode }` at HTTP 200; the page stays `force-dynamic` with the `Suspense` list and `data-mode`; all six locales keep rendering; the contract test (`pnpm check:official-channels`) and `next build` / `lint` stay green; the patch stays applicable (`git apply --check` exit 0) and `C:/DIY/live-score` stays untouched and clean.

**Never:** new behavior or new UI states; new npm dependencies; deleting files; edits to robots/sitemap/sitemaps/`src/lib/seo-*`/`public/llms*`/JSON-LD/hreflang/`MARKETING_SITEMAP`; edits to `messages/*.json` copy or the other marketing pages; writes or commits inside `C:/DIY/live-score`; touching `.tmp/`; committing `.tmp/`, `.agents/`, `_bmad/`, `skills-lock.json`; force-push or `--no-verify`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Fixture, six locales | `OFFICIAL_CHANNELS_FIXTURE=1`, no upstream URL | all six `/{locale}/official-channels` `200`, `data-mode="fixture"`, fixture titles + `https://t.me/...` | none |
| Unconfigured | no channels env | all six `200`, `data-mode="unconfigured"`, localized empty copy | none |
| Degraded | `OFFICIAL_CHANNELS_API_URL` at a closed port | all six `200`, `data-mode="error"`, error copy + bot CTA, no stack trace, no upstream URL | loader catches |
| BFF parity | same server as above | `GET /api/official-channels` = `{ data: { items }, mode }` with the page's mode | always `200` |
| Patch dry run | clean `C:/DIY/live-score` | `git apply --check <abs patch>` exit 0, `status --short` empty | n/a |

</intent-contract>

## Sweep items (closed list)

| # | Item | Disposition | Where |
|---|------|-------------|-------|
| S1 | `OFFICIAL_CHANNELS_TAG`, `officialChannelsRevalidateSeconds`, `officialChannelsFixtureEnabled` were exported but only used inside their own module (verified by repo-wide grep); the three duplicated `{ items: [], mode: "error" }` literals plus the `unconfigured` one | **done** вЂ” drop `export` on the three internals, keep `normalizeOfficialChannels` exported (contract test imports it), one private `emptyResult(mode)` helper | `src/lib/official-channels.ts` |
| S2 | `OfficialChannelsList` repeats the same panel markup/classes/`role`/`aria-live` for the error and empty states | **done** вЂ” one local `ChannelStatePanel` (same DOM, classes, roles; CTA optional) used by both branches | `src/components/OfficialChannelsList.tsx` |
| S3 | Recorded patch carries a synthetic `index` line (fake blob hashes, from the temp patchgen repo) | **done** вЂ” remove the `index` line, re-verify `git apply --check` exit 0 + clean `live-score` status | `docs/upstream/live-score-public-channels.patch` |
| S4 | 4.3 deferred: Arabic `count` prints Latin digits (`latn`) | **moved** вЂ” global numbering policy belongs to `src/i18n/request.ts`, not to a list label; recorded in `deferred-work.md` (owner, reason, done-criterion) | `_bmad-output/initiative-livescore-landing/deferred-work.md` |
| S5 | 4.3 rejected: an empty/error state that arrives via the streamed swap is a fresh `role="status"` region, so not every AT announces it | **moved** вЂ” the fix is a client-side live announcer (new functionality), recorded in `deferred-work.md` | same |
| S6 | 4.1 deferred: warm Next data cache serves the last good list while revalidation fails (SWR) | **rejected (accepted behavior)** вЂ” inherent to `fetch(..., { next: { revalidate } })`; cold cache is the verified path. Recorded as a decision below, code unchanged | plan |
| S7 | Shared stub/assert helper in `scripts/contracts/*` | **rejected** вЂ” a single test file exists; a helper module would add indirection without removing duplication | n/a |
| S8 | `lint` pnpm script next to `check:official-channels` | **rejected** вЂ” `lint` already exists and passes (`next lint`) | `package.json` |
| S9 | Duplicated `revalidate` logic | **rejected** вЂ” one `officialChannelsRevalidateSeconds()` call site, no duplicated code (only prose comments repeat the rationale) | n/a |
| S10 | `data-mode` / `mode` magic strings; `data-mode` and `aria-*` consistency | **rejected** вЂ” one render site and one type; the loading fallback deliberately has no `data-mode` (recorded in 4.3), so there is nothing to unify | n/a |
| S11 | Shared class constant across `OfficialChannelsList` rows and the `OfficialChannelsLoading` skeleton rows | **rejected** вЂ” the skeleton copies row geometry on purpose (decorative, `aria-hidden`); coupling it to list markup would make a placeholder drift-sensitive | n/a |

## Design Notes

- **Route: oneshot** вЂ” roughly 75 changed lines across four files (module surface + helper, one component dedupe, one artifact line, one registry file), mechanical and localized, so no implementation handoff is needed.
- **Decision (accepted behavior, from 4.1):** with a warm data cache, an upstream outage keeps serving the last good channel list until the revalidate window passes and the entry is replaced. This is Next's stale-while-revalidate semantics, not a defect in this module; `mode: "error"` is observable on a cold/evicted cache, which is the verified path. Downgrading to `cache: "no-store"` would trade away R5 freshness and is out of scope for a cleanup story.
- **Why de-export instead of delete:** the three helpers are real (they keep env parsing and the fixture gate in one place); only their visibility was wider than any consumer.
- **Why the `index` line goes:** `git apply` ignores it except for `--3way`, so dropping it removes two invented blob hashes without changing apply/rollback; plain `git apply` stays the documented path.

## Verification

**Commands:**
- `pnpm exec tsc --noEmit` вЂ” expected: exit 0
- `pnpm exec next build` вЂ” expected: success
- `pnpm check:official-channels` вЂ” expected: 8/8 OK, exit 0
- `pnpm run lint` вЂ” expected: no errors
- `$env:OFFICIAL_CHANNELS_FIXTURE='1'; pnpm exec next start -p 4330` then GET all six `/{locale}/official-channels` + `/api/official-channels` вЂ” expected: 200, `data-mode="fixture"`, fixture titles + `https://t.me/...`, same mode from the BFF
- restart with no channels env on `-p 4331` вЂ” expected: all six 200, `data-mode="unconfigured"`, empty copy; BFF `{ items: [], mode: "unconfigured" }`
- restart with `OFFICIAL_CHANNELS_API_URL='http://127.0.0.1:4399/api/public/channels'` (closed port, cold cache) on `-p 4332` вЂ” expected: all six 200, `data-mode="error"`, no stack trace, no upstream URL; BFF `{ items: [], mode: "error" }`
- GET `/sitemap.xml`, `/sitemaps/{locale}.xml` вЂ” expected: 200, each lists its `/{locale}/official-channels`; scan `.next/static` вЂ” expected: no `/api/channels`
- `git -C C:/DIY/live-score apply --check C:/DIY/livescore-landing/docs/upstream/live-score-public-channels.patch` вЂ” expected: exit 0; `git -C C:/DIY/live-score status --short` empty
- `git diff --stat -- src/lib/seo* src/app/sitemap* src/app/sitemaps* src/app/robots.ts public/llms* messages/*.json content/*` вЂ” expected: empty
- stop every `next start` process вЂ” expected: no listener on 4330/4331/4332

## Implementation Notes

### 2026-11-10 — cleanup sweep (route: oneshot)

**Decisions:**
- S1 landed as de-export + `emptyResult()`: `OFFICIAL_CHANNELS_TAG`, `officialChannelsRevalidateSeconds` and `officialChannelsFixtureEnabled` stay in the module (they own env parsing and the fixture gate) but are no longer public; `normalizeOfficialChannels` keeps its `export` because the contract test imports it. The four degraded `{ items: [], mode }` literals now come from one helper, so the "never throw, always 200" shape cannot drift between branches.
- S2 landed as one local `ChannelStatePanel`: identical `<div role="status" aria-live="polite">`, `h3` and paragraph classes for both branches; the paragraph keeps `mb-4` only when a CTA follows (the empty state never had it), so the rendered spacing is unchanged.
- S3 landed by deleting the `index` line from the recorded patch; `git -C C:/DIY/live-score apply --check <abs>` still exits 0 and `live-score` stays clean. The README documents plain `git apply`/`-R`, so nothing else needed rewording.
- S4/S5 landed as two registry entries in `deferred-work.md` (origin, evidence, why deferred, owner, done-when); the warm-cache residual (S6) went in below them as "accepted behaviour, not open work" so nobody re-opens it as a bug.
- S7–S11 rejected with reasons recorded in the closed list above; no code touched for them.

**Files touched:**
- `src/lib/official-channels.ts` — de-exported three internals, added `emptyResult()`, replaced four literals
- `src/components/OfficialChannelsList.tsx` — `ChannelStatePanel` + shared panel class constants; error/empty branches now one component call each
- `docs/upstream/live-score-public-channels.patch` — removed the synthetic `index` line
- `_bmad-output/initiative-livescore-landing/deferred-work.md` — two open items + one accepted-behaviour note
- this plan

**Surprises / risks:**
- This shell is Windows PowerShell 5.1: a `Get-Content -Raw` → `Set-Content -Encoding utf8` round-trip added a BOM and mangled non-ASCII (`—`) in `src/lib/official-channels.ts`. Reverted the file and re-applied every edit through the UTF-8-safe editor; the final diff carries only the intended lines. `Invoke-WebRequest` is also unusable here (non-interactive prompt), so runtime checks used `curl.exe`.
- Verification ran on a cold fetch cache (the directory did not exist after the rebuild), so `mode: "error"` was observable immediately; the warm-cache residual is unchanged and now documented.
- The error and empty panels render twice in the HTML (once in the DOM, once in the RSC flight payload) — pre-existing Next streaming behaviour, not a regression from this sweep.

## Plan Change Log

## Review Triage Log

### 2026-11-10 — Review pass
- verdicts: 5 findings — high 0, medium 0, low 2, false 3, maybe-false 0
- findings:
  - `[low]` `[reject]` `ChannelStatePanel` derives the body's bottom margin from `children` (the empty state has no CTA, so no `mb-4`), which a third degraded state would inherit without asking for it — real but cosmetic: both current call sites render exactly the classes they had before (the empty state never carried `mb-4`), and the alternative is a per-call margin prop, i.e. more surface for a two-call component; rejected as not worth the complexity.
  - `[low]` `[reject]` `deferred-work.md` puts an "Accepted behaviour (not open work)" bullet in a registry meant for open items, so a reader scanning it may treat the warm-cache note as a queue entry — cosmetic and intentional: the heading says it is not open work, and the note exists precisely so nobody re-files it as a bug; rejected as documentation polish with no user or developer impact.
  - `[false]` de-exporting `OFFICIAL_CHANNELS_TAG` would strand code that wants to revalidate the list (`revalidateTag("official-channels")`) — refuted: repo-wide grep finds no `revalidateTag` call and no on-demand revalidation route (the upstream README documents "restart the deployment"), and the tag string is still built in the one module that uses it.
  - `[false]` dropping the patch's `index` line degrades `git apply --3way` — refuted by running it: `git -C C:/DIY/live-score apply --3way --check <abs patch>` exits 0 with "repository lacks the necessary blob… falling back to direct application", and plain `git apply --check` also exits 0; the old synthetic hashes could not have supported a real 3-way merge either.
  - `[false]` the sweep was verified on ports 4330/4331/4332 while the story's `Verify` line names `:4313` — refuted as a defect: a port number is not behaviour; `GET /api/official-channels` ran on every one of the three servers and returned `{ data: { items }, mode }` matching that server's page mode, which is what the check exists to prove.

## Auto Run Result

- Summary: Cleanup-only sweep over the closed list S1–S11: the channels adapter stopped exporting three internals and now builds every degraded result through one `emptyResult()` helper; `OfficialChannelsList` renders its error and empty states through one `ChannelStatePanel` instead of two copied blocks; the recorded upstream patch lost its synthetic `index` line; and the two low-severity findings from story 4.3 (Arabic digits, streamed live-region announcement) plus the accepted warm-cache behaviour are now durable entries in `deferred-work.md`. Nothing changed in behaviour, BFF contract, copy, SEO surfaces or dependencies.
- Files changed:
  - `src/lib/official-channels.ts` — `OFFICIAL_CHANNELS_TAG`, `officialChannelsRevalidateSeconds`, `officialChannelsFixtureEnabled` no longer exported; new `emptyResult(mode)` used by the unconfigured result and all three error paths
  - `src/components/OfficialChannelsList.tsx` — `ChannelStatePanel` + `PANEL_CLASSES`/`PANEL_BODY_CLASSES`; error and empty branches collapse to one call each, same DOM, roles and spacing
  - `docs/upstream/live-score-public-channels.patch` — `index` line removed (no invented blob hashes)
  - `_bmad-output/initiative-livescore-landing/deferred-work.md` — two open follow-ups (Arabic-Indic digits, streamed live-region announcement) with owner and done-when, plus the accepted stale-while-revalidate note
  - this plan
- Review: 5 findings — 0 patched, 0 deferred, 2 rejected (low, reasons above), 3 false; 0 high/medium. Follow-up review recommended: `false`.
- Verification:
  - `pnpm exec tsc --noEmit` — exit 0
  - `pnpm exec next build` — exit 0; `/[locale]/official-channels` keeps its `● (SSG)` label but stays `force-dynamic` at runtime, `/api/official-channels` stays `ƒ`
  - `pnpm check:official-channels` — 8/8 cases OK, exit 0
  - `pnpm run lint` — "No ESLint warnings or errors", exit 0
  - fixture (`OFFICIAL_CHANNELS_FIXTURE=1`, `-p 4330`) — all six `/{locale}/official-channels` 200, `data-mode="fixture"`, three fixture titles + 3 `https://t.me/...` anchors, `/ar` `lang="ar" dir="rtl"`; BFF `{ items: [fixture-1..3], mode: "fixture" }` in order
  - unconfigured (no channels env, `-p 4331`) — all six 200, `data-mode="unconfigured"`, own-language empty title, one `role="status"` region; BFF `{ items: [], mode: "unconfigured" }`
  - degraded (closed port `127.0.0.1:4399`, cold cache, `-p 4332`) — all six 200 in 49–227 ms, `data-mode="error"`, own-language error title + bot CTA, no `ECONNREFUSED`, no upstream URL, no stack trace; BFF `{ items: [], mode: "error" }`
  - `/sitemap.xml` 200 and `/sitemaps/{ar,en,es,fr,pt,ru}.xml` 200, each listing its `/{locale}/official-channels`; `robots.txt` 200; `.next/static` (36 files) contains no `/api/channels`
  - `git -C C:/DIY/live-score apply --check <abs patch>` — exit 0; `git -C C:/DIY/live-score status --short` empty before and after (nothing applied)
  - protected surfaces — `git diff --stat` over `src/lib/seo*`, `src/app/sitemap*`, `src/app/sitemaps*`, `src/app/robots.ts`, `public/llms*`, `messages/`, `content/`, `src/app/[locale]/layout.tsx` is empty
  - cleanup — no listener left on 4330/4331/4332/4333/4399; `.tmp/` untouched
- Residual risks:
  - delegation depth in this session allowed no subagents, so the Quick lens ran in-session against the staged diff (same precedent as stories 4.1–4.3); a context-free reviewer might still catch something a self-review cannot
  - the warm Next data cache can keep serving the last good list during an outage — accepted, documented in `deferred-work.md`, not a defect of this sweep
  - the patch is still not applied on the product side; the epic's runtime path stays `unconfigured`/`error` until the Live Score owner applies it
  - Arabic numerals and the streamed live-region announcement remain open with owners in `deferred-work.md`
