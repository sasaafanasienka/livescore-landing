# Live Score — Service Capabilities

Agent-facing inventory of what this Telegram Live Score product ships today.
Grounded in repository code only. Not marketing copy.

- **Last reviewed:** 2026-11-09
- **Maintained:** generated fact region via `pnpm run codegen:service-capabilities`; drift gate via `pnpm run check:service-capabilities` and `deploy/service-capabilities-catalog.test.ts` (prose outside markers is human-owned)

## Overview

Live Score is a Telegram product: a bot that delivers football match notifications plus a Mini App for browsing matches, managing favourites, and configuring prefs.

Surfaces in scope:

| Surface | Role |
|---------|------|
| Personal bot DM | `/start` onboarding, notifications to the user, Mini App entry |
| Groups | Registered chat profiles; notifications into the group |
| Channels | Registered chat profiles; notifications into the channel |
| Mini App (Telegram WebApp) | Matches, favourites, settings, start/team pick, official league channels list; Premium for chat actors |
| Bot (slash + payments) | Commands, chat registration, Stars checkout handlers, owner-only highlight review callbacks |
| Official league channels | App-owner discoverable Telegram publics (`GET /api/channels`) + optional per-league banners; not user-registered notification profiles |

Public bot username constant: `LiveScoreAppBot` (no `@`).

Admin panel internals are out of scope for this catalog.

<!-- BEGIN GENERATED: service-capabilities-facts -->
> Auto-generated from repository sources. Regenerate: `pnpm run codegen:service-capabilities`

### Bot slash commands (grammy)

| Command |
|---------|
| `/cancel` |
| `/channel` |
| `/group` |
| `/start` |
| `/stop` |

### Premium (group/channel chat profiles)

| Fact | Value |
|------|-------|
| Product id | `chat_prem` |
| Currency | `XTR` (Telegram Stars) |
| Price | **49** Stars |
| Subscription period | **2592000** s (**30** days) |
| Grace after lapse | **86400** s (**24** h) |
| Public bot username | `LiveScoreAppBot` (no `@`) |
| Free chat team\|league favourites | **1** combined; additional team/league → `PREMIUM_REQUIRED` (enforced in code) |

### Notification pref defaults (`DEFAULT_NOTIFICATION_PREFS`)

| Key | Default |
|-----|---------|
| `final` | on |
| `goal` | on |
| `goal_scorer` | off |
| `half_time` | off |
| `highlight` | on |
| `kickoff` | off |
| `pre_match_15` | off |
| `red_card` | off |
| `second_half` | off |

### Mini App personal route paths (`createAppPageRoutes` absolute)

| Path |
|------|
| `/channels` |
| `/favourites` |
| `/leagues/:id` |
| `/match/:id` |
| `/matches` |
| `/matches/:leagueId` |
| `/matches/all` |
| `/premium` |
| `/settings` |
| `/start` |
| `/start/:countrySlug` |
| `/start/leagues/:leagueId` |
| `/start/search` |
| `/teams/:apiFootballId` |

Also: `/` (home); actor mirrors under `/group/:groupId/*` and `/channel/:channelId/*`.

### Match detail tabs (`matchInfoTabs` order)

1. `overview`
2. `highlights`
3. `statistics`
4. `lineups`
5. `h2h`
6. `table`

### Soft-disabled / not-configured (do not overclaim)

| Signal | State |
|--------|-------|
| Highlights worker `crons` | `[]` (no live cron schedule) |
| Settings `highlight` toggle | soft-disabled (SettingSwitch commented out) |
| Stars checkout without `TELEGRAM_STARS_PAYLOAD_SECRET` | HTTP **503** (`Premium checkout is not configured` in actor routes) — confirmed in code |
<!-- END GENERATED: service-capabilities-facts -->

## Audiences

### Personal

- Profile kind: `user`.
- Entry: private `/start` (demo goal + final messages, then Mini App CTA web_app → `/start?src=bot_start`).
- Favourites: fixtures and teams. Personal league favourites are rejected (API error — not Premium upsell).
- No chat Premium / Stars plan on personal profiles (`/premium` redirects to `/settings`).
- Notification buttons: Telegram `web_app` opening the Mini App match page when `MINI_APP_URL` + fixture id are usable (`open_match`, or `watch_now` for highlight). If URL/fixture unusable, message still sends **without** a match button.
- `/stop` (and `reactivate:unsubscribe`) stops personal delivery until the user reactivates.

### Groups

- Register from a **private** chat via `/group` → Telegram `requestChat` (non-channel) with required bot/user admin rights → `chat_shared` → profile. Non-private invocation gets an error (no share keyboard). Failed type/rights/access/conflict replies exist; success is not guaranteed on every share.
- Post-register Mini App deep links: `/group/{profileId}/{start|favourites|settings|premium}` (channels use `/channel/{profileId}/…`).
- Free quota: **1 combined** team **or** league favourite. Additional team/league favourites require Premium (`PREMIUM_REQUIRED` / HTTP 402). Fixture favourites are not gated by that quota.
- League favourites are allowed for chat profiles.
- Premium UI and checkout: Mini App `/group/:groupId/premium` — **owner-only** API (non-owner → forbidden).
- Chat Settings: Premium link + unsubscribe (`subscriptionIntent` stopped). Drain skips profiles with `deliveryAvailability` unavailable (e.g. bot lost rights).

### Channels

- Same flow as groups via `/channel` (channel `requestChat` + post rights).
- Same free team|league quota, favourites rules, owner-only Premium at `/channel/:channelId/premium`.
- Delivery availability tracks bot membership/rights (`my_chat_member`).

## Mini App

### Routes (personal absolute; mirrored under `/group/:groupId/*` and `/channel/:channelId/*`)

| Path | Purpose |
|------|---------|
| `/` | Home |
| `/matches` | Matches list (calendar) |
| `/matches/all` | Matches hub |
| `/matches/:leagueId` | League-filtered matches |
| `/match/:id` | Match detail |
| `/teams/:apiFootballId` | Team page (**API-Football / provider id**) |
| `/leagues/:id` | League page (**internal id**) |
| `/favourites` | Favourites |
| `/settings` | Notification prefs, locales, delay, channels link, team select; Premium link + unsubscribe for chat actors |
| `/channels` | Official app-owner league channels list (`GET /api/channels`); not a registered notification channel profile |
| `/premium` | Chat Premium only (personal → redirect `/settings`) |
| `/start` | Team/league pick flow |
| `/start/search` | Search |
| `/start/:countrySlug` | Country browse |
| `/start/leagues/:leagueId` | League teams in start flow |

Actor index `/group/:id` and `/channel/:id` redirect to actor matches. Unknown paths → `/matches` (search preserved).

Deep link: Telegram `start_param` / `?startapp=match_<fixtureId>` navigates to personal `/match/<id>` (overview tab).

### Official league channels

Shipped product surface: official Telegram channels owned by the configured app owner (`TELEGRAM_APP_OWNER_USER_ID`). Distinct from Audiences → Channels (user-registered notification profiles via `/channel`) and from admin `/api/admin/.../channels` internals.

| Fact | Detail |
|------|--------|
| List endpoint | Exact `GET /api/channels` (Telegram Mini App auth). Actor-scoped Mini App paths (`/group|channel/:id/channels`) still call this **global** list. Separate from mounted actor routes under `/api/channels/:channelId/*` |
| List response | `{ data: { items: [{ id, title, logo, link }] } }` — `logo` from `channels.photoUrl` (nullable); `link` = `https://t.me/<username>` after trim/`@` strip |
| Eligibility | `owner_user_id` = `TELEGRAM_APP_OWNER_USER_ID` **and** non-empty public `username`. Missing env → empty `items` (still 200). League favourite **not** required for list inclusion |
| Ordering | Max favourited-league priority desc (null/missing last), then title asc, then id asc |
| Per-league banners | When a league (API-Football id) is favourited on an eligible owner channel, feeds/detail can expose `ownerChannel: { name, logo, link }` (no `id`). Multiple matches → lowest `channels.id` wins. UI may omit banners under local gates |
| Mini App | `/channels` (also linked from Settings) |

### Match detail tabs

Ordered tabs (`?tab=`):

1. `overview` (default; also fallback for invalid/hidden tab)
2. `highlights` — visible only when match has a highlight payload
3. `statistics` — hidden before kickoff/start
4. `lineups`
5. `h2h`
6. `table`

## Bot Commands

Sole grammy slash commands:

| Command | Where | Behavior |
|---------|-------|----------|
| `/start` | Private | Demo notifications + Mini App CTA; non-private: start message + Mini App keyboard |
| `/stop` | Any chat (acts on the invoking **user**, not a chat profile) | Personal unsubscribe / stop path; reactivate later via `/start` or Mini App |
| `/group` | Private only | Prompt + keyboard to share a group for registration |
| `/channel` | Private only | Prompt + keyboard to share a channel for registration |
| `/cancel` | Any chat | Clears reply keyboard / cancels share flow |

Also handled (not slash commands):

- `message:chat_shared` — complete group/channel registration
- `my_chat_member` — block/unblock analytics; chat delivery availability
- Stars: `pre_checkout_query`, `successful_payment`, `refunded_payment`, `subscription`
- Callback `reactivate:unsubscribe` — same stop path as `/stop`
- Callback `hlc:[yn]:…` — **app-owner only** (`appOwnerUserId` configured); others get empty ack, no review change
- Catch-all `callback_query:data` — answer only

## Notifications

### Payload / delivery types

Shipped render/priority types:

| Type | User pref key | Default pref | Enqueue / send notes |
|------|---------------|--------------|----------------------|
| `goal` | `goal` | on | Pref `goal` |
| `goal_scorer` | `goal_scorer` | off | Separate payload when scorer name is known; pref `goal_scorer` |
| `final` | `final` | on | Prefer FT-card **photo** when deps available, else text. Group/channel: appends “Powered by @LiveScoreAppBot” mention footer |
| `highlight` | `highlight` | on | Pref exists; Settings toggle soft-hidden. Stored `highlight: false` (e.g. via API) is still respected |
| `kickoff` | `kickoff` | off | |
| `half_time` | `half_time` | off | |
| `second_half` | `second_half` | off | |
| `pre_match_15` | `pre_match_15` | off | |
| `red_card` | `red_card` | off | |
| `missed_penalty` | — (no own key) | — | Enqueued only if recipient `goal` pref is on |
| `score_correction` | — (no own key) | — | Enqueued if `goal` **or** `goal_scorer` on; send-time prior gate: deliver only if prior goal/goal_scorer for previous score line already `sent`, else defer/cancel |

Claim priority (higher first): `goal` and `score_correction` = 100; all other listed types = 0.

### Settings toggles (Mini App)

Visible switches: goal, goal scorer, final, kickoff, half-time, second half, pre-match 15, red card, plus global notification delay on/off (UI maps to **0 or 1** minute; shared constants allow 0–15 if set elsewhere).

`highlight` switch is commented out in Settings UI (soft-disabled UX). Stored pref default remains `true`.

### Delivery differences by audience

| Audience | Match button on notifications |
|----------|-------------------------------|
| Personal (`user`) | `web_app` to Mini App `/match/{id}` when URL/fixture usable; label `watch_now` for `highlight`, else `open_match`. Otherwise deliver without button |
| Group / channel | **Highlight only:** plain URL `t.me/<bot>?startapp=match_<fixtureId>` (`watch_now`) when bot username resolves; resolve failure → deliver **without** button. Other types: no match markup (final still gets powered-by footer as above) |

## Premium & Quotas

Applies to **group and channel** profiles only. Product id: `chat_prem` (v1). Invoice title default: `Live Score Premium`.

| Fact | Value |
|------|-------|
| Currency | Telegram Stars (`XTR`) |
| Price | **49** Stars |
| Period | **2_592_000** seconds (**30** days) |
| Grace after lapse | **24** hours (`PREMIUM_GRACE_DURATION_SECONDS`) |
| Free chat team\|league favourites | **1** combined (team or league) |
| Fixture favourites | Unlimited (not in that quota) |
| Entitled states | `active`, `renewal_cancelled`, `grace` |

Also shipped: cancel-renewal / reenable-renewal (owner API; needs Stars subscription edit wiring). After grace ends without renew: profile returns to free; **keeps the oldest team|league favourite and deletes the rest**; fixture favourites untouched.

Checkout / renewal management requires `TELEGRAM_STARS_PAYLOAD_SECRET` (and invoice/subscription Telegram API wiring). If unset: checkout returns **503** (`Premium checkout is not configured`); bot pre-checkout answers unavailable; `successful_payment` and `subscription` handlers no-op without the secret. `refunded_payment` only requires DB (applies refund path when present). Do not assume payments are always available in every deploy.

## Soft-disabled & Operational Gaps

| Item | State | Do not claim |
|------|-------|--------------|
| Highlights worker cron | `apps/match-highlights/wrangler.toml` → `crons = []` | Live scheduled highlights pipeline / automatic highlight delivery as currently running |
| Highlights worker vars | `HIGHLIGHTS_ENABLED` / AI / human classify vars may still be `true` in wrangler | Cron-driven ticks are running |
| Highlights Settings toggle | `SettingSwitch` for `highlight` commented out | Users can currently toggle highlights in Settings |
| Shorts reject + human classify | Still present in match-highlights worker / bot `hlc:` callbacks | That code runs on a live cron schedule (cron is empty) |
| Stars payload secret | Optional env; missing → 503 / checkout unavailable | Stars checkout always works in production |

Restore path (ops, not claimed current): set highlights `crons` (e.g. `*/10 * * * *`), redeploy worker, uncomment Settings highlight switch; configure `TELEGRAM_STARS_PAYLOAD_SECRET` for checkout.

## Explicitly Not Shipped

Absent from this product (no implied FootyLive parity):

- Match predictions / tipster features
- Discord integration
- Player-follow as a product surface (schema may allow `player` favourite entity type; no shipped player-follow UX/audience claims here)
- Cursor/agent rule auto-reminding maintainers to regen this catalog (deferred — sibling spec)

## Source Anchors

- `packages/bot/src/bot.ts`
- `packages/bot/src/start.ts`
- `packages/bot/src/notification-send.ts`
- `packages/shared/src/constants.ts`
- `packages/core/src/profiles/premium/create-checkout.ts`
- `packages/core/src/favourites/favourites.ts`
- `packages/shared/src/notification-prefs.ts`
- `packages/core/src/send/render-notification.ts`
- `packages/core/src/send/notification-priority.ts`
- `packages/core/src/poll/run-poll-tick.ts`
- `packages/core/src/send/score-correction-prior-gate.ts`
- `packages/core/src/send/append-chat-final-powered-by.ts`
- `apps/server/src/routes/actor-routes.ts`
- `apps/server/src/app.ts` (`GET /api/channels`)
- `packages/core/src/channels/owner-channels.ts` (`listOwnerChannels` / `resolveOwnerChannelsForLeagues`)
- `apps/server/src/matches/enrich-owner-channels.ts`
- `apps/mini-app/src/app/router/app-route-children.tsx`
- `apps/mini-app/src/pages/channels/ui/ChannelsPage.tsx`
- `apps/mini-app/src/shared/api/client.ts` (`getChannels`)
- `apps/mini-app/src/features/league-channel-banner`
- `apps/mini-app/src/pages/settings/ui/SettingsPage.tsx`
- `apps/mini-app/src/pages/premium/ui/PremiumPage.tsx`
- `apps/mini-app/src/widgets/match-info/model/tabs.ts`
- `apps/mini-app/src/shared/lib/start-param-navigation.ts`
- `apps/match-highlights/wrangler.toml`
