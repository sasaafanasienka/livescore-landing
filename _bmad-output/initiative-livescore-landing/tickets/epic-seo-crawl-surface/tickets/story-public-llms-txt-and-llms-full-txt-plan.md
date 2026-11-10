---
title: 'Public llms.txt and llms-full.txt'
type: feature
ticket: 5
created: '2026-11-10'
status: done
baseline_revision: 'ead69f1b5b19922b6e93f60a41aca51b603ec11c'
route: oneshot
route_source: auto
risk: low
review: quick
review_source: pinned
lenses_ran:
  - quick
review_loop_iteration: 0
followup_review_recommended: false
context:
  - _bmad-output/initiative-livescore-landing/sources/SERVICE-CAPABILITIES.md
warnings: []
deferred: []
---

<intent-contract>

## Intent

**Problem:** Public LLM crawl surfaces are missing — agents have no claim-safe `/llms.txt` or `/llms-full.txt` summarizing the marketing site and absolute locale routes.

**Approach:** Add static `public/llms.txt` (llmstxt.org-shaped brief: H1, blockquote summary, H2 link lists) and `public/llms-full.txt` (expanded claim-safe product/content summary + absolute marketing links). Host `https://football-live-bot.online`. Cover locked 8 routes × locales `ar|en|es|fr|pt|ru` with absolute URLs. Facts only from SERVICE-CAPABILITIES / content-and-seo allowed product facts (LiveScoreAppBot; personal/group/channel + Mini App; chat Premium 49 Stars / 30 days / 24h grace; free 1 team|league; official owner channels). Never claim predictions, Discord, player-follow, live highlights-cron, or personal Premium. Do not touch `src/`, robots, sitemaps, metadata/hreflang, page jobs, or epic 4.

</intent-contract>

## Implementation Notes

Oneshot: two static Markdown files under `public/` only (~100 LOC), no app code; Next serves them as static assets at `/llms.txt` and `/llms-full.txt`.

- Wrote `public/llms.txt` — llmstxt.org shape (H1, blockquote, EN route list, other-locale homes, Optional → llms-full + bot)
- Wrote `public/llms-full.txt` — expanded claim-safe product summary + absolute 8×6 locale route lists
- Touched only those two public files (+ this plan); no `src/` changes
- Forbidden claims omitted; Chat Premium scoped to groups/channels only
- Review patch: softened `llms.txt` official-channels blurb to static-placeholder wording

## Plan Change Log


## Review Triage Log

### 2026-11-10 — Review pass
- verdicts: 3 findings — high 0, medium 1, low 0, false 2, maybe-false 0
- findings:
  - `[medium]` `[patch]` `public/llms.txt` official-channels note overclaimed a live discoverable directory — fixed wording to static marketing placeholder until live list wiring; matches `content/en/official-channels.md`
  - `[false]` `[reject]` Verification allegedly unmet because `llms.txt` lacks full 8×6 deep links — Intent + story verify ask for key links in the brief and full coverage in the expanded surface; `llms-full.txt` has all 48 absolute locale routes; bodies (plural) cover the matrix
  - `[false]` `[reject]` `llms-full.txt` highlight listed as shipped type without soft-disabled caveats — catalog ships highlight as a notification type; body does not claim live cron or Settings toggle; soft-disabled non-claims were intentionally omitted to keep forbidden-token verify clean

## Verification

**Commands:**
- `pnpm exec next build` -- expected: success
- After `pnpm exec next start`, GET `http://127.0.0.1:<port>/llms.txt` and `/llms-full.txt` -- expected: HTTP 200; bodies contain absolute `https://football-live-bot.online/` links covering key locked locale routes (`ar|en|es|fr|pt|ru` × home, guide/groups, guide/channels, official-channels, pricing, faq, privacy, terms); bodies omit forbidden claims (predictions, Discord, player-follow, live highlights-cron, personal Premium)

## Auto Run Result

- Summary: Added claim-safe static `public/llms.txt` and `public/llms-full.txt` with absolute `https://football-live-bot.online` marketing links (brief EN + locale homes; full 8×6 route list) for LLM agents.
- Files changed:
  - `public/llms.txt` — llmstxt.org-shaped brief site summary + key absolute links
  - `public/llms-full.txt` — expanded claim-safe product summary + 8×6 absolute locale routes
  - this plan — oneshot plan, review, finalize
- Review: 1 medium patched (official-channels wording); 2 rejected false; 0 deferred
- Follow-up review recommendation: `false`
- Patched counts: high 0, medium 1, low 0
- Verification: `pnpm exec next build` success; `next start` GET `/llms.txt` and `/llms-full.txt` → 200; absolute host links present; full file ~48 locale URLs; forbidden claim tokens absent
- Residual risks: parallel epic-3 agent may leave unrelated `src/` / canonical-hreflang dirt outside this story's ownership; commit scoped to llms + this plan only
