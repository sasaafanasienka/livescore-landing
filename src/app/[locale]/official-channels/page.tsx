import type { Metadata } from "next";

import MarketingMarkdownPage from "@/components/MarketingMarkdownPage";
import OfficialChannelsList from "@/components/OfficialChannelsList";
import { MARKETING_PAGES } from "@/lib/content";
import { marketingPageMetadata } from "@/lib/seo-metadata";
import { isUrlLocale } from "@/lib/seo-sitemap";

type Props = {
	params: { locale: string };
};

/**
 * `mode` (fixture / unconfigured / error / live) is read from runtime env, so
 * the page must render per request instead of baking a state into the build
 * artifact. List freshness is the upstream fetch data cache in
 * `src/lib/official-channels.ts` (`OFFICIAL_CHANNELS_REVALIDATE`, tag
 * `official-channels`) — a product-side change reaches the page without a
 * content edit, content commit or content deploy.
 */
export const dynamic = "force-dynamic";

/** Official channels → MARKETING_SITEMAP urlPath `official-channels`. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
	if (!isUrlLocale(params.locale)) {
		return {};
	}

	return marketingPageMetadata(
		params.locale,
		"official-channels",
		MARKETING_PAGES.officialChannels,
	);
}

export default async function LocaleOfficialChannelsPage({ params }: Props) {
	return (
		<MarketingMarkdownPage
			locale={params.locale}
			page={MARKETING_PAGES.officialChannels}
		>
			{/* Tracer scope: live list on `en` only; the other five locales keep the
			    static shell until story 4.3 adds their `OfficialChannels` labels. */}
			{params.locale === "en" ? <OfficialChannelsList locale="en" /> : null}
		</MarketingMarkdownPage>
	);
}
