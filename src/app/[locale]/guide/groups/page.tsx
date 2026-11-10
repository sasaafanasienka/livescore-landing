import type { Metadata } from "next";

import MarketingMarkdownPage from "@/components/MarketingMarkdownPage";
import { MARKETING_PAGES } from "@/lib/content";
import { marketingPageAlternates } from "@/lib/seo-metadata";
import { isUrlLocale } from "@/lib/seo-sitemap";

type Props = {
	params: { locale: string };
};

/** Guide groups → MARKETING_SITEMAP urlPath `guide/groups`. */
export function generateMetadata({ params }: Props): Metadata {
	if (!isUrlLocale(params.locale)) {
		return {};
	}

	return {
		alternates: marketingPageAlternates(params.locale, "guide/groups"),
	};
}

export default async function LocaleGuideGroupsPage({ params }: Props) {
	return (
		<MarketingMarkdownPage
			locale={params.locale}
			page={MARKETING_PAGES.guideGroups}
		/>
	);
}
