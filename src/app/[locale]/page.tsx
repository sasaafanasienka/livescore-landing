import type { Metadata } from "next";

import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import HomeLanding from "@/components/home/HomeLanding";
import JsonLdScript from "@/components/JsonLdScript";
import { routing } from "@/i18n/routing";
import { MARKETING_PAGES } from "@/lib/content";
import { getHomeCopy } from "@/lib/home-copy";
import {
	faqPageJsonLd,
	organizationJsonLd,
	softwareApplicationJsonLd,
} from "@/lib/seo-jsonld";
import { marketingPageMetadata } from "@/lib/seo-metadata";
import { isUrlLocale } from "@/lib/seo-sitemap";

type Props = {
	params: { locale: string };
};

/**
 * Home embeds the official-channels fetch (revalidate 300 on that data path).
 * ISR keeps the marketing shell cacheable while channel list stays fresh.
 */
export const revalidate = 300;

/** Home → MARKETING_SITEMAP urlPath `""`. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
	if (!isUrlLocale(params.locale)) {
		return {};
	}

	return marketingPageMetadata(params.locale, "", MARKETING_PAGES.home);
}

export default async function LocaleHomePage({ params }: Props) {
	if (!hasLocale(routing.locales, params.locale)) {
		notFound();
	}
	setRequestLocale(params.locale);

	if (!isUrlLocale(params.locale)) {
		notFound();
	}

	const copy = await getHomeCopy(params.locale);

	return (
		<>
			<JsonLdScript
				data={[
					organizationJsonLd(),
					softwareApplicationJsonLd(),
					faqPageJsonLd(copy.faq.items),
				]}
			/>
			<HomeLanding locale={params.locale} />
		</>
	);
}
