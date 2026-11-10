"use client";

import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { BiMinus, BiPlus } from "react-icons/bi";

import Container from "@/components/Container";
import SectionTitle from "@/components/SectionTitle";
import { Link } from "@/i18n/navigation";
import type { HomeFaqItem } from "@/lib/home-copy";

type Props = {
	title: string;
	description: string;
	moreLink: string;
	items: HomeFaqItem[];
};

export default function FaqAccordion({
	title,
	description,
	moreLink,
	items,
}: Props) {
	return (
		<section id="faq" className="py-10 lg:py-20">
			<Container>
				<div className="flex flex-col gap-10 lg:flex-row">
					<div className="lg:max-w-sm">
						<SectionTitle>
							<h2 className="my-3 text-center !leading-snug lg:text-start">
								{title}
							</h2>
						</SectionTitle>
						<p className="text-center text-foreground-accent lg:mt-4 lg:text-start">
							{description}
						</p>
						<Link
							href="/faq"
							className="mt-4 block text-center font-medium text-secondary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary lg:text-start"
						>
							{moreLink}
						</Link>
					</div>

					<div className="w-full border-b lg:max-w-2xl lg:mx-auto">
						{items.map((item) => (
							<div key={item.question} className="mb-7">
								<Disclosure>
									{({ open }) => (
										<>
											<DisclosureButton className="flex w-full items-center justify-between border-t px-4 pt-7 text-start text-lg">
												<span className="pe-4 text-xl font-semibold md:text-2xl">
													{item.question}
												</span>
												{open ? (
													<BiMinus className="h-5 w-5 shrink-0 text-secondary" />
												) : (
													<BiPlus className="h-5 w-5 shrink-0 text-secondary" />
												)}
											</DisclosureButton>
											<DisclosurePanel className="px-4 pb-2 pt-4 text-foreground-accent">
												{item.answer}
											</DisclosurePanel>
										</>
									)}
								</Disclosure>
							</div>
						))}
					</div>
				</div>
			</Container>
		</section>
	);
}
