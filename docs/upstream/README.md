# Upstream: Live Score public channels

The marketing site (`C:/DIY/livescore-landing`) renders the product's official
(app-owner) Telegram channels on `/{locale}/official-channels`. Official data
lives in Live Score (`C:/DIY/live-score`), so this folder records the contract
between the two repositories and ships the product-side change as a ready patch.

- **Owner of the endpoint:** Live Score (`apps/server/src/app.ts`).
- **Owner of the contract + patch:** epic-official-channels in this repo.
- **Status:** the patch is **not** applied to Live Score by this repo; the Live
  Score owner applies it (epic decision D10, 2026-11-10).
- **Secrets:** none. The endpoint is public by design — no tokens, no Telegram
  Mini App `initData`, no cookies, no API keys.

## Contract

```
GET {OFFICIAL_CHANNELS_API_URL}
→ 200 { "data": { "items": [ { "id": 7, "title": "…", "logo": "…" | null, "link": "https://t.me/<username>" } ] } }
→ 500 { "error": { "message": "Failed to load channels" } }
```

| Fact | Value |
|------|-------|
| Method / path | `GET /api/public/channels` on the Live Score server |
| Auth | **none** — no `auth` middleware, no Mini App credentials, no user context |
| Response envelope | `{ data: { items: [...] } }` (same shape as the Mini App list) |
| `id` | the product's DB id (`channels.id`) — a **number** upstream; the landing coerces it to a string key |
| `title` | channel title, string |
| `logo` | channel photo URL or `null` (nullable; never assume it exists) |
| `link` | `https://t.me/<username>` (username trimmed, leading `@` stripped) |
| Ordering | upstream order is authoritative: max favourited-league priority desc, then title asc, then id asc. The landing does **not** sort |
| Empty list | still `200` with `items: []` — e.g. `TELEGRAM_APP_OWNER_USER_ID` unset or no eligible owner channel |
| Eligibility | channel `owner_user_id` = `TELEGRAM_APP_OWNER_USER_ID` **and** a non-empty public `username` |
| Cache | the landing caches the upstream read for `OFFICIAL_CHANNELS_REVALIDATE` seconds (default 300) under tag `official-channels`; timeout 5 s |

Data source on the product side: `listOwnerChannels(options.db, options.appOwnerUserId ?? null)`
from `packages/core/src/channels/owner-channels.ts` — a pure DB read with no
caller context, which is why the public route needs no auth.

Landing-side normalization (in `src/lib/official-channels.ts`): a row is dropped
when `id`, `title` or `link` is unusable, when `link` is not `http(s)`, or when
the row is not an object; a `logo` that is missing or not `http(s)` becomes
`null`; a numeric `id` becomes a string key. Ordering is never changed, and an
empty `items` array is a valid `live` response (renders the empty state).

### Why not `GET /api/channels`

`GET /api/channels` is the Mini App surface and is mounted behind the Telegram
`auth` middleware (`app.use("/api/channels/*", auth)` plus `app.get("/api/channels", auth, …)`).
A public marketing page has no `initData` and no user token, so it can never
call that route (epic constraints C4/C5). `/api/public/channels` is a separate,
additive route: it does not change `/api/channels`, its actor routes
(`/api/channels/:channelId/*`), the admin routes or the CORS middleware.

## The patch

`docs/upstream/live-score-public-channels.patch` — a unified diff
(`git diff` format) against `apps/server/src/app.ts` at Live Score
`7bfb6d234860fec6e38eaa6acca640adac241a45` (`master`). It adds 17 lines: one
`app.get("/api/public/channels")` handler placed immediately above the existing
`GET /api/channels` block. Nothing is removed or modified.

```diff
+  app.get("/api/public/channels", async (c) => {
+    try {
+      const items = await listOwnerChannels(options.db, options.appOwnerUserId ?? null);
+      return c.json({ data: { items } });
+    } catch (error) {
+      console.error(JSON.stringify({ msg: "failed to list public owner channels", error: … }));
+      return c.json({ error: { message: "Failed to load channels" } }, 500);
+    }
+  });
```

Check, apply, roll back (run from anywhere; use the absolute patch path — `git -C`
resolves relative paths against the target repository, not this one):

```powershell
# 1. dry run — must print nothing and exit 0
git -C C:/DIY/live-score apply --check C:/DIY/livescore-landing/docs/upstream/live-score-public-channels.patch

# 2. apply (Live Score owner)
git -C C:/DIY/live-score apply C:/DIY/livescore-landing/docs/upstream/live-score-public-channels.patch

# 3. roll back
git -C C:/DIY/live-score apply -R C:/DIY/livescore-landing/docs/upstream/live-score-public-channels.patch
# or simply
git -C C:/DIY/live-score checkout -- apps/server/src/app.ts
```

If the file has drifted and `--check` fails, re-generate the hunk (keep the
handler identical); do not hand-wave the failure.

## Landing configuration

| Env var | Meaning |
|---------|---------|
| `OFFICIAL_CHANNELS_API_URL` | full URL of the public endpoint, e.g. `https://<product-host>/api/public/channels`. Unset → `mode: "unconfigured"`, empty list, no network call |
| `OFFICIAL_CHANNELS_REVALIDATE` | upstream cache seconds (default `300`, capped at `86400`) |
| `OFFICIAL_CHANNELS_FIXTURE` | dev/contract-test switch, exactly `1`; ignored whenever `OFFICIAL_CHANNELS_API_URL` is set |

The browser only ever talks to this site's `GET /api/official-channels`
(`{ data: { items }, mode }`, always `200`). It never calls `/api/channels`.

## Operator runbook

**Enable the real upstream**

1. Live Score owner applies the patch and deploys the server.
2. Verify from the product host: `curl https://<product-host>/api/public/channels`
   returns `{ "data": { "items": [...] } }` with a non-empty list (if it is
   empty, check `TELEGRAM_APP_OWNER_USER_ID` and that the owner channels have
   public usernames).
3. Set `OFFICIAL_CHANNELS_API_URL` in the landing deployment and redeploy (env
   changes need a restart; the route is `force-dynamic`, so no rebuild of
   content is involved).
4. `GET /api/official-channels` must report `mode: "live"` and the same items,
   in the same order, as the upstream.

**Refresh the list without a content commit**

The product updates its own channels. The landing picks the change up after
`OFFICIAL_CHANNELS_REVALIDATE` seconds (default 5 minutes) — no `content/*.md`
edit, no commit, no content deploy. To force it sooner, restart the deployment:
no on-demand revalidation endpoint is exposed today, and a warm data cache can
keep serving the previous list until the window passes. Do **not** author
channels in `content/*.md`: the file list is not the source of truth.

**Check locally against a stub**

```powershell
# contract + degradation test (own stub on 127.0.0.1:4399, exits non-zero on failure)
pnpm check:official-channels

# manual run: point the app at any stub that serves the contract, then
$env:OFFICIAL_CHANNELS_API_URL='http://127.0.0.1:4399/api/public/channels'
pnpm exec next start -p 4315
```

With the stub stopped and the env still set, `/en/official-channels` must answer
`200` with the error state (`data-mode="error"`), no stack trace and no upstream
URL in the HTML, in about 5 seconds (the fetch timeout).

**When the upstream is down or slow**

- The page stays up: BFF `200` with `{ items: [], mode: "error" }` and an error
  state plus bot CTA. No 5xx, no crash, no stack trace, no URL leaked.
- Cause candidates, in order: patch not deployed (404 on the public path), wrong
  `OFFICIAL_CHANNELS_API_URL`, owner id / channel usernames unset (empty list —
  that renders the *empty* state, not the error state), upstream 5xx, or a
  timeout over 5 s.
- A warm Next data cache may keep serving the last good list while
  revalidation fails; clearing the cache entry is the way to observe the error
  state immediately (known residual, recorded in story 4.1).
- Recovery is automatic on the next successful revalidation; nothing to
  re-deploy on the landing side.
