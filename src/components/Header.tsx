"use client";

import React, { useState } from "react";
import { Transition } from "@headlessui/react";
import { useTranslations } from "next-intl";
import { HiOutlineXMark, HiBars3 } from "react-icons/hi2";
import BrandMark from "./BrandMark";
import Button from "./Button";
import Container from "./Container";
import LocaleSwitcher from "./LocaleSwitcher";
import { menuItems } from "@/data/menuItems";
import { siteDetails } from "@/data/siteDetails";
import { Link } from "@/i18n/navigation";

const Header: React.FC = () => {
	const t = useTranslations();
	const [isOpen, setIsOpen] = useState(false);

	const toggleMenu = () => {
		setIsOpen(!isOpen);
	};

	return (
		<header className="fixed left-0 right-0 top-0 z-50 mx-auto w-full bg-transparent lg:absolute">
			<div className="bg-white lg:bg-transparent">
				<Container>
					<nav className="mx-auto flex items-center justify-between gap-4 py-2 lg:py-10">
						<Link href="/" className="flex shrink-0 items-center">
							<BrandMark priority />
						</Link>

						<ul className="hidden items-center space-x-6 lg:flex">
							{menuItems.map((item) => (
								<li key={item.hash + (item.query?.how ?? "")}>
									<Link
										href={{
											pathname: "/",
											query: item.query,
											hash: item.hash,
										}}
										className="text-foreground transition-colors hover:text-foreground-accent"
									>
										{t(`Shell.nav.${item.text}`)}
									</Link>
								</li>
							))}
							<li>
								<LocaleSwitcher />
							</li>
							<li>
								<Button
									as="a"
									href={siteDetails.botUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									{t("Shell.getStarted")}
								</Button>
							</li>
						</ul>

						<div className="flex items-center lg:hidden">
							<button
								onClick={toggleMenu}
								type="button"
								className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-black focus:outline-none"
								aria-controls="mobile-menu"
								aria-expanded={isOpen}
							>
								{isOpen ? (
									<HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
								) : (
									<HiBars3 className="h-6 w-6" aria-hidden="true" />
								)}
								<span className="sr-only">Toggle navigation</span>
							</button>
						</div>
					</nav>
				</Container>
			</div>

			<Transition
				show={isOpen}
				enter="transition ease-out duration-200 transform"
				enterFrom="opacity-0 scale-95"
				enterTo="opacity-100 scale-100"
				leave="transition ease-in duration-75 transform"
				leaveFrom="opacity-100 scale-100"
				leaveTo="opacity-0 scale-95"
			>
				<div id="mobile-menu" className="bg-white lg:hidden">
					<Container>
						<ul className="flex flex-col space-y-4 pb-6 pt-1">
							{menuItems.map((item) => (
								<li key={item.hash + (item.query?.how ?? "")}>
									<Link
										href={{
											pathname: "/",
											query: item.query,
											hash: item.hash,
										}}
										className="text-foreground transition-colors hover:text-foreground-accent"
										onClick={toggleMenu}
									>
										{t(`Shell.nav.${item.text}`)}
									</Link>
								</li>
							))}
							<li>
								<LocaleSwitcher />
							</li>
							<li>
								<Button
									as="a"
									href={siteDetails.botUrl}
									target="_blank"
									rel="noopener noreferrer"
									onClick={toggleMenu}
								>
									{t("Shell.getStarted")}
								</Button>
							</li>
						</ul>
					</Container>
				</div>
			</Transition>
		</header>
	);
};

export default Header;
