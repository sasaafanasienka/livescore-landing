# Content layout contract

Marketing pages live at:

```text
content/{locale}/{page}.md
```

`{locale}` is the **product / content locale id**, not always the URL slug.

## URL ↔ content map

| URL prefix | Product / content folder |
|------------|--------------------------|
| `/ar` | `ar` |
| `/en` | `en` |
| `/es` | `es` |
| `/fr` | `fr` |
| `/pt` | `pt-BR` |
| `/ru` | `ru` |

Helpers: `productLocales` / `toProductLocale` in `src/i18n/routing.ts`.

Home slug: `home.md` (e.g. `content/en/home.md`, `content/pt-BR/home.md`).

Downstream epics (marketing content, SEO, etc.) must keep this map — especially **URL `pt` → content `pt-BR`**.
