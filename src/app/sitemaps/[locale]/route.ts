import { locales } from "@/i18n/routing";
import { buildUrlsetXml, isUrlLocale } from "@/lib/seo-sitemap";

type RouteParams = {
	params: { locale: string };
};

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export function GET(_request: Request, { params }: RouteParams): Response {
	const locale = params?.locale;

	if (!locale || !isUrlLocale(locale)) {
		return new Response(null, { status: 404 });
	}

	const xml = buildUrlsetXml(locale);

	return new Response(xml, {
		status: 200,
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
		},
	});
}
