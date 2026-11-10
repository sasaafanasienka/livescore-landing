import Button from "@/components/Button";
import Container from "@/components/Container";
import BotCtaLink from "@/components/home/BotCtaLink";
import { siteDetails } from "@/data/siteDetails";
import { fontHeading } from "@/lib/fonts";

type Props = {
	brand: string;
	headline: string;
	subhead: string;
	ctaLabel: string;
	groupCtaLabel: string;
};

export default function HomeHero({
	brand,
	headline,
	subhead,
	ctaLabel,
	groupCtaLabel,
}: Props) {
	return (
		<section
			id="hero"
			className="relative flex items-center justify-center pb-[60px] pt-32 md:pb-[100px] md:pt-40"
		>
			<div className="absolute inset-0 -z-10 w-full">
				<div className="absolute inset-0 h-full w-full bg-hero-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]" />
			</div>
			<div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent via-[rgba(233,238,255,0.5)] to-[rgba(202,208,230,0.5)] backdrop-blur-[2px]" />

			<Container className="relative z-10">
				<div className="mx-auto max-w-3xl text-start md:text-center">
					<p
						className={`${fontHeading.className} font-heading mb-4 text-2xl font-bold tracking-tight text-secondary md:text-3xl`}
					>
						{brand}
					</p>
					<h1
						className={`${fontHeading.className} font-heading max-w-2xl text-5xl font-bold md:mx-auto lg:text-7xl`}
					>
						{headline}
					</h1>
					<p className="mt-4 max-w-xl text-foreground-accent md:mx-auto">
						{subhead}
					</p>
					<div className="mt-8 flex w-full flex-col items-stretch gap-3 min-[481px]:w-auto min-[481px]:flex-row min-[481px]:flex-wrap min-[481px]:items-center min-[481px]:justify-start md:justify-center">
						<BotCtaLink label={ctaLabel} />
						<Button
							as="a"
							variant="outline"
							href={siteDetails.botGroupUrl}
							target="_blank"
							rel="noopener noreferrer"
						>
							{groupCtaLabel}
						</Button>
					</div>
				</div>
			</Container>
		</section>
	);
}
