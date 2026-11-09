---
title: 'Privacy and Terms placeholder pages'
type: feature
ticket: 6
created: '2026-11-09'
status: done
baseline_revision: '9d47bc88b52d53b36918ed7e0b14eb37d3ee6928'
route: oneshot
route_source: pinned
risk: low
review: quick
review_source: pinned
lenses_ran:
  - quick
review_loop_iteration: 0
followup_review_recommended: false
context:
  - C:/DIY/livescore-landing/_bmad-output/initiative-livescore-landing/sources/SERVICE-CAPABILITIES.md
warnings: []
deferred: []
---

<intent-contract>

## Intent

**Problem:** `/{locale}/privacy` and `/{locale}/terms` 404; locked sitemap legal URLs have no placeholder pages with explicit TODO and the minimal Live Score / LiveScoreAppBot operator template.

**Approach:** Add privacy and terms routes mirroring the FAQ/pricing loader/CTA pattern (`MARKETING_PAGES.privacy` / `terms` already mapped), ship six-locale `privacy.md` and `terms.md` placeholders with explicit TODO plus operator Live Score and contact via Telegram bot LiveScoreAppBot — no invented legal entity or law.

</intent-contract>

## Implementation Notes

Oneshot: reuse existing `MARKETING_PAGES.privacy`/`terms` + FAQ page shell; two new routes + twelve content files only — placeholders, not counsel copy; no SEO kit, CMS, nav epic, channels API, or invented entity/law.

- Added `src/app/[locale]/privacy/page.tsx` and `src/app/[locale]/terms/page.tsx` mirroring FAQ: locale guard, `getPageMarkdown(..., MARKETING_PAGES.privacy|terms)`, CTA via `siteDetails.botUrl`.
- Wrote placeholder `content/{ar,en,es,fr,pt-BR,ru}/privacy.md` and `terms.md` with explicit `TODO`, operator Live Score, contact via Telegram bot LiveScoreAppBot; no invented entity/law; no forbidden claims.
- `MARKETING_PAGES` / `MARKETING_SITEMAP` already listed privacy/terms — unchanged.


## Plan Change Log

## Review Triage Log

### 2026-11-09 — Review pass
- verdicts: 2 findings — high 0, medium 0, low 0, false 2, maybe-false 0
- findings:
  - `[false]` `[reject]` privacy/terms page.tsx allegedly empty in review diff — workspace files contain full FAQ-shell (locale guard, `getPageMarkdown` + `MARKETING_PAGES.privacy|terms`, CTA `siteDetails.botUrl`); empty sections were a PowerShell untracked-diff staging artifact for `[locale]` paths
  - `[false]` `[reject]` ar/ru markdown allegedly mojibake in review diff — disk UTF-8 files read clean with TODO / Live Score / LiveScoreAppBot; CP1252 `????` was Out-File encoding of the temp diff only

## Verification

**Commands:**
- `pnpm exec next build` -- expected: success
- After `pnpm exec next start` (or `next dev`), for each of `/ar` `/en` `/es` `/fr` `/pt` `/ru` × `/privacy` and `/terms`: HTTP 200; body includes an explicit `TODO`; body states operator **Live Score**; body states contact via Telegram bot **LiveScoreAppBot** (and CTA href `https://t.me/LiveScoreAppBot`); body omits invented legal entity/law claims and forbidden catalog non-goals (predictions / Discord / player-follow / live highlights-cron / personal Premium)

**Manual checks (if no CLI):**
- Spot-read all twelve `privacy.md` / `terms.md` for TODO + Live Score + LiveScoreAppBot only
- Confirm no fabricated company registration, governing law, or counsel language beyond the locked minimal template

## Auto Run Result

- Summary: Dedicated `/{locale}/privacy` and `/{locale}/terms` routes + twelve placeholder locale bodies with explicit TODO, operator Live Score, contact via Telegram bot LiveScoreAppBot; CTA LiveScoreAppBot; no invented entity/law / forbidden claims.
- Files changed:
  - `src/app/[locale]/privacy/page.tsx` — locale privacy page mirroring FAQ loader/CTA
  - `src/app/[locale]/terms/page.tsx` — locale terms page mirroring FAQ loader/CTA
  - `content/{ar,en,es,fr,pt-BR,ru}/privacy.md` — privacy placeholders
  - `content/{ar,en,es,fr,pt-BR,ru}/terms.md` — terms placeholders
  - this plan — oneshot plan + review/finalize
- Review: 2 findings both false/reject (diff staging artifacts); 0 patched; 0 deferred; 2 rejected
- Follow-up review recommendation: `false` — no patches this pass
- Patched counts: high 0, medium 0, low 0
- Verification: `pnpm exec next build` success; HTTP 200 + TODO + Live Score + LiveScoreAppBot + bot CTA + forbidden-claim omit scan pass for `/ar|/en|/es|/fr|/pt|/ru` × `/privacy|/terms`
- Residual risks: nav/footer Privacy/Terms links still epic sibling work; full counsel legal copy deferred by locked decision
- Commit: `8a798849c3d2e5d0690590a02b4fec0cb32243c8`
