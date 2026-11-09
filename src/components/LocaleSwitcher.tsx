"use client";

import { useLocale } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { URL_LOCALES } from "@/i18n/routing";

export default function LocaleSwitcher() {
	const locale = useLocale();
	const pathname = usePathname();

	return (
		<div aria-label="Locale">
			<ul className="flex flex-wrap items-center gap-2">
				{URL_LOCALES.map((code) => {
					const active = code === locale;
					return (
						<li key={code}>
							{active ? (
								<span
									lang={code}
									aria-current="page"
									className="text-sm font-semibold uppercase text-foreground"
								>
									{code}
								</span>
							) : (
								<Link
									href={pathname}
									locale={code}
									lang={code}
									className="text-sm uppercase text-foreground-accent hover:text-foreground"
								>
									{code}
								</Link>
							)}
						</li>
					);
				})}
			</ul>
		</div>
	);
}
