import { Suspense } from "react";

import { getTranslations } from "next-intl/server";

import Container from "@/components/Container";
import ClosingCta from "@/components/home/ClosingCta";
import FaqAccordion from "@/components/home/FaqAccordion";
import HomeFeatureBand from "@/components/home/HomeFeatureBand";
import HomeHero from "@/components/home/HomeHero";
import HowItWorksTabs from "@/components/home/HowItWorksTabs";
import OfficialChannelsHome, {
	OfficialChannelsHomeFallback,
} from "@/components/home/OfficialChannelsHome";
import PricingTabs from "@/components/home/PricingTabs";
import SectionTitle from "@/components/SectionTitle";
import { Link } from "@/i18n/navigation";
import type { UrlLocale } from "@/i18n/routing";
import { getHomeCopy } from "@/lib/home-copy";

type Props = {
	locale: UrlLocale;
};

/**
 * Longform claim-safe home landing — section order locked by plan Intent.
 * Copy from `content/home/{productLocale}.json`; CTAs reuse Shell label + botUrl.
 */
export default async function HomeLanding({ locale }: Props) {
	const copy = await getHomeCopy(locale);
	const tShell = await getTranslations({ locale, namespace: "Shell" });
	const tBrand = await getTranslations({ locale, namespace: "Brand" });
	const ctaLabel = tShell("cta");

	return (
		<>
			<HomeHero
				brand={tBrand("name")}
				headline={copy.hero.headline}
				subhead={copy.hero.subhead}
				ctaLabel={ctaLabel}
			/>
			<HomeFeatureBand
				id="notifications"
				title={copy.notifications.title}
				description={copy.notifications.description}
				bullets={copy.notifications.bullets}
				imageSrc="/images/home-notifications.webp"
				imageAlt={copy.notifications.imageAlt}
				imageAtRight
			/>
			<HomeFeatureBand
				id="mini-app"
				title={copy.miniApp.title}
				description={copy.miniApp.description}
				bullets={copy.miniApp.bullets}
				imageSrc="/images/home-miniapp.webp"
				imageAlt={copy.miniApp.imageAlt}
				imageAtRight={false}
			/>
			<HowItWorksTabs
				title={copy.howItWorks.title}
				description={copy.howItWorks.description}
				tabs={copy.howItWorks.tabs}
			/>
			<PricingTabs
				title={copy.pricing.title}
				description={copy.pricing.description}
				moreLink={copy.pricing.moreLink}
				personal={copy.pricing.personal}
				chats={copy.pricing.chats}
			/>
			<section
				id="official-channels"
				aria-labelledby="home-official-channels-heading"
				className="bg-hero-background py-10 lg:py-20"
			>
				<Container>
					<div className="mx-auto mb-8 max-w-2xl text-center">
						<SectionTitle>
							<h2 id="home-official-channels-heading" className="mb-4">
								{copy.channels.title}
							</h2>
						</SectionTitle>
						<p className="mb-4 text-foreground-accent">
							{copy.channels.description}
						</p>
						<Link
							href="/official-channels"
							className="font-medium text-secondary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
						>
							{copy.channels.seeAll}
						</Link>
					</div>
					<Suspense
						fallback={<OfficialChannelsHomeFallback locale={locale} />}
					>
						<OfficialChannelsHome locale={locale} />
					</Suspense>
				</Container>
			</section>
			<FaqAccordion
				title={copy.faq.title}
				description={copy.faq.description}
				moreLink={copy.faq.moreLink}
				items={copy.faq.items}
			/>
			<ClosingCta
				heading={copy.closingCta.heading}
				subheading={copy.closingCta.subheading}
				ctaLabel={ctaLabel}
			/>
		</>
	);
}
