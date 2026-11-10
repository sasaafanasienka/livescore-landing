import type { ReactNode } from "react";

import { getTranslations } from "next-intl/server";

import OfficialChannelsLoading from "@/components/OfficialChannelsLoading";
import { siteDetails } from "@/data/siteDetails";
import type { UrlLocale } from "@/i18n/routing";
import { getOfficialChannels } from "@/lib/official-channels";

/** First grapheme of the title, used as the logo placeholder. */
function channelInitial(title: string): string {
	const [first] = Array.from(title.trim());
	return first ? first.toUpperCase() : "?";
}

const LINK_CLASSES =
	"rounded text-base font-medium text-secondary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

const CTA_CLASSES =
	"text-black bg-primary hover:bg-primary-accent inline-block rounded-full px-6 py-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

const PANEL_CLASSES = "rounded-2xl bg-white p-6";
const PANEL_BODY_CLASSES = "text-base text-foreground-accent";

type StatePanelProps = {
	title: string;
	body: string;
	children?: ReactNode;
};

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

type Props = {
	locale: UrlLocale;
};

/**
 * Streamed list/carousel/degraded panel only — section heading lives outside
 * Suspense in HomeLanding (same shell-outside pattern as /official-channels).
 */
export default async function OfficialChannelsHome({ locale }: Props) {
	const t = await getTranslations({ locale, namespace: "OfficialChannels" });
	const tShell = await getTranslations({ locale, namespace: "Shell" });
	const { items, mode } = await getOfficialChannels();

	return (
		<div
			data-mode={mode}
			className="mx-auto w-full max-w-5xl text-start"
		>
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
					<ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
						{items.map((item) => (
							<li
								key={item.id}
								className="flex w-64 shrink-0 snap-start items-center gap-4 rounded-2xl border border-black/5 bg-white p-4"
							>
								{item.logo ? (
									// eslint-disable-next-line @next/next/no-img-element -- upstream logos are arbitrary t.me hosts
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
		</div>
	);
}

/** Suspense fallback — list skeleton only; heading stays outside Suspense. */
export function OfficialChannelsHomeFallback({ locale }: { locale: UrlLocale }) {
	return <OfficialChannelsLoading locale={locale} />;
}
