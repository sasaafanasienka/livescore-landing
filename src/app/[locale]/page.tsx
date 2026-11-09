import { getTranslations, setRequestLocale } from "next-intl/server";

import { siteDetails } from "@/data/siteDetails";

type Props = {
	params: { locale: string };
};

export default async function LocaleHomePage({ params }: Props) {
	const { locale } = params;
	setRequestLocale(locale);

	const t = await getTranslations("Shell");

	return (
		<section className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-6 pt-28 pb-16 text-center">
			<p className="max-w-xl text-lg text-foreground-accent">{t("placeholder")}</p>
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
