# Content layout contract

Marketing home copy lives at:

```text
content/{locale}/home.md
```

Longform landing section copy (JSON) lives under `content/home/{locale}.json` and is loaded by `src/lib/home-copy.ts`.

`{locale}` is the **product / content locale id**, not always the URL slug.

## URL ↔ content locale map

| URL prefix | Product / content folder |
|------------|--------------------------|
| `/ar` | `ar` |
| `/en` | `en` |
| `/es` | `es` |
| `/fr` | `fr` |
| `/pt` | `pt-BR` |
| `/ru` | `ru` |

Helpers: `productLocales` / `toProductLocale` in `src/i18n/routing.ts`.
Page slug constants: `MARKETING_PAGES` / `MARKETING_SITEMAP` in `src/lib/content.ts`.

## Indexable crawl surface (6 homes only)

URL prefixes: `ar` | `en` | `es` | `fr` | `pt` | `ru`. Content folders: `ar` | `en` | `es` | `fr` | `pt-BR` | `ru`.

| URL path | Content file |
|----------|--------------|
| `/{locale}` | `home.md` |

Example: `/en` → `content/en/home.md`; `/pt` → `content/pt-BR/home.md`.

Former marketing sub-routes (`guide/*`, `official-channels`, `pricing`, `faq`, `privacy`, `terms`) are removed from the crawl surface and must 404. Keep `GET /api/official-channels` and the home `OfficialChannelsHome` section.

Downstream epics must keep this map — especially **URL `pt` → content `pt-BR`**.
