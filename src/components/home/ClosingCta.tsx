import Container from "@/components/Container";
import PageSection from "@/components/PageSection";
import BotCtaLink from "@/components/home/BotCtaLink";

type Props = {
	heading: string;
	subheading: string;
	ctaLabel: string;
};

export default function ClosingCta({ heading, subheading, ctaLabel }: Props) {
	return (
		<PageSection id="cta">
			<Container>
				<div className="relative overflow-hidden rounded-3xl bg-[#050a02] bg-[linear-gradient(to_right,#12170f_1px,transparent_1px),linear-gradient(to_bottom,#12170f_1px,transparent_1px)] bg-[size:6rem_4rem] p-6 opacity-95 md:p-12">
					<div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_600px_at_50%_500px,#1C1C02,transparent)]" />
					<div className="relative flex flex-col items-start justify-center gap-4 text-start text-white md:items-center md:text-center">
						<h2 className="font-heading max-w-2xl text-[2.8125rem] font-bold lg:text-5xl">
							{heading}
						</h2>
						<p className="max-w-xl">{subheading}</p>
						<div className="mt-2 w-full md:w-auto">
							<BotCtaLink label={ctaLabel} />
						</div>
					</div>
				</div>
			</Container>
		</PageSection>
	);
}
