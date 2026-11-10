---
title: 'Six-locale list copy and full states'
type: feature
ticket: '3'
created: '2026-11-10'
status: done
baseline_revision: '9f1596027691ef3e41e630386b9e4002fb6611e1'
route: full
route_source: auto
risk: medium
review: quick
review_source: pinned
lenses_ran:
  - quick
review_loop_iteration: 0
followup_review_recommended: false
context: []
warnings: [oversized]
deferred:
  - summary: >-
      The Arabic `count` label prints Latin digits ("3 قنوات رسمية") instead of Arabic-Indic digits (٣), because the runtime resolves `ar` to the `latn` numbering system.
    evidence: |-
      `new Intl.NumberFormat("ar").resolvedOptions().numberingSystem` returns `latn` in this Node 22 build while `ar-u-nu-arab` formats `٣`, and the rendered `/ar` fixture page shows "3 قنوات رسمية". Changing it means choosing a numbering-system policy for every number on the site (locale config in `src/i18n/request.ts`), which is a shared typography decision outside this story's file map.
    location: >-
      messages/ar.json:24
    severity: low
---

<intent-contract>

## Intent

**Problem:** The live official-channels list renders only on `/en` (`page.tsx` gates it on `locale === "en"`), the other five locales still carry the false placeholder sentence "No channel directory is listed on this page" in their `content/*/official-channels.md`, only `en.json` has the `OfficialChannels` namespace, and the list has no loading boundary, no live-region semantics and no focus styling — so five locales advertise that nothing is published while the product list exists, and none of them can show it.

**Approach:** Drop the `en` gate so all six locales render the same server list; author the `OfficialChannels` namespace in all six `messages/*.json` with correct ICU plurals; rewrite the five non-en `content/{locale}/official-channels.md` files as claim-safe shell copy (dropping the false "no directory" claim, keeping no channel data); wrap the async list in a `Suspense` boundary whose fallback is a labelled skeleton (still server-rendered, no client fetch); and harden the component for RTL (logical properties) and a11y (live regions, `aria-label` on channel links, visible focus).

## Boundaries & Constraints

**Always:** page and list stay server components with `export const dynamic = "force-dynamic"`; the list still comes only from `getOfficialChannels()` (never from md, never a client fetch); `data-mode` stays on the list container for every mode; empty/error/loading/`count` labels come from `messages/{locale}.json` with the *same* key set in all six files; `ar` uses logical CSS (`text-start`, `ms/me`, `ps/pe`) and must not hard-code left/right; no new dependencies; facts only from `SERVICE-CAPABILITIES` "Official league channels" (app-owner public Telegram channels, `logo` nullable, `link` = `https://t.me/<username>`, list may be empty, distinct from user `/channel` profiles); every page response is 200 and leaks no stack trace or upstream URL.

**Never:** touch `src/app/robots.ts`, `src/app/sitemap.xml/**`, `src/app/sitemaps/**`, `src/lib/seo-*.ts`, `public/llms*`, JSON-LD/hreflang, `MARKETING_SITEMAP` membership (all six locales keep `/{locale}/official-channels` sitemapped); change `generateMetadata` or the BFF contract `{ data: { items }, mode }`; edit `src/lib/official-channels.ts`, `src/app/api/official-channels/route.ts` or `scripts/contracts/*`; put channel data in `content/*.md`; claim predictions/Discord/player-follow/highlights-cron/personal Premium; add CMS or Mini App `/channels` work; delete files; commit `.tmp/`, `.agents/`, `_bmad/`, `skills-lock.json`; force-push or `--no-verify`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Fixture, all locales | `OFFICIAL_CHANNELS_FIXTURE=1`, no upstream URL | `/{ar,en,es,fr,pt,ru}/official-channels` → 200, `data-mode="fixture"`, three fixture titles + `https://t.me/...` anchors, list heading in the page's own language | none |
| Unconfigured | no channels env | all six → 200, `data-mode="unconfigured"`, empty-state title+body in that language, no network | none |
| Degraded | `OFFICIAL_CHANNELS_API_URL` at a closed port | all six → 200, `data-mode="error"`, error title+body in that language + bot CTA, no stack trace, no upstream URL, answered ≤6 s | loader catches; page stays 200 |
| Loading | upstream hangs (cold cache) | initial HTML carries the `Suspense` fallback: `role="status"`, `aria-live="polite"`, that locale's `loading` label | streamed, never a client fetch |
| RTL | `GET /ar/official-channels` | `<html dir="rtl" lang="ar">`, list section uses `text-start` (no `text-left`/`ml-*`/`pl-*` in the component), Arabic labels | n/a |
| Logo missing | fixture rows (`logo: null`) | initials placeholder is `aria-hidden`; no `<img>` for that row; channel link has `aria-label` containing the title | n/a |
| Keys drift | any locale missing/empty `OfficialChannels` key | assert script fails non-zero | n/a |

</intent-contract>

## Code Map

- `src/app/[locale]/official-channels/page.tsx` — remove the `params.locale === "en"` gate (lines 42–44). Keep `dynamic = "force-dynamic"` and `generateMetadata` byte-for-byte. Resolve `const listLocale = isUrlLocale(params.locale) ? params.locale : null` (helper already imported) and render `{listLocale ? <Suspense fallback={<OfficialChannelsLoading locale={listLocale} />}><OfficialChannelsList locale={listLocale} /></Suspense> : null}` inside `MarketingMarkdownPage`. `MarketingMarkdownPage` already `notFound()`s a non-locale, so the null branch is unreachable in practice.
- `src/components/OfficialChannelsLoading.tsx` — NEW server component: `role="status"` + `aria-live="polite"` container, `sr-only` text `t("loading")`, plus `aria-hidden` `animate-pulse` skeleton blocks styled like list rows (`rounded-2xl bg-hero-background`, `max-w-2xl`, `text-start`). No `data-mode` (mode is only known once the list resolves), no client hooks.
- `src/components/OfficialChannelsList.tsx` — rewrite markup/comments: `text-left` → `text-start`; `role="status" aria-live="polite"` on the error and empty containers; keep `data-mode`, the `aria-labelledby` heading pair, `<ul>/<li>`, upstream order, `img` only for http(s) `logo` with `alt={t("logoAlt", {title})}`; replace the `sr-only` " — {openChannel}" span with `aria-label={t("openChannel", { title: item.title })}` on the anchor; add `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary` to the channel anchor and the error-state CTA; `rounded` so the focus ring follows the link box.
- `messages/en.json` — `OfficialChannels` already complete except `openChannel`, which becomes the parameterized link label `{title} — open the official channel in Telegram` (the old value was the unparameterized sr-only suffix). Do not touch `Brand`/`Shell`.
- `messages/{ar,es,fr,pt,ru}.json` — add the identical key set (`listHeading`, `count`, `emptyTitle`, `emptyBody`, `errorTitle`, `errorBody`, `logoAlt`, `openChannel`, `loading`) with real translations, preserving each file's existing `Brand`/`Shell` trees verbatim. Plurals: es/fr/pt `one`/`other`; ru `one`/`few`/`many`/`other`; ar `zero`/`one`/`two`/`few`/`many`/`other`. French copy uses `’` (U+2019), never an ASCII apostrophe (ICU escape).
- `content/{ar,es,fr,pt-BR,ru}/official-channels.md` — rewrite as shell only: optional `title`/`description` frontmatter (same shape as `content/en/official-channels.md`), brand line, localized "official league channels" heading, intro (owner-run public Telegram channels, list loads from the product, no app login needed to read it), the "official channels ≠ user-registered notification channels via `/channel`" line, and the localized "Start with LiveScoreAppBot on Telegram." line. No channel names, no links, no "no directory is listed" claim. `content/en/official-channels.md` is final — leave as is.
- Read-only references: `src/lib/content.ts` (`MARKETING_SITEMAP`, `toProductLocale` `pt` → `pt-BR`), `src/i18n/routing.ts` (`UrlLocale`), `src/lib/seo-metadata.ts` (`title`/`description` frontmatter preferred, else derived from body), `src/components/MarketingMarkdownPage.tsx` (children slot between shell and CTA), `src/app/[locale]/layout.tsx` (`dir="rtl"` for `ar`), `src/lib/official-channels.ts` (contract — unchanged).
- Do not change: `src/lib/official-channels.ts`, `src/app/api/official-channels/route.ts`, `scripts/contracts/**`, `package.json`, SEO kit, layout, sitemap/robots, other pages, lockfiles.

## Tasks & Acceptance

**Execution:**
- [ ] `src/app/[locale]/official-channels/page.tsx` — drop the en gate, add the `Suspense` boundary with `OfficialChannelsLoading`, keep `force-dynamic` + metadata
- [ ] `src/components/OfficialChannelsLoading.tsx` — new labelled skeleton fallback (live region + localized `loading` text)
- [ ] `src/components/OfficialChannelsList.tsx` — logical properties, live regions on empty/error, `aria-label` on channel links, visible focus, keep `data-mode` and semantics
- [ ] `messages/en.json` — parameterize `openChannel`; keep every existing key
- [ ] `messages/{ar,es,fr,pt,ru}.json` — full translated `OfficialChannels` namespace, existing trees untouched
- [ ] `content/{ar,es,fr,pt-BR,ru}/official-channels.md` — claim-safe shell rewrite, no false "no directory" sentence, no channel data
- [ ] Verify per `## Verification` (tsc, build, contract test, three `next start` runs over all six locales, key assert, sitemap/SEO diff)

**Acceptance Criteria:**
- Given `OFFICIAL_CHANNELS_FIXTURE=1` and one `next start`, when GET each of `/{ar,en,es,fr,pt,ru}/official-channels`, then each returns 200 with `data-mode="fixture"`, all three fixture titles and their `https://t.me/...` anchors, and that locale's own `listHeading` text; `/ar` also serves `<html lang="ar" dir="rtl">` with Arabic labels
- Given no channels env, when GET all six URLs, then each is 200 with `data-mode="unconfigured"` and the empty-state title/body of its own language, and no page contains the English empty text outside `en`
- Given `OFFICIAL_CHANNELS_API_URL` pointed at a closed port, when GET all six URLs on a cold cache, then each is 200 within ~6 s with `data-mode="error"`, that locale's error title/body and the bot CTA, and the HTML contains no stack trace, no `ECONNREFUSED`, and no upstream URL; the streamed HTML also carries the `role="status"` `aria-live="polite"` loading fallback
- Given the built app, when scanning `.next/static`, then no chunk contains `/api/channels`; when GET `/sitemap.xml` and `/sitemaps/{locale}.xml`, then each is 200 and every per-locale map lists `/{locale}/official-channels`
- Given `pnpm dlx tsx` over a key assert, when it compares `messages/{ar,en,es,fr,pt,ru}.json`, then all six expose exactly the `OfficialChannels` keys, none empty, `count` contains a `plural` block, `MARKETING_SITEMAP` still contains `official-channels`, and `git diff --stat` over the SEO kit is empty

## Implementation Notes

### 2026-11-10 — six locales, full states, RTL and a11y

**Decisions:**
- The `en` gate is gone: `page.tsx` resolves `listLocale` with `isUrlLocale` (the helper it already imported for metadata) and renders the list for every URL locale. `dynamic = "force-dynamic"` and `generateMetadata` are untouched.
- Loading is a `Suspense` boundary whose fallback is a server component (`OfficialChannelsLoading`): `role="status"` + `aria-live="polite"`, an `sr-only` localized `loading` label, and an `aria-hidden` skeleton (`motion-safe:animate-pulse`, so `prefers-reduced-motion` wins). No `data-mode` in the fallback — the mode is unknown until the loader resolves. Still no client fetch and no client component.
- `openChannel` became a parameterized accessible name (`{title} — …`) instead of an unparameterized `sr-only` suffix glued on with a hard-coded em dash: one key, grammar-correct in every locale, and the anchor keeps a label that contains its visible text (WCAG 2.5.3).
- Empty/error containers are polite live regions; the channel anchor and the error CTA carry `focus-visible` outline classes; the section uses `text-start` and flex `gap` only — no `ml/mr/pl/pr/text-left` in the component, so `ar` mirrors correctly.
- The five non-en content files were rewritten as shell only and gained `title`/`description` frontmatter (same shape as `en`): with the tabloid placeholder sentence gone, the derived description would have collapsed to the heading line, which is exactly the degradation story 4.1 patched for `en`. `content/en/official-channels.md` was left alone.
- Translations follow D7/D8: app-owner public Telegram channels, list loads from the product, no app login needed, distinct from user `/channel` notification profiles, list may be empty; no predictions/Discord/player-follow/highlights/Premium claims.
- Delegation depth in this session allowed no subagents, so the full-route implementation handoff and the Quick review lens ran in-session against the staged diff — the same precedent story 4.1 and 4.2 recorded.

**Files touched:**
- `src/app/[locale]/official-channels/page.tsx` — gate removed, `Suspense` + loading fallback
- `src/components/OfficialChannelsLoading.tsx` (new) — labelled skeleton fallback
- `src/components/OfficialChannelsList.tsx` — logical properties, live regions, `aria-label`, focus-visible, `shrink-0` logos
- `messages/{ar,en,es,fr,pt,ru}.json` — `OfficialChannels` in all six (en: `openChannel` only)
- `content/{ar,es,fr,pt-BR,ru}/official-channels.md` — claim-safe shell rewrite + frontmatter
- this plan

**Surprises / risks:**
- Next streams the shell and emits the fallback even when the upstream refuses instantly (~100 ms pages carry two `role="status"` regions: the fallback plus the resolved state in a hidden `S#` segment); with a hanging upstream the page completes in 5061 ms with the fallback, error copy and no leak.
- Arabic `count` renders Latin digits in this runtime (`latn`), recorded as a deferred typography decision rather than silently switching the site's numbering system.
- `next build` still prints `● (SSG)` for `/[locale]/official-channels` because of the layout's `generateStaticParams`; the page stays `force-dynamic` at runtime (unchanged from 4.1).
- `messages/*.json` are bundled at build time, so a messages edit needs a rebuild to appear in `next start` — verification ran against the final rebuilt artifact.

## Plan Change Log

## Review Triage Log

### 2026-11-10 — Review pass
- verdicts: 5 findings — high 0, medium 0, low 4, false 1, maybe-false 0
- findings:
  - `[low]` `[patch]` the skeleton fallback was a static stack of grey boxes — the plan's Code Map called for a pulsing placeholder, and a frozen skeleton reads like broken content on a slow upstream — added `motion-safe:animate-pulse` to the `aria-hidden` skeleton wrapper (reduced-motion users keep a static block); confirmed still present in the streamed fallback HTML
  - `[low]` `[patch]` es/fr/pt `count` compiled but omitted the CLDR `many` category, so 1 000 000 items would read "1.000.000 canales oficiales" (missing preposition) — added `many {# de …}` to all three; verified `IntlMessageFormat` for 0/1/2/3/5/11/21/100/1 000 000 in all six locales and re-ran the fixture render
  - `[low]` `[defer]` Arabic `count` interpolates Latin digits because the runtime resolves `ar` to `latn` — real, but the fix is a site-wide numbering-system policy in the shared `src/i18n/request.ts`, not a list-label decision; recorded in frontmatter `deferred`
  - `[low]` `[reject]` after the streamed swap the error/empty state arrives as a whole new `role="status"` region, which some ATs do not announce on insertion — real limitation of streaming SSR, but the fix is a stable client-side live announcer (new client JS), more than a direct correction, and the non-streamed paths (fixture/unconfigured, the common case) render their region with the page; not fixed in this story
  - `[false]` `aria-label` on the channel link was suspected to hide the visible channel title from assistive technology — disproved by the rendered markup: the label starts with the title (`aria-label="Fixture League One — افتح القناة الرسمية على Telegram"`), so the accessible name contains the visible text; the check ran on all six locale pages in fixture mode

## Design Notes

- **Streaming, not client fetch:** `Suspense` above the async list is the only loading mechanism that keeps the server-rendered list. Next streams the shell (md copy + heading) and then the resolved list; `force-dynamic` is untouched, so mode stays a per-request fact. The fallback deliberately has no `data-mode` — inventing one would claim a state the request has not resolved yet.
- **Why `openChannel` grows a parameter:** the old value was a suffix glued with a hard-coded em dash and a `<span class="sr-only">`; that pattern is unreadable in RTL and untranslatable per locale (grammar order, articles). An ICU `{title}` in one existing key gives every locale a correct accessible name without widening the key set.
- **Arabic plurals:** ar needs all six CLDR categories; `zero`/`one`/`two` cannot use `#` sensibly, so they are written out, while `few`/`many`/`other` interpolate `#`.
- **Empty-state wording** stays "the list is not published yet" rather than "no official channels exist": that is exactly the `unconfigured`/empty contract (list may legitimately be empty) and invents no eligibility rule.
- **Metadata:** the five rewritten files carry `title`/`description` frontmatter like `en`, because the derived description would otherwise collapse to the heading line — the same degradation story 4.1 patched for `en` (`seo-metadata.ts` prefers frontmatter, no SEO code touched).

## Verification

**Commands:**
- `pnpm exec next build` — expected: success; `/[locale]/official-channels` still dynamic
- `pnpm exec tsc --noEmit` — expected: no errors
- `pnpm check:official-channels` — expected: 8/8 OK, exit 0
- `$env:OFFICIAL_CHANNELS_FIXTURE='1'; pnpm exec next start -p 4325` then GET all six `/{locale}/official-channels` — expected: 200, `data-mode="fixture"`, fixture titles + `https://t.me/...`, per-locale heading, `/ar` `dir="rtl"`, no English labels in non-en pages
- restart with no channels env on `-p 4326` — expected: all six 200, `data-mode="unconfigured"`, localized empty copy
- restart with `OFFICIAL_CHANNELS_API_URL='http://127.0.0.1:4399/api/public/channels'` (closed port, cold cache) on `-p 4327` — expected: all six 200 within ~6 s, `data-mode="error"`, localized error copy, loading fallback present, no stack trace/URL
- `pnpm dlx tsx <temp assert>` — expected: every `OfficialChannels` key present and non-empty in all six files, `count` has a `plural`, `MARKETING_SITEMAP` contains `official-channels`, no `/api/channels` in `.next/static`
- GET `/sitemap.xml` and `/sitemaps/{ar,en,es,fr,pt,ru}.xml` — expected: 200 and each lists its `/{locale}/official-channels`
- `git diff --stat -- src/lib/seo* src/app/sitemap* src/app/sitemaps* src/app/robots.ts public/llms*` — expected: empty
- stop every server, delete temp files — expected: no `next start` process on 4325/4326/4327, `.tmp/` cleaned

## Auto Run Result

- Summary: The live official channels list now renders in all six URL locales with per-locale labels, a streamed loading state, localized empty and error states, logical CSS for `ar`, live-region semantics and visible focus; the five non-en content files were rewritten as claim-safe shell copy without the false "no channel directory" sentence, and nothing in the SEO kit changed.
- Files changed:
  - `src/app/[locale]/official-channels/page.tsx` — dropped the `locale === "en"` gate, wrapped the list in a `Suspense` boundary with `OfficialChannelsLoading`; `force-dynamic` and `generateMetadata` unchanged
  - `src/components/OfficialChannelsLoading.tsx` (new) — server-rendered skeleton fallback with `role="status"`, `aria-live="polite"`, localized `loading` label, `motion-safe:animate-pulse`, no `data-mode`
  - `src/components/OfficialChannelsList.tsx` — `text-start`, live regions on empty/error, `aria-label` on channel links, `focus-visible` outline on links and CTA, `shrink-0` logos, no physical-direction utilities
  - `messages/{ar,es,fr,pt,ru}.json` — full `OfficialChannels` namespace (9 keys) with ICU plurals (ar all six CLDR categories, ru one/few/many/other, es/fr/pt one/many/other); existing `Brand`/`Shell` trees untouched
  - `messages/en.json` — `openChannel` parameterized to `{title} — open the official channel in Telegram`
  - `content/{ar,es,fr,pt-BR,ru}/official-channels.md` — shell-only rewrite (heading, intro, official-vs-`/channel` line, CTA) plus `title`/`description` frontmatter; no channel data, no false "not listed" claim
  - this plan
- Review: 5 findings — 2 patched (low), 1 deferred (low), 1 rejected (low), 1 false; 0 high/medium. Follow-up review recommended: `false`.
- Verification:
  - `pnpm exec next build` — exit 0 (lint + types step clean)
  - `pnpm exec tsc --noEmit` — exit 0
  - `pnpm check:official-channels` — 8/8 cases OK, exit 0
  - fixture (`OFFICIAL_CHANNELS_FIXTURE=1`, `-p 4325`, final build): ar 83 ms, en 54 ms, es 45 ms, fr 75 ms, pt 62 ms, ru 61 ms — all six 200, `data-mode="fixture"`, three fixture titles + `https://t.me/...` anchors, own-language heading, no English heading outside `en`; `/ar` `<html lang="ar" dir="rtl">`, Arabic labels, plural `3 قنوات رسمية`, zero `text-left` / physical margin-padding utilities on the page
  - unconfigured (no channels env, `-p 4326`): all six 200, `data-mode="unconfigured"`, own-language empty title+body, `role="status"`
  - degraded (closed port, cold fetch cache, `-p 4327`): all six 200 in 26–66 ms, `data-mode="error"`, own-language error title+body + bot CTA, streamed loading fallback present (`role="status" aria-live="polite"` skeleton), no `ECONNREFUSED`, no upstream URL, no stack trace; `GET /api/official-channels` still `{ items: [], mode: "error" }`
  - hanging upstream (stub on `:4399`, `-p 4329`, cold cache): `/ar` 200 in **5061 ms**, fallback + Arabic error copy + no leak (covers the matrix loading row and the ≤6 s bound)
  - `pnpm dlx tsx` key assert: 9 `OfficialChannels` keys present and non-empty in all six files, `count` is an ICU plural in each, `Brand`/`Shell` intact, `MARKETING_SITEMAP` still lists `official-channels`, no `/api/channels` in `.next/static`
  - metadata per locale: own-language `<title>` and 133–160-char description from frontmatter, self-canonical, six `hreflang` + `x-default` intact, no YAML leak into the body
  - `GET /sitemap.xml` 200 (6 sitemaps), `GET /sitemaps/{ar,en,es,fr,pt,ru}.xml` 200 with 8 URLs each and `/{locale}/official-channels` present
  - `git diff --stat` over `src/lib/seo*`, `src/app/sitemap*`, `src/app/sitemaps*`, `src/app/robots.ts`, `public/llms*` — empty; `robots.txt` 200
  - cleanup: no listener on 4325/4326/4327/4329/4399, `.tmp/` removed
- Residual risks:
  - the translations were written by the implementing agent: wording and register (especially ar/fr) should be reviewed by a native speaker before the copy is treated as final
  - warm Next data cache can still serve the last good list during an outage (carried from 4.1); the degraded checks ran on a cold cache
  - Arabic numbers render with Latin digits until a numbering-system policy is chosen (frontmatter `deferred`)
  - an empty/error state that arrives through the streamed swap is a freshly inserted `role="status"` region, so not every AT announces it (triaged low/reject above)
  - the fixture switch still has no hard production gate (epic decision D4); it only loses to a configured upstream
  - remaining epic work: story 4.4 (refactor sweep over the >3-file surface)
