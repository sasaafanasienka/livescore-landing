import SectionTitle from "@/components/SectionTitle";
import BotCtaLink from "@/components/home/BotCtaLink";

type Props = {
	brand: string;
	headline: string;
	subhead: string;
	ctaLabel: string;
};

export default function HomeHero({ brand, headline, subhead, ctaLabel }: Props) {
	return (
		<section
			id="hero"
			className="relative flex items-center justify-center px-5 pb-16 pt-32 md:pb-24 md:pt-40"
		>
			<div className="absolute inset-0 -z-10 w-full">
				<div className="absolute inset-0 h-full w-full bg-hero-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]" />
			</div>
			<div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent via-[rgba(233,238,255,0.5)] to-[rgba(202,208,230,0.5)] backdrop-blur-[2px]" />

			<div className="relative z-10 mx-auto max-w-3xl text-center">
				<p className="mb-4 text-2xl font-semibold text-secondary md:text-3xl">
					{brand}
				</p>
				<SectionTitle>
					<h1 className="mx-auto max-w-2xl text-4xl md:text-6xl md:leading-tight">
						{headline}
					</h1>
				</SectionTitle>
				<p className="mx-auto mt-4 max-w-xl text-foreground-accent">
					{subhead}
				</p>
				<div className="mt-8">
					<BotCtaLink label={ctaLabel} />
				</div>
			</div>
		</section>
	);
}
