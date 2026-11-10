import { siteDetails } from "@/data/siteDetails";

type Props = {
	label: string;
	className?: string;
};

const DEFAULT_CLASSES =
	"inline-block rounded-full bg-primary px-8 py-3 text-black transition-colors hover:bg-primary-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

/** Primary bot CTA — always opens LiveScoreAppBot. */
export default function BotCtaLink({ label, className }: Props) {
	return (
		<a
			href={siteDetails.botUrl}
			target="_blank"
			rel="noopener noreferrer"
			className={className ?? DEFAULT_CLASSES}
		>
			{label}
		</a>
	);
}
