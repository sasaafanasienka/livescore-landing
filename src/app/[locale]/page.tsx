import type { Metadata } from "next";

import JsonLdScript from "@/components/JsonLdScript";
import MarketingMarkdownPage from "@/components/MarketingMarkdownPage";
import { MARKETING_PAGES } from "@/lib/content";
import {
	organizationJsonLd,
	softwareApplicationJsonLd,
} from "@/lib/seo-jsonld";
import { marketingPageMetadata } from "@/lib/seo-metadata";
import { isUrlLocale } from "@/lib/seo-sitemap";

type Props = {
	params: { locale: string };
};

/** Home → MARKETING_SITEMAP urlPath `""`. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
	if (!isUrlLocale(params.locale)) {
		return {};
	}

	return marketingPageMetadata(params.locale, "", MARKETING_PAGES.home);
}

export default async function LocaleHomePage({ params }: Props) {
	return (
		<>
			<JsonLdScript
				data={[organizationJsonLd(), softwareApplicationJsonLd()]}
			/>
			<MarketingMarkdownPage
				locale={params.locale}
				page={MARKETING_PAGES.home}
			/>
		</>
	);
}
