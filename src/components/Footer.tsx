import React from "react";
import { FaFingerprint } from "react-icons/fa";
import { getTranslations } from "next-intl/server";

import { footerDetails } from "@/data/footer";
import { siteDetails } from "@/data/siteDetails";
import { Link } from "@/i18n/navigation";

export default async function Footer() {
	const t = await getTranslations();

	return (
		<footer className="bg-hero-background text-foreground py-10">
			<div className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
				<div>
					<Link href="/" className="flex items-center gap-2">
						<FaFingerprint className="min-w-fit w-5 h-5 md:w-7 md:h-7" />
						<h3 className="text-xl font-semibold cursor-pointer">
							{t("Brand.name")}
						</h3>
					</Link>
					<p className="mt-3.5 text-foreground-accent">{t("Shell.placeholder")}</p>
				</div>
				<div>
					<ul className="space-y-2">
						{footerDetails.quickLinks.map((item) => (
							<li key={item.url}>
								<Link
									href={item.url}
									className="text-foreground-accent hover:text-foreground"
								>
									{t(`Shell.footer.${item.text}`)}
								</Link>
							</li>
						))}
					</ul>
				</div>
				<div>
					<h4 className="text-lg font-semibold mb-4">{t("Shell.cta")}</h4>
					<a
						href={siteDetails.botUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-foreground-accent hover:text-foreground"
					>
						{siteDetails.botUrl}
					</a>
				</div>
			</div>
			<div className="mt-8 md:text-center text-foreground-accent px-6">
				<p>
					Copyright &copy; {new Date().getFullYear()} {siteDetails.siteName}. All
					rights reserved.
				</p>
			</div>
		</footer>
	);
}
