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
	// Story 1.2 owns Accept-Language negotiation on `/`.
	localeDetection: false,
});
