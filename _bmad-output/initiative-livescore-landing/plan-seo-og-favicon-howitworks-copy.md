---
title: 'SEO OG favicon howItWorks copy'
type: feature
ticket: ''
created: '2026-11-11'
status: built
baseline_revision: '230fcf5d9b660b650b5d140ef3012005766c687a'
route: full
route_source: auto
risk: low
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - seo-audit.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Home OG cards are stale 1024×576 JPGs with mismatched meta sizes; favicon is not the header/footer mark; `howItWorks.description` still sells “three audiences” instead of groups/channels setup.

**Approach:** Replace per-locale OG bytes from the new Frame PNGs (honest meta size), regenerate `favicon.ico` from `/images/logo.png`, rewrite `howItWorks.description` in all six home JSON locales.

## Boundaries & Constraints

**Always:**
- Keep `localeOgImagePath` contract: `og-{en,es,fr,pt,ru}.jpg`; `ar` → `og-en.jpg`.
- Ship OG at native Frame size **1714×900**; meta `width`/`height` = 1714/900 (no downscale to 1200×630).
- Frame→locale (OCR of headlines): 22→en, 84→ru, 85→es, 86→fr, 87→pt. Convert PNG→JPEG into matching `og-*.jpg` filenames.
- Favicon visual = `public/images/logo.png` (same as Header/Footer `BrandMark`).
- RU description (human): «Уведомления можно настроить не только для себя но и для группы друзей или собственного телеграм канала. Читай инструкции:»
- Non-RU descriptions (agent translations, locked):
  - en: Notifications can be set up not only for yourself but also for a group of friends or your own Telegram channel. Read the instructions:
  - es: Las notificaciones se pueden configurar no solo para ti, sino también para un grupo de amigos o tu propio canal de Telegram. Lee las instrucciones:
  - fr: Les notifications peuvent être configurées non seulement pour toi, mais aussi pour un groupe d'amis ou ta propre chaîne Telegram. Lis les instructions :
  - pt-BR: As notificações podem ser configuradas não só para você, mas também para um grupo de amigos ou o seu próprio canal do Telegram. Leia as instruções:
  - ar: يمكن ضبط الإشعارات ليس لنفسك فقط، بل أيضًا لمجموعة أصدقاء أو لقناتك الخاصة على تيليجرام. اقرأ التعليمات:
- Leave Frame PNGs on disk (do not delete).

**Never:**
- How it works SSR/tab DOM fix, root 404 page, FAQ `plainFaqAnswer`, robots/lastmod/locale-switcher, title trims.
- Invent `og-ar.jpg` or change `ar` fallback.
- Touch tab step copy, pricing, FAQ, hero, or BrandMark component API.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Locale home OG | GET `/{en,es,fr,pt,ru}` | `og:image` → matching `og-{locale}.jpg`; file 1714×900; meta 1714×900 | Build fails only if path missing |
| Arabic OG | GET `/ar` | Still `/images/og-en.jpg` | Unchanged fallback |
| Favicon | Browser tab / `/favicon.ico` | Circular Football. LIVE mark from logo.png | N/A |
| howItWorks blurb | Home JSON per locale | Description is groups/channels copy, not “three audiences” | N/A |

</frozen-after-approval>

## Code Map

- `public/images/Frame 22.png` → `og-en.jpg`; `Frame 84.png` → `og-ru.jpg`; `Frame 85.png` → `og-es.jpg`; `Frame 86.png` → `og-fr.jpg`; `Frame 87.png` → `og-pt.jpg` (sources 1714×900 RGBA)
- `public/images/og-{en,es,fr,pt,ru}.jpg` — replace bytes (keep filenames)
- `public/images/logo.png` — 550×550 source for favicon
- `src/app/favicon.ico` — App Router favicon; overwrite from logo
- `src/lib/seo-metadata.ts` — `marketingPageMetadata` images width/height (~71–73) → 1714/900
- `src/app/[locale]/layout.tsx` — default OG width/height (~37–39) → 1714/900
- `content/home/{en,es,fr,pt-BR,ru,ar}.json` — `howItWorks.description` only

## Tasks & Acceptance

**Execution:**
- [x] Convert Frame PNGs → `public/images/og-{en,es,fr,pt,ru}.jpg` at 1714×900 per locked mapping
- [x] `src/lib/seo-metadata.ts` + `src/app/[locale]/layout.tsx` — OG width/height → 1714/900
- [x] `src/app/favicon.ico` — rebuild multi-size ICO from `public/images/logo.png`
- [x] `content/home/*.json` — replace `howItWorks.description` with locked strings (all six locales)

**Acceptance Criteria:**
- Given production HTML for `/ru`, when reading `og:image`, then URL ends with `og-ru.jpg` and declared width/height are 1714/900 matching the file.
- Given `/ar`, when reading `og:image`, then still `og-en.jpg`.
- Given home JSON for each locale, when reading `howItWorks.description`, then it matches the locked strings and drops “three audiences / Tres audiencias / …” wording.
- Given `src/app/favicon.ico`, when compared visually to `/images/logo.png`, then it is the same circular mark.

## Implementation Notes

- Converted Frames 22/84/85/86/87 → og-en/ru/es/fr/pt.jpg at 1714×900 JPEG q92; Frame PNGs left in place.
- Meta width/height updated to 1714/900 in `seo-metadata.ts` and `[locale]/layout.tsx`.
- Regenerated `src/app/favicon.ico` from `logo.png` (16/32/48).
- Replaced `howItWorks.description` in all six home JSON locales with locked strings.
- Implemented directly (subagent dispatch hit model usage limit).

## Plan Change Log

## Review Triage Log

### 2026-11-11 quick pass
Verdicts: high=0 medium=0 low=0 false=5 maybe-false=0

- false — typografDeep may alter RU locked description — AC judges `content/home/*.json` on disk (matches locked). Runtime typograf is the pre-existing home-copy pipeline; nbsp/comma are expected site-wide, not a defect of this change.
- false — howItWorks description still absent from SSR HTML — frozen Never / deferred goal (tab SSR); out of scope for this plan.
- false — OG JPEG dimensions unverified by inspection — measured all five `og-*.jpg` at 1714×900 matching meta.
- false — favicon visual match unverified — ICO rebuilt from `logo.png` (16/32/48); preview frame shows same circular Football. LIVE mark.
- false — no AGENTS.md/CLAUDE.md — informational; not a defect in the diff.

## Design Notes

Frame→locale locked from OCR crops of left headline text.

## Verification

**Commands:**
- `pnpm exec tsc --noEmit` — expected: clean (or pre-existing only)
- Measure OG files — expected: 1714×900 and meta constants match
- Grep home JSON for old “three audiences” variants — expected: no hits

**Manual checks (if no CLI):**
- Spot-check favicon in browser tab vs header logo
