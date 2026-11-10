import type { Metadata } from "next";

import { locales, type UrlLocale } from "@/i18n/routing";
import { absoluteMarketingPageUrl } from "@/lib/seo-sitemap";

/**
 * Per-page Metadata `alternates`: absolute self-canonical for the active
 * URL locale plus reciprocal hreflang for all six URL slugs and `x-default` → en.
 * Hreflang keys are URL locales (`pt`, not `pt-BR`).
 */
export function marketingPageAlternates(
	locale: UrlLocale,
	urlPath: string,
): NonNullable<Metadata["alternates"]> {
	const languages: Record<string, string> = {
		...Object.fromEntries(
			locales.map((loc) => [loc, absoluteMarketingPageUrl(loc, urlPath)]),
		),
		"x-default": absoluteMarketingPageUrl("en", urlPath),
	};

	return {
		canonical: absoluteMarketingPageUrl(locale, urlPath),
		languages,
	};
}
