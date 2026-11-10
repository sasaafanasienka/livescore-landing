"use client";

import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import clsx from "clsx";
import { BiMinus, BiPlus } from "react-icons/bi";

import Container from "@/components/Container";
import PageSection from "@/components/PageSection";
import SectionTitle from "@/components/SectionTitle";
import type { HomeFaqItem } from "@/lib/home-copy";
import { renderRichText } from "@/lib/rich-text";

type Props = {
	title: string;
	description: string;
	items: HomeFaqItem[];
};

export default function FaqAccordion({ title, description, items }: Props) {
	return (
		<PageSection id="faq" className="scroll-mt-24">
			<Container>
				<div className="flex flex-col gap-10 lg:flex-row">
					<div className="lg:max-w-sm">
						<SectionTitle>
							<h2 className="my-3 text-start">
								{title}
							</h2>
						</SectionTitle>
						<p className="text-start text-foreground-accent lg:mt-4">
							{description}
						</p>
					</div>

					<div className="w-full border-b lg:max-w-2xl lg:mx-auto">
						{items.map((item) => (
							<div key={item.question} className="mb-7">
								<Disclosure>
									{({ open }) => (
										<>
											<DisclosureButton className="flex w-full items-center justify-between border-t pt-7 text-start text-lg">
												<span className="pe-4 text-xl font-semibold md:text-2xl">
													{item.question}
												</span>
												{open ? (
													<BiMinus className="h-5 w-5 shrink-0 text-secondary" />
												) : (
													<BiPlus className="h-5 w-5 shrink-0 text-secondary" />
												)}
											</DisclosureButton>
											<DisclosurePanel
												static
												className={clsx(
													"pb-2 pt-4 text-foreground-accent",
													!open && "hidden",
												)}
											>
												{renderRichText(item.answer)}
											</DisclosurePanel>
										</>
									)}
								</Disclosure>
							</div>
						))}
					</div>
				</div>
			</Container>
		</PageSection>
	);
}
