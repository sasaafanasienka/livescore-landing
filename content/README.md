# Content layout contract

Marketing pages live at:

```text
content/{locale}/{page}.md
```

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

## Locked sitemap (URL ↔ content file)

URL prefixes: `ar` | `en` | `es` | `fr` | `pt` | `ru`. Content folders: `ar` | `en` | `es` | `fr` | `pt-BR` | `ru`.

| URL path | Content file |
|----------|--------------|
| `/{locale}` | `home.md` |
| `/{locale}/guide/groups` | `guide-groups.md` |
| `/{locale}/guide/channels` | `guide-channels.md` |
| `/{locale}/official-channels` | `official-channels.md` |
| `/{locale}/pricing` | `pricing.md` |
| `/{locale}/faq` | `faq.md` |
| `/{locale}/privacy` | `privacy.md` |
| `/{locale}/terms` | `terms.md` |

Example: `/en` → `content/en/home.md`; `/pt/pricing` → `content/pt-BR/pricing.md`.

Downstream epics must keep this map — especially **URL `pt` → content `pt-BR`**. Sibling marketing stories own non-home page bodies and routes; this tracer locks the contract and ships claim-safe `home.md` for all six locales.
