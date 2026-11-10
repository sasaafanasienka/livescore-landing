import { siteDetails } from "@/data/siteDetails";
import { locales, type UrlLocale } from "@/i18n/routing";
import { MARKETING_SITEMAP } from "@/lib/content";

const SITE_ORIGIN = siteDetails.siteUrl.replace(/\/$/, "");

export function isUrlLocale(value: string): value is UrlLocale {
	return (locales as readonly string[]).includes(value);
}

/** Absolute marketing page URL: `{origin}/{locale}` or `{origin}/{locale}/{urlPath}` (no trailing slash). */
export function absoluteMarketingPageUrl(
	locale: UrlLocale,
	urlPath: string,
): string {
	if (!urlPath) {
		return `${SITE_ORIGIN}/${locale}`;
	}
	return `${SITE_ORIGIN}/${locale}/${urlPath}`;
}

/** All eight locked absolute page URLs for one URL locale. */
export function localeMarketingPageUrls(locale: UrlLocale): string[] {
	return MARKETING_SITEMAP.map(({ urlPath }) =>
		absoluteMarketingPageUrl(locale, urlPath),
	);
}

/** Absolute per-locale sitemap document URL for the sitemap index. */
export function absoluteLocaleSitemapUrl(locale: UrlLocale): string {
	return `${SITE_ORIGIN}/sitemaps/${locale}.xml`;
}

/** Absolute locs for all six per-locale sitemaps. */
export function absoluteLocaleSitemapUrls(): string[] {
	return locales.map(absoluteLocaleSitemapUrl);
}

export function absoluteSitemapIndexUrl(): string {
	return `${SITE_ORIGIN}/sitemap.xml`;
}

export function buildSitemapIndexXml(sitemapLocs: string[]): string {
	const body = sitemapLocs
		.map((loc) => `  <sitemap>\n    <loc>${escapeXml(loc)}</loc>\n  </sitemap>`)
		.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
`;
}

export function buildUrlsetXml(pageUrls: string[]): string {
	const body = pageUrls
		.map((url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`)
		.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

function escapeXml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
}
