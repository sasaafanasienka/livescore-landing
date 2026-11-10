---
title: 'Refactor sweep'
type: chore
ticket: 6
created: '2026-11-10'
status: done
baseline_revision: 'd7b023d16e4d4727da7a31354a2c7adfb5eaf65e'
route: oneshot
route_source: auto
risk: low
review: quick
review_source: pinned
lenses_ran:
  - quick
review_loop_iteration: 0
followup_review_recommended: false
context: []
warnings: []
deferred: []
---

<intent-contract>

## Intent

**Problem:** Epic 3 deferred inventory is nearly empty (`deferred-work.md` none open; all story `deferred: []`), but story 3.3 explicitly deferred strip-on-read so `MarketingMarkdownPage` would still render YAML if frontmatter is added later while meta already strips/parses it.

**Approach:** Cleanup-only: share one optional-frontmatter strip helper, use it when rendering marketing markdown bodies, and point FAQ JSON-LD strip at the same helper. Leave Arabic title soft-cap residual alone (expected truncate, not a deferred cleanup).

</intent-contract>

## Implementation Notes

Oneshot (~30–50 LOC): inventory at plan start = one deferred nit from story 3.3 plan prose (strip-on-read). No other open deferred entries in epic plans or `deferred-work.md`. No new SEO features / epic 4 / live channels API.

- 2026-11-10: Exported `stripOptionalFrontmatter` from `src/lib/content.ts`; `MarketingMarkdownPage` strips before render; `seo-jsonld` FAQ extract reuses the shared helper (removed private copy). Skipped Arabic title soft-cap residual.

## Plan Change Log

## Review Triage Log

### 2026-11-10 — Review pass
- verdicts: 4 findings — high 0, medium 0, low 0, false 4, maybe-false 0
- findings:
  - `[false]` `[reject]` Missing `stripOptionalFrontmatter` in `src/lib/content.ts` — helper is exported at `content.ts:62`; first review-diff artifact omitted tracked src hunks
  - `[false]` `[reject]` `MarketingMarkdownPage` still renders raw markdown — `MarketingMarkdownPage.tsx:25-26` calls `stripOptionalFrontmatter(raw)` before render
  - `[false]` `[reject]` `seo-jsonld` still has private strip copy — private function removed; imports shared helper from `@/lib/content`
  - `[false]` `[reject]` Implementation Notes claim unbacked by change set — rewritten review-diff includes all three src files plus plan; WT matches notes

## Verification

**Commands:**
- `pnpm lint` -- expected: success
- `pnpm exec next build` -- expected: success

**Manual checks (if no CLI):**
- Story plan lists only the strip-on-read cleanup (no new SEO features)
- `MarketingMarkdownPage` body path strips `---` frontmatter when present (render shows markdown body only)

## Auto Run Result

- Summary: Cleanup-only epic-3 refactor sweep — shared `stripOptionalFrontmatter` for marketing body render + FAQ JSON-LD extract; only deferred nit from story 3.3 strip-on-read prose. No new SEO features.
- Files changed:
  - `src/lib/content.ts` — export shared `stripOptionalFrontmatter`
  - `src/components/MarketingMarkdownPage.tsx` — strip before body render
  - `src/lib/seo-jsonld.ts` — reuse shared helper; drop private copy
  - this plan — oneshot plan + review/finalize
- Review: quick lens — 4 findings; 0 patched; 0 deferred; 4 rejected (`false` — incomplete first review-diff staging)
- Follow-up review recommendation: `false`
- Patched counts: high 0, medium 0, low 0
- Verification: `pnpm lint` success; `pnpm exec next build` success (61 static pages)
- Residual risks: Arabic title soft-cap ~70 mid-phrase truncate left as previously noted; content files today have no YAML frontmatter so strip is defensive
