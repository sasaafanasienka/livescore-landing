import Container from "@/components/Container";
import BotCtaLink from "@/components/home/BotCtaLink";

type Props = {
	heading: string;
	subheading: string;
	ctaLabel: string;
};

export default function ClosingCta({ heading, subheading, ctaLabel }: Props) {
	return (
		<section id="cta" className="mb-5 mt-10 lg:my-20">
			<Container>
				<div className="relative z-10 mx-auto w-full py-12 sm:py-20">
					<div className="absolute inset-0 -z-10 h-full w-full rounded-3xl bg-[#050a02] bg-[linear-gradient(to_right,#12170f_1px,transparent_1px),linear-gradient(to_bottom,#12170f_1px,transparent_1px)] bg-[size:6rem_4rem] opacity-95">
						<div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_600px_at_50%_500px,#1C1C02,transparent)]" />
					</div>

					<div className="flex h-full flex-col items-center justify-center px-5 text-center text-white">
						<h2 className="mb-4 max-w-2xl text-2xl font-semibold sm:text-3xl md:text-5xl md:leading-tight">
							{heading}
						</h2>
						<p className="mx-auto max-w-xl md:px-5">{subheading}</p>
						<div className="mt-6">
							<BotCtaLink label={ctaLabel} />
						</div>
					</div>
				</div>
			</Container>
		</section>
	);
}
