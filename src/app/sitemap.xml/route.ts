import { absoluteLocaleSitemapUrls, buildSitemapIndexXml } from "@/lib/seo-sitemap";

export function GET(): Response {
	const xml = buildSitemapIndexXml(absoluteLocaleSitemapUrls());

	return new Response(xml, {
		status: 200,
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
		},
	});
}
