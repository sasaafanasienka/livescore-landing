import { Suspense } from "react";

import type { Metadata } from "next";

import MarketingMarkdownPage from "@/components/MarketingMarkdownPage";
import OfficialChannelsList from "@/components/OfficialChannelsList";
import OfficialChannelsLoading from "@/components/OfficialChannelsLoading";
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
	// `MarketingMarkdownPage` 404s an unknown locale; this guard only keeps the
	// list's `UrlLocale` type honest for the JSX below.
	const listLocale = isUrlLocale(params.locale) ? params.locale : null;

	return (
		<MarketingMarkdownPage
			locale={params.locale}
			page={MARKETING_PAGES.officialChannels}
		>
			{/* Streamed on every locale: the shell copy above flushes first, then the
			    list (or its labelled skeleton) in the same server response. Still a
			    server component — no client fetch, no `/api/channels` call. */}
			{listLocale ? (
				<Suspense fallback={<OfficialChannelsLoading locale={listLocale} />}>
					<OfficialChannelsList locale={listLocale} />
				</Suspense>
			) : null}
		</MarketingMarkdownPage>
	);
}
