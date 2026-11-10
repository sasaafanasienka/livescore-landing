"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import clsx from "clsx";

import Container from "@/components/Container";
import SectionTitle from "@/components/SectionTitle";
import type { HomeHowTab } from "@/lib/home-copy";

type Props = {
	title: string;
	description: string;
	tabs: HomeHowTab[];
};

export default function HowItWorksTabs({ title, description, tabs }: Props) {
	return (
		<section id="how-it-works" className="bg-hero-background py-10 lg:py-20">
			<Container>
				<div className="mx-auto mb-10 max-w-2xl text-center">
					<SectionTitle>
						<h2 className="mb-4">{title}</h2>
					</SectionTitle>
					<p className="text-foreground-accent">{description}</p>
				</div>

				<TabGroup>
					<TabList className="mx-auto flex max-w-xl flex-wrap justify-center gap-2">
						{tabs.map((tab) => (
							<Tab
								key={tab.id}
								className={({ selected }) =>
									clsx(
										"rounded-full px-5 py-2 text-base font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary",
										selected
											? "bg-secondary text-white"
											: "bg-white text-foreground hover:bg-white/80",
									)
								}
							>
								{tab.label}
							</Tab>
						))}
					</TabList>
					<TabPanels className="mx-auto mt-8 max-w-2xl">
						{tabs.map((tab) => (
							<TabPanel
								key={tab.id}
								className="rounded-2xl bg-white p-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
							>
								<ol className="flex list-decimal flex-col gap-4 ps-5 text-start">
									{tab.steps.map((step) => (
										<li key={step} className="leading-relaxed text-foreground-accent">
											<span className="text-foreground">{step}</span>
										</li>
									))}
								</ol>
							</TabPanel>
						))}
					</TabPanels>
				</TabGroup>
			</Container>
		</section>
	);
}
