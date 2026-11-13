---
title: 'Home notifications first-screen screenshot'
type: feature
ticket: ''
created: '2026-11-13'
status: built
baseline_revision: '4da9aec0d37c902a591a101207747bab9c8ec8bf'
route: full
route_source: auto
risk: low
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - C:\Users\Sasa Afanasienka\.cursor\projects\c-DIY-livescore-landing\assets\photo_2026-11-13_13-40-37-7db12cd3-d329-41eb-ae8e-cfd62a4c26ad.jpg
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Home Notifications band still shows a placeholder `home-notifications.webp`; operator supplied a real Telegram «Футбол. LIVE» chat screenshot (goals, score correction, FT summary card, Open match) as the first product screen.

**Approach:** Convert the vertical source JPEG to WebP at the existing path, align `next/image` intrinsic size + `sizes` for proper srcset, and rewrite six-locale `imageAlt` to describe the visible bot chat.

## Boundaries & Constraints

**Always:**
- Target band is `#notifications` via `HomeLanding` → `HomeFeatureBand` (`imageSrc="/images/home-notifications.webp"`).
- Source bytes: `photo_2026-11-13_13-40-37-7db12cd3-d329-41eb-ae8e-cfd62a4c26ad.jpg` (**460×1024** portrait JPEG).
- Convert to WebP and overwrite `public/images/home-notifications.webp` (keep filename + contract path).
- Set `HomeFeatureBand` Image `width`/`height` to the real aspect (**460×1024** or equivalent display pair with same ratio); add explicit `sizes` so Next emits a useful srcset (mirror `Hero.tsx`: e.g. `(max-width: 768px) 100vw, 24rem` / max-w-sm).
- Rewrite `notifications.imageAlt` in all six `content/home/{en,ru,es,fr,pt-BR,ar}.json` to describe what is on screen: Football. LIVE bot chat with goal score alerts, a score-correction notice, a full-time Albania–Finland summary card, and Open match buttons — claim-safe, no new product promises.
- Do not delete unrelated images or touch `home-miniapp.webp` asset bytes (Mini App band may keep old 384×762 props unless shared component forces a prop; prefer optional props so Mini App stays unchanged).

**Never:**
- Redesign Hero / Mini App / How-it-works / Pricing / channels.
- Invent a second screenshot series beyond this Notifications asset.
- Change brand, SEO, or i18n shell in this plan.
- Stretch/crop the screenshot to the old 1530×3036 placeholder aspect.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Happy | Home `/{locale}` loads | Notifications band shows the new WebP; rendered `<img>` has `srcset` + matching `sizes`; alt describes the bot chat contents | No error expected |
| Contract | `pnpm check:home-landing` | Still finds `home-notifications.webp` in `HomeLanding.tsx` | Fail if path renamed |
| Aspect | 460×1024 source → WebP | Image box uses 460:1024 ratio; no letterbox stretch into old 384×762 | Reject if ratio wrong |
| Mini App | Unrelated band | Still uses `home-miniapp.webp` with prior dimensions/behavior | No regressions |

**Decisions (human):**
- Portrait source confirmed 460×1024 — agent converts to WebP (no re-export ask).
- Encode: overwrite `home-notifications.webp`; optimize via `next/image` `sizes` → srcset (not a new filename).
- Alts: rewrite all six locales to describe the visible screen.

</frozen-after-approval>

## Code Map

- `src/components/home/HomeLanding.tsx` — hardcodes `imageSrc="/images/home-notifications.webp"` for `#notifications`.
- `src/components/home/HomeFeatureBand.tsx` — shared Image; today fixed `width={384}` `height={762}` `quality={90}`, no `sizes`. Needs per-band dimensions + `sizes` (prop-ize so Mini App unchanged).
- `src/components/Hero.tsx` — reference for `sizes="(max-width: 768px) 100vw, 384px"`.
- `public/images/home-notifications.webp` — replace bytes with converted WebP from source JPEG.
- `content/home/{en,ru,es,fr,pt-BR,ar}.json` — rewrite `notifications.imageAlt` only.
- `scripts/contracts/home-landing.contract.ts` — path string stay; no change unless props break string match.
- Source: Cursor assets `…/photo_2026-11-13_13-40-37-7db12cd3-d329-41eb-ae8e-cfd62a4c26ad.jpg` (460×1024).

## Tasks & Acceptance

**Execution:**
- [x] Convert source JPEG → WebP; overwrite `public/images/home-notifications.webp` (preserve portrait 460×1024).
- [x] `src/components/home/HomeFeatureBand.tsx` — add optional `imageWidth`/`imageHeight`/`sizes` (defaults keep Mini App 384×762); pass Notifications `460`/`1024` + responsive `sizes`.
- [x] `src/components/home/HomeLanding.tsx` — pass Notifications dimensions + `sizes` into the notifications `HomeFeatureBand`.
- [x] `content/home/{en,ru,es,fr,pt-BR,ar}.json` — rewrite `notifications.imageAlt` to describe the bot chat screen (goals, correction, FT card, Open match).
- [x] Run `pnpm check:home-landing`; spot-check rendered img `srcset`/`sizes` on one locale home.

**Acceptance Criteria:**
- Given any locale home, when Notifications renders, then the screenshot is the supplied Football. LIVE bot chat (not the old placeholder).
- Given the Notifications `<img>`, when viewed in DevTools, then it has a non-trivial `srcset` driven by `sizes` appropriate to `max-w-sm`.
- Given each locale JSON, when `notifications.imageAlt` is read, then it describes goals / score correction / full-time summary / Open match (localized).
- Given `pnpm check:home-landing`, when run, then it passes; Mini App band still shows `home-miniapp.webp`.

## Implementation Notes

- 2026-11-13: JPEG→WebP via `npx sharp-cli` (quality 90); overwrote `public/images/home-notifications.webp` (header parse: 460×1024 VP8, ~51KB).
- `HomeFeatureBand`: optional `imageWidth`/`imageHeight`/`sizes` (defaults 384×762; `sizes` omitted unless passed — Mini App unchanged); Notifications passes 460×1024 + `sizes`.
- Review fix: pt-BR/es FT wording (`placar final` / `resultado final`); `sizes` no longer defaulted.
- Six-locale `notifications.imageAlt` rewritten (goals / score correction / FT Albania–Finland / Open match).
- Verified: `pnpm check:home-landing` → 9/9 passed. Live DevTools srcset spot-check not run (no local browser session); `sizes` prop is wired on the Image.

## Plan Change Log

## Review Triage Log

- 2026-11-13 quick: verdicts high=0 medium=2 low=1 false=0 maybe-false=0
  - medium | patch | `content/home/pt-BR.json` «tempo integral» mis-localizes FT — verified against same-file «placar final»; fixed to placar final
  - medium | patch | `content/home/es.json` «a tiempo completo» calque — verified against same-file «resultado final»; fixed
  - low | patch | `HomeFeatureBand` default `sizes` changed Mini App next/image behavior — verified Mini App had no sizes pre-change; default removed, only Notifications passes sizes

## Verification

**Commands:**
- `pnpm check:home-landing` -- expected: pass

**Manual checks (if no CLI):**
- `/{en}` + one non-EN → `#notifications` shows new chat; alt ok; DevTools `srcset` present; Mini App unchanged.
