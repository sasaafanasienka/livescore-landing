import type { ReactNode } from "react";

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

/** Visible focus ring for the in-list links: works in both writing directions. */
const LINK_CLASSES =
	"rounded text-base font-medium text-secondary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

/** Visible focus ring for the error-state bot CTA. */
const CTA_CLASSES =
	"text-black bg-primary hover:bg-primary-accent inline-block rounded-full px-6 py-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

/** Shared surface and body type for the two degraded states (error / empty). */
const PANEL_CLASSES = "rounded-2xl bg-hero-background p-6";
const PANEL_BODY_CLASSES = "text-base text-foreground-accent";

type StatePanelProps = {
	title: string;
	body: string;
	/** Optional action rendered under the body (the error-state bot CTA). */
	children?: ReactNode;
};

/**
 * Degraded list state as a polite live region — the same frame for the error and
 * the empty state, so both modes stay visually and semantically identical.
 */
function ChannelStatePanel({ title, body, children }: StatePanelProps) {
	return (
		<div role="status" aria-live="polite" className={PANEL_CLASSES}>
			<h3 className="mb-2 text-xl font-semibold">{title}</h3>
			<p
				className={
					children ? `${PANEL_BODY_CLASSES} mb-4` : PANEL_BODY_CLASSES
				}
			>
				{body}
			</p>
			{children}
		</div>
	);
}

/**
 * Live official channels list — server component (no client fetch, no
 * `/api/channels` call in the browser). Reads the shared server module that the
 * BFF route also serves, so the page and `GET /api/official-channels` can never
 * disagree. Labels come from the `OfficialChannels` message namespace and exist
 * in all six URL locales.
 *
 * States: error (upstream failed) → error copy + bot CTA; unconfigured or empty
 * list → empty state; otherwise the list in upstream order. Both degraded states
 * are polite live regions so an assistive technology announces the state change.
 *
 * Direction-agnostic on purpose: Tailwind logical utilities (`text-start`) plus
 * flex `gap` keep `ar` (RTL) identical to `en` in mirror image — no
 * `ml/mr/pl/pr/text-left` anywhere.
 */
export default async function OfficialChannelsList({ locale }: Props) {
	const t = await getTranslations({ locale, namespace: "OfficialChannels" });
	const tShell = await getTranslations({ locale, namespace: "Shell" });
	const { items, mode } = await getOfficialChannels();

	return (
		<section
			aria-labelledby="official-channels-list-heading"
			data-mode={mode}
			className="mx-auto w-full max-w-2xl text-start"
		>
			<h2
				id="official-channels-list-heading"
				className="mb-4 text-2xl font-semibold"
			>
				{t("listHeading")}
			</h2>

			{mode === "error" ? (
				<ChannelStatePanel title={t("errorTitle")} body={t("errorBody")}>
					<a
						href={siteDetails.botUrl}
						target="_blank"
						rel="noopener noreferrer"
						className={CTA_CLASSES}
					>
						{tShell("cta")}
					</a>
				</ChannelStatePanel>
			) : items.length === 0 ? (
				<ChannelStatePanel title={t("emptyTitle")} body={t("emptyBody")} />
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
										className="h-12 w-12 shrink-0 rounded-full object-cover"
									/>
								) : (
									<span
										aria-hidden="true"
										className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-hero-background text-lg font-semibold text-foreground-accent"
									>
										{channelInitial(item.title)}
									</span>
								)}
								<a
									href={item.link}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={t("openChannel", { title: item.title })}
									className={LINK_CLASSES}
								>
									{item.title}
								</a>
							</li>
						))}
					</ul>
				</>
			)}
		</section>
	);
}
