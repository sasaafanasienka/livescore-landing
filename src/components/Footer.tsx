import React from "react";
import { getTranslations } from "next-intl/server";

import BrandMark from "@/components/BrandMark";
import Button from "@/components/Button";
import Container from "@/components/Container";
import { footerDetails } from "@/data/footer";
import { siteDetails } from "@/data/siteDetails";
import { Link } from "@/i18n/navigation";

export default async function Footer() {
	const t = await getTranslations();

	return (
		<footer className="bg-hero-background py-[60px] text-foreground md:py-[100px]">
			<Container>
				<div className="grid grid-cols-1 gap-10 md:grid-cols-3">
					<div>
						<Link href="/" className="inline-block">
							<BrandMark size="sm" />
						</Link>
					</div>
					<div>
						<ul className="space-y-2">
							{footerDetails.quickLinks.map((item) => (
								<li key={item.hash + (item.query?.how ?? "")}>
									<Link
										href={{
											pathname: "/",
											query: item.query,
											hash: item.hash,
										}}
										className="text-foreground-accent hover:text-foreground"
									>
										{t(`Shell.nav.${item.text}`)}
									</Link>
								</li>
							))}
							<li>
								<a
									href={siteDetails.privacyUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-foreground-accent hover:text-foreground"
								>
									{t("Shell.privacy")}
								</a>
							</li>
							<li>
								<a
									href={siteDetails.termsUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-foreground-accent hover:text-foreground"
								>
									{t("Shell.terms")}
								</a>
							</li>
						</ul>
					</div>
					<div>
						<Button
							as="a"
							href={siteDetails.botUrl}
							target="_blank"
							rel="noopener noreferrer"
						>
							{t("Shell.getStarted")}
						</Button>
					</div>
				</div>
				<div className="mt-8 text-foreground-accent md:text-center">
					<p>
						Copyright &copy; {new Date().getFullYear()} {siteDetails.siteName}.
						All rights reserved.
					</p>
				</div>
			</Container>
		</footer>
	);
}
