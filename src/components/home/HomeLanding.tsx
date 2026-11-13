import { Suspense } from "react";

import { getTranslations } from "next-intl/server";

import Container from "@/components/Container";
import PageSection from "@/components/PageSection";
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
	const groupCtaLabel = tShell("ctaAddToGroup");

	return (
		<>
			<HomeHero
				brand={tBrand("name")}
				headline={copy.hero.headline}
				subhead={copy.hero.subhead}
				ctaLabel={ctaLabel}
				groupCtaLabel={groupCtaLabel}
			/>
			<div id="features" className="scroll-mt-24">
				<HomeFeatureBand
					id="notifications"
					title={copy.notifications.title}
					description={copy.notifications.description}
					bullets={copy.notifications.bullets}
					imageSrc="/images/home-notifications.webp"
					imageAlt={copy.notifications.imageAlt}
					imageAtRight
					imageWidth={460}
					imageHeight={1024}
					sizes="(max-width: 768px) 100vw, 24rem"
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
			</div>
			<Suspense fallback={null}>
				<HowItWorksTabs
					title={copy.howItWorks.title}
					description={copy.howItWorks.description}
					tabs={copy.howItWorks.tabs}
				/>
			</Suspense>
			<PricingTabs
				title={copy.pricing.title}
				description={copy.pricing.description}
				freeColumn={copy.pricing.freeColumn}
				premiumColumn={copy.pricing.premiumColumn}
				rows={copy.pricing.rows}
			/>
			<PageSection
				id="official-channels"
				aria-labelledby="home-official-channels-heading"
				className="bg-hero-background"
			>
				<Container>
					<div className="mb-8 max-w-2xl text-start md:mx-auto md:text-center">
						<SectionTitle>
							<h2 id="home-official-channels-heading" className="mb-4">
								{copy.channels.title}
							</h2>
						</SectionTitle>
						<p className="text-foreground-accent">
							{copy.channels.description}
						</p>
					</div>
					<Suspense
						fallback={<OfficialChannelsHomeFallback locale={locale} />}
					>
						<OfficialChannelsHome locale={locale} />
					</Suspense>
				</Container>
			</PageSection>
			<FaqAccordion
				title={copy.faq.title}
				description={copy.faq.description}
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
