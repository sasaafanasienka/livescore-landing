# Deferred work

Open follow-ups this repo decided not to do yet, each with the reason and the
condition that makes it worth doing.

## Official channels (epic-official-channels)

### 1. Arabic-Indic digits in the channels `count` label

- **Origin:** story 4.3 review triage — deferred, low.
- **Evidence:** `new Intl.NumberFormat("ar").resolvedOptions().numberingSystem`
  resolves to `latn` in this Node 22 runtime, so `/{locale}/ar/official-channels`
  renders `3 قنوات رسمية` with Latin digits (`ar-u-nu-arab` would render `٣`).
- **Why deferred:** the fix is a site-wide numbering-system policy in
  `src/i18n/request.ts` (every number on the site), not a list-label decision;
  changing it inside one component would leave the page with mixed digits.
- **Owner:** product/design (typography decision) together with the owner of
  `src/i18n/request.ts`.
- **Done when:** a numbering-system policy exists for `ar` (for example
  `ar-u-nu-arab` in the shared i18n/formatting config), the fixture render of
  `/{locale}/official-channels` shows Arabic-Indic digits for `ar` while the other
  five locales keep Latin digits, and no component carries a local workaround.

### 2. Streamed error/empty state is not announced by every assistive technology

- **Origin:** story 4.3 review triage — rejected, low (the fix is new
  functionality, not a correction).
- **Evidence:** the list streams, so an error/empty state arrives as a freshly
  inserted `role="status"` / `aria-live="polite"` region; several AT + browser
  combinations only announce changes inside a live region that already existed
  when the page loaded. The non-streamed paths (fixture/unconfigured) render the
  region together with the page and are unaffected.
- **Why deferred:** a stable announcer means new client-side JavaScript and a new
  runtime behavior; it does not belong in a cleanup pass.
- **Owner:** epic follow-up (accessibility).
- **Done when:** a client announcer mounted before the streamed content (for
  example in the layout shell) reports the resolved mode as text inside a
  pre-existing live region, a screen-reader pass on `/{locale}/official-channels`
  in degraded mode hears the state, and no client request to `/api/channels` is
  introduced.

## Accepted behaviour (not open work)

- **Stale-while-revalidate on a warm data cache** (story 4.1, accepted in story
  4.4): with the upstream down and a warm Next data cache, the page and the BFF
  keep serving the last good channel list until the revalidate window passes and
  the entry is replaced. This is Next's documented data-cache behavior and the
  price of R5 freshness; `mode: "error"` is observable on a cold or evicted
  cache, which is the verified path. Do not "fix" it with `cache: "no-store"`.
