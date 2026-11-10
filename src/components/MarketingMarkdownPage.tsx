import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { siteDetails } from "@/data/siteDetails";
import { routing, type UrlLocale } from "@/i18n/routing";
import {
	type MarketingPage,
	getPageMarkdown,
	stripOptionalFrontmatter,
} from "@/lib/content";

type Props = {
	locale: string;
	page: MarketingPage;
};

export default async function MarketingMarkdownPage({ locale, page }: Props) {
	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}
	setRequestLocale(locale);

	const t = await getTranslations("Shell");
	const raw = await getPageMarkdown(locale as UrlLocale, page);
	const body = stripOptionalFrontmatter(raw);

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
