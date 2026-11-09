import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { siteDetails } from "@/data/siteDetails";
import { routing, type UrlLocale } from "@/i18n/routing";
import { MARKETING_PAGES, getPageMarkdown } from "@/lib/content";

type Props = {
	params: { locale: string };
};

export default async function LocaleOfficialChannelsPage({ params }: Props) {
	const { locale } = params;
	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}
	setRequestLocale(locale);

	const t = await getTranslations("Shell");
	const body = await getPageMarkdown(
		locale as UrlLocale,
		MARKETING_PAGES.officialChannels,
	);

	return (
		<section className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-6 pt-28 pb-16 text-center">
			<p className="max-w-xl text-lg text-foreground-accent whitespace-pre-wrap">
				{body}
			</p>
			<a
				href={siteDetails.botUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="text-black bg-primary hover:bg-primary-accent px-8 py-3 rounded-full transition-colors"
			>
				{t("cta")}
			</a>
		</section>
	);
}
