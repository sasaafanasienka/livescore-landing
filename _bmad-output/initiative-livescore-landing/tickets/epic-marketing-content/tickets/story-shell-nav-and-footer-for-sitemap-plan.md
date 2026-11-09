---
title: 'Shell nav and footer for sitemap'
type: feature
ticket: 7
created: '2026-11-09'
status: built
baseline_revision: '7726fc1e54de5525c0e1006fa45e4bfeefbb9451'
route: oneshot
route_source: pinned
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

**Problem:** Primary nav and footer do not expose the locked sitemap labels/routes; Finwise `#features` / `#testimonials` / `#pricing` leftovers remain in shell menu data, so sitemap pages are not reachable from the shell (R6).

**Approach:** Wire Header primary nav and Footer legal links to the locked locale-prefixed routes via next-intl `Link`, localize EN-canonical labels in `messages/*`, and replace Finwise hash menu leftovers with the locked targets.

</intent-contract>

## Implementation Notes

Oneshot: Header/Footer already use `@/i18n/navigation` Link + Brand/CTA; only need to surface locked route list + i18n labels and purge Finwise hash items from `menuItems`/`footer` data. Pages 2.1–2.6 already exist.

- Rewrote `src/data/menuItems.ts` to locked primary targets (`/guide/groups`, `/guide/channels`, `/official-channels`, `/pricing`, `/faq`); dropped `#features`/`#pricing`/`#testimonials`.
- Rewrote `src/data/footer.ts` `quickLinks` to Privacy/Terms (`/privacy`, `/terms`); cleared unused Finwise contact/social leftovers from that data blob.
- Wired `Header.tsx` desktop + mobile menus from `menuItems` via next-intl `Link` + `Shell.nav.*` labels; kept Brand home + LocaleSwitcher + bot CTA.
- Wired `Footer.tsx` legal column from `footerDetails.quickLinks` via `Shell.footer.*`.
- Localized nav/footer labels in `messages/{ar,en,es,fr,pt,ru}.json`.

## Plan Change Log

## Review Triage Log

### 2026-11-09 — Review pass
- verdicts: 0 findings — high 0, medium 0, low 0, false 0, maybe-false 0
- findings:
  - (none)

## Verification

**Commands:**
- `pnpm exec next build` -- expected: success
- After `pnpm exec next start`, from `/en`: primary nav/footer anchors reach `/en/guide/groups`, `/en/guide/channels`, `/en/official-channels`, `/en/pricing`, `/en/faq`, `/en/privacy`, `/en/terms` (HTTP 200); shell HTML/menus contain no `#features`, `#testimonials`, or `#pricing` hash items

**Manual checks (if no CLI):**
- Spot-check desktop + mobile Header for five primary links; Footer for Privacy + Terms; Brand home link remains Live Score → `/`

## Auto Run Result

- Summary: Primary Header nav (desktop + mobile) and Footer legal links rewired to locked locale-prefixed sitemap routes; Finwise `#features`/`#testimonials`/`#pricing` hash leftovers removed from shell menu data; labels localized in all six message files.
- Files changed:
  - `src/data/menuItems.ts` — locked primary nav targets
  - `src/data/footer.ts` — Privacy/Terms quickLinks; Finwise hash leftovers removed
  - `src/components/Header.tsx` — render primary nav via next-intl Link + Shell.nav.*
  - `src/components/Footer.tsx` — render Privacy/Terms via Shell.footer.*
  - `messages/{ar,en,es,fr,pt,ru}.json` — localized nav/footer labels
  - this plan — oneshot plan + review/finalize
- Review: quick lens — 0 findings; 0 patched; 0 deferred; 0 rejected
- Follow-up review recommendation: `false` — no patches this pass
- Patched counts: high 0, medium 0, low 0
- Verification: `pnpm exec next build` success; `/en` HTTP 200 with hrefs `/en/guide/groups`, `/en/guide/channels`, `/en/official-channels`, `/en/pricing`, `/en/faq`, `/en/privacy`, `/en/terms` all HTTP 200; no `#features`/`#testimonials`/`#pricing` in shell HTML or shell data files
- Residual risks: none material for R6; SEO/channels API remain out of scope
- Commit: (pending)
