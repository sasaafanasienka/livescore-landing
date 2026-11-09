---
title: 'content/{locale}/{page}.md layout contract'
type: feature
ticket: '3'
created: '2026-11-09'
status: done
baseline_revision: '860562262919f0513036501597e393fbfc55ee12'
route: oneshot
route_source: auto
risk: low
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** No `content/{locale}/{page}.md` tree or home body load; URL `/pt` → product `pt-BR` mapping exists only in code comments, not as an in-repo note for epic 2+.

**Approach:** Add `content/{productLocale}/home.md` placeholders (product ids incl. `pt-BR`), document URL↔content map, and load locale home body from that file via a small server-side reader using `toProductLocale`.

</frozen-after-approval>

## Implementation Notes

Oneshot: mechanical content contract + thin fs loader + wire `[locale]/page.tsx`. No gray-matter unless frontmatter appears; placeholder bodies are plain markdown/text. Ownership: `content/**`, `src/lib/**` content util, `src/app/[locale]/page.tsx`, mapping note — not middleware/switcher/SEO.

- Added `content/{ar,en,es,fr,pt-BR,ru}/home.md` placeholders + `content/README.md` URL↔content map (pt → pt-BR).
- Added `src/lib/content.ts` `getPageMarkdown` via `toProductLocale` + `fs.readFile`.
- `[locale]/page.tsx` loads `home.md` body (replaces messages `Shell.placeholder` for body text); CTA unchanged.
- No gray-matter (plain text placeholders). No commit (story forbid).

## Plan Change Log

## Review Triage Log

- 2026-11-09 quick: no findings — verdict n/a

## Verification

**Commands:**
- `Test-Path content/en/home.md; Test-Path content/pt-BR/home.md` -- expected: True / True
- `pnpm exec next build` -- expected: success
- After `pnpm exec next start`, curl `/en` -- expected: 200 and body contains unique string from `content/en/home.md`
- Inspect mapping note -- expected: documents URL `pt` → content `pt-BR`
