import { getTranslations } from "next-intl/server";

import { siteDetails } from "@/data/siteDetails";
import type { UrlLocale } from "@/i18n/routing";
import { getOfficialChannels } from "@/lib/official-channels";

/** First grapheme of the title, used as the logo placeholder. */
function channelInitial(title: string): string {
	const [first] = Array.from(title.trim());
	return first ? first.toUpperCase() : "?";
}

type Props = {
	locale: UrlLocale;
};

/**
 * Live official channels list — server component (no client fetch, no
 * `/api/channels` call in the browser). Reads the shared server module that the
 * BFF route also serves, so the page and `GET /api/official-channels` can never
 * disagree. Labels come from the `OfficialChannels` message namespace.
 *
 * States: error (upstream failed) → error copy + bot CTA; unconfigured or empty
 * list → empty state; otherwise the list in upstream order.
 */
export default async function OfficialChannelsList({ locale }: Props) {
	const t = await getTranslations({ locale, namespace: "OfficialChannels" });
	const tShell = await getTranslations({ locale, namespace: "Shell" });
	const { items, mode } = await getOfficialChannels();

	return (
		<section
			aria-labelledby="official-channels-list-heading"
			data-mode={mode}
			className="mx-auto w-full max-w-2xl text-left"
		>
			<h2
				id="official-channels-list-heading"
				className="mb-4 text-2xl font-semibold"
			>
				{t("listHeading")}
			</h2>

			{mode === "error" ? (
				<div className="rounded-2xl bg-hero-background p-6">
					<h3 className="mb-2 text-xl font-semibold">{t("errorTitle")}</h3>
					<p className="mb-4 text-base text-foreground-accent">
						{t("errorBody")}
					</p>
					<a
						href={siteDetails.botUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-black bg-primary hover:bg-primary-accent inline-block rounded-full px-6 py-2 transition-colors"
					>
						{tShell("cta")}
					</a>
				</div>
			) : items.length === 0 ? (
				<div className="rounded-2xl bg-hero-background p-6">
					<h3 className="mb-2 text-xl font-semibold">{t("emptyTitle")}</h3>
					<p className="text-base text-foreground-accent">{t("emptyBody")}</p>
				</div>
			) : (
				<>
					<p className="mb-3 text-sm text-foreground-accent">
						{t("count", { count: items.length })}
					</p>
					<ul className="flex flex-col gap-3">
						{items.map((item) => (
							<li
								key={item.id}
								className="flex items-center gap-4 rounded-2xl border border-black/5 p-4"
							>
								{item.logo ? (
									// eslint-disable-next-line @next/next/no-img-element -- upstream logos are arbitrary t.me hosts, not a configured next/image domain
									<img
										src={item.logo}
										alt={t("logoAlt", { title: item.title })}
										width={48}
										height={48}
										loading="lazy"
										referrerPolicy="no-referrer"
										className="h-12 w-12 rounded-full object-cover"
									/>
								) : (
									<span
										aria-hidden="true"
										className="flex h-12 w-12 items-center justify-center rounded-full bg-hero-background text-lg font-semibold text-foreground-accent"
									>
										{channelInitial(item.title)}
									</span>
								)}
								<a
									href={item.link}
									target="_blank"
									rel="noopener noreferrer"
									className="text-base font-medium text-secondary underline-offset-4 hover:underline"
								>
									{item.title}
									<span className="sr-only"> — {t("openChannel")}</span>
								</a>
							</li>
						))}
					</ul>
				</>
			)}
		</section>
	);
}
