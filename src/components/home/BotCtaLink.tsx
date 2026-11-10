import Button from "@/components/Button";
import { siteDetails } from "@/data/siteDetails";

type Props = {
	label: string;
	className?: string;
};

/** Primary bot CTA — always opens LiveScoreAppBot. */
export default function BotCtaLink({ label, className }: Props) {
	return (
		<Button
			as="a"
			href={siteDetails.botUrl}
			target="_blank"
			rel="noopener noreferrer"
			className={className}
		>
			{label}
		</Button>
	);
}
