import Container from "@/components/Container";
import PageSection from "@/components/PageSection";
import SectionTitle from "@/components/SectionTitle";
import type { HomePricingRow } from "@/lib/home-copy";

type Props = {
	title: string;
	description: string;
	freeColumn: string;
	premiumColumn: string;
	rows: HomePricingRow[];
};

/** Groups/channels Free vs Premium comparison — claim-safe catalog facts only. */
export default function PricingTabs({
	title,
	description,
	freeColumn,
	premiumColumn,
	rows,
}: Props) {
	return (
		<PageSection id="pricing" className="scroll-mt-24">
			<Container>
				<div className="mb-10 max-w-2xl text-start md:mx-auto md:text-center">
					<SectionTitle>
						<h2 className="mb-4">{title}</h2>
					</SectionTitle>
					<p className="text-foreground-accent">{description}</p>
				</div>

				<div className="mx-auto max-w-3xl">
					<table className="w-full border-collapse text-start text-base max-[540px]:block">
						<thead className="max-[540px]:block">
							<tr className="border-b border-black/10 max-[540px]:grid max-[540px]:grid-cols-2">
								<th
									scope="col"
									className="px-3 py-3 font-semibold text-foreground max-[540px]:hidden"
								>
									<span className="sr-only">Feature</span>
								</th>
								<th
									scope="col"
									className="px-3 py-3 text-center font-semibold text-foreground"
								>
									{freeColumn}
								</th>
								<th
									scope="col"
									className="px-3 py-3 text-center font-semibold text-foreground"
								>
									{premiumColumn}
								</th>
							</tr>
						</thead>
						<tbody className="max-[540px]:block">
							{rows.map((row) => (
								<tr
									key={row.label}
									className="border-b border-black/5 max-[540px]:grid max-[540px]:grid-cols-2"
								>
									<th
										scope="row"
										className="px-3 py-3 font-medium text-foreground max-[540px]:col-span-2 max-[540px]:pb-1"
									>
										{row.label}
									</th>
									<td className="px-3 py-3 text-center text-foreground-accent max-[540px]:pt-0">
										{row.free}
									</td>
									<td className="px-3 py-3 text-center text-foreground-accent max-[540px]:pt-0">
										{row.premium}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Container>
		</PageSection>
	);
}
