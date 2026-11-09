import { defineRouting } from "next-intl/routing";

/** URL locale slugs (public path prefixes). */
export const locales = ["ar", "en", "es", "fr", "pt", "ru"] as const;

/** Alias for downstream epics (story 1.3+). */
export const URL_LOCALES = locales;

export type UrlLocale = (typeof locales)[number];

/**
 * Product/content locale ids used by downstream content layout (story 1.3).
 * URL `/pt` maps to product id `pt-BR`.
 */
export const productLocales = {
	ar: "ar",
	en: "en",
	es: "es",
	fr: "fr",
	pt: "pt-BR",
	ru: "ru",
} as const satisfies Record<UrlLocale, string>;

export type ProductLocale = (typeof productLocales)[UrlLocale];

export function toProductLocale(urlLocale: UrlLocale): ProductLocale {
	return productLocales[urlLocale];
}

export const routing = defineRouting({
	locales,
	defaultLocale: "en",
	localePrefix: "always",
	// Accept-Language negotiation on `/`; fallback defaultLocale `en`.
	// next-intl issues temporary 307 redirects (not 301/308), so crawlers are not permanently locked.
	// Keep localeCookie off so Accept-Language on `/` is not overridden by NEXT_LOCALE after a switch.
	// Sticky `/` preference after explicit switch deferred; locale lives in the URL prefix.
	localeDetection: true,
	localeCookie: false,
});
