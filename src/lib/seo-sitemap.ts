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

/** Home absolute URL for one URL locale (sitemap surface is home-only). */
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

/**
 * Home-only urlset for one locale: single `<url>` with `lastmod` and xhtml
 * hreflang alternates for all six URL locales + `x-default` → en.
 * `lastmod` defaults to build-time ISO date (YYYY-MM-DD).
 */
export function buildUrlsetXml(
	locale: UrlLocale,
	lastmod: string = new Date().toISOString().slice(0, 10),
): string {
	const loc = absoluteMarketingPageUrl(locale, "");
	const alternates = [
		...locales.map(
			(alt) =>
				`    <xhtml:link rel="alternate" hreflang="${alt}" href="${escapeXml(absoluteMarketingPageUrl(alt, ""))}"/>`,
		),
		`    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(absoluteMarketingPageUrl("en", ""))}"/>`,
	].join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
${alternates}
  </url>
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
