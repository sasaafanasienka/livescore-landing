"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import clsx from "clsx";

import Container from "@/components/Container";
import SectionTitle from "@/components/SectionTitle";
import { Link } from "@/i18n/navigation";
import type { HomePricingPanel } from "@/lib/home-copy";

type Props = {
	title: string;
	description: string;
	moreLink: string;
	personal: HomePricingPanel;
	chats: HomePricingPanel;
};

function PricingPanel({ panel }: { panel: HomePricingPanel }) {
	return (
		<div className="rounded-2xl bg-white p-6 text-start md:p-8">
			<h3 className="mb-3 text-2xl font-semibold">{panel.title}</h3>
			<p className="mb-6 text-foreground-accent">{panel.body}</p>
			<ul className="flex flex-col gap-3">
				{panel.points.map((point) => (
					<li
						key={point}
						className="border-s-2 border-primary ps-4 leading-relaxed"
					>
						{point}
					</li>
				))}
			</ul>
		</div>
	);
}

export default function PricingTabs({
	title,
	description,
	moreLink,
	personal,
	chats,
}: Props) {
	const panels = [personal, chats];

	return (
		<section id="pricing" className="py-10 lg:py-20">
			<Container>
				<div className="mx-auto mb-10 max-w-2xl text-center">
					<SectionTitle>
						<h2 className="mb-4">{title}</h2>
					</SectionTitle>
					<p className="mb-4 text-foreground-accent">{description}</p>
					<Link
						href="/pricing"
						className="font-medium text-secondary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
					>
						{moreLink}
					</Link>
				</div>

				<TabGroup>
					<TabList className="mx-auto flex max-w-xl flex-wrap justify-center gap-2">
						{panels.map((panel) => (
							<Tab
								key={panel.label}
								className={({ selected }) =>
									clsx(
										"rounded-full px-5 py-2 text-base font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary",
										selected
											? "bg-secondary text-white"
											: "bg-hero-background text-foreground hover:bg-hero-background/80",
									)
								}
							>
								{panel.label}
							</Tab>
						))}
					</TabList>
					<TabPanels className="mx-auto mt-8 max-w-2xl">
						{panels.map((panel) => (
							<TabPanel
								key={panel.label}
								className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
							>
								<PricingPanel panel={panel} />
							</TabPanel>
						))}
					</TabPanels>
				</TabGroup>
			</Container>
		</section>
	);
}
