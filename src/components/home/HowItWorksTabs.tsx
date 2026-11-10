"use client";

import { useMemo } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import clsx from "clsx";

import Container from "@/components/Container";
import PageSection from "@/components/PageSection";
import SectionTitle from "@/components/SectionTitle";
import { useQueryTab } from "@/hooks/useQueryTab";
import type { HomeHowTab } from "@/lib/home-copy";
import { renderRichText } from "@/lib/rich-text";

type Props = {
	title: string;
	description: string;
	tabs: HomeHowTab[];
};

const HOW_PARAM = "how";

export default function HowItWorksTabs({ title, description, tabs }: Props) {
	const values = useMemo(() => tabs.map((tab) => tab.id), [tabs]);
	const [selectedIndex, setSelectedIndex] = useQueryTab(HOW_PARAM, values);

	return (
		<PageSection
			id="how-it-works"
			className="scroll-mt-24 bg-hero-background"
		>
			<Container>
				<div className="mb-10 max-w-2xl text-start md:mx-auto md:text-center">
					<SectionTitle>
						<h2 className="mb-4">{title}</h2>
					</SectionTitle>
					<p className="text-foreground-accent">{description}</p>
				</div>

				<TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
					<TabList className="flex max-w-xl flex-wrap justify-start gap-2 md:mx-auto md:justify-center">
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
						{tabs.map((tab, index) => (
							<TabPanel
								key={tab.id}
								static
								unmount={false}
								className={clsx(
									"rounded-2xl bg-white p-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary",
									selectedIndex !== index && "hidden",
								)}
							>
								<ol className="flex list-decimal flex-col gap-4 ps-5 text-start">
									{tab.steps.map((step) => (
										<li
											key={step}
											className="leading-relaxed text-foreground-accent"
										>
											<span className="text-foreground">
												{renderRichText(step)}
											</span>
										</li>
									))}
								</ol>
							</TabPanel>
						))}
					</TabPanels>
				</TabGroup>
			</Container>
		</PageSection>
	);
}
