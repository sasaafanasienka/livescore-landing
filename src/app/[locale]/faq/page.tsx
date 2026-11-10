import type { Metadata } from "next";

import JsonLdScript from "@/components/JsonLdScript";
import MarketingMarkdownPage from "@/components/MarketingMarkdownPage";
import { MARKETING_PAGES, getPageMarkdown } from "@/lib/content";
import { faqPageJsonLd } from "@/lib/seo-jsonld";
import { marketingPageMetadata } from "@/lib/seo-metadata";
import { isUrlLocale } from "@/lib/seo-sitemap";

type Props = {
	params: { locale: string };
};

/** FAQ → MARKETING_SITEMAP urlPath `faq`. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
	if (!isUrlLocale(params.locale)) {
		return {};
	}

	return marketingPageMetadata(params.locale, "faq", MARKETING_PAGES.faq);
}

export default async function LocaleFaqPage({ params }: Props) {
	const jsonLd = isUrlLocale(params.locale)
		? faqPageJsonLd(
				await getPageMarkdown(params.locale, MARKETING_PAGES.faq),
			)
		: null;

	return (
		<>
			{jsonLd ? <JsonLdScript data={jsonLd} /> : null}
			<MarketingMarkdownPage
				locale={params.locale}
				page={MARKETING_PAGES.faq}
			/>
		</>
	);
}
