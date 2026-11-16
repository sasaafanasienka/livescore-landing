import type { ReactNode } from "react";

import { getTranslations } from "next-intl/server";

import OfficialChannelsLoading from "@/components/OfficialChannelsLoading";
import { siteDetails } from "@/data/siteDetails";
import type { UrlLocale } from "@/i18n/routing";
import {
	cloudflareImageSrcSet,
	cloudflareImageUrl,
} from "@/lib/cf-image";
import { getOfficialChannels } from "@/lib/official-channels";

const LOGO_SIZE = 48;
const LOGO_CF = {
	width: LOGO_SIZE,
	height: LOGO_SIZE,
	fit: "cover" as const,
	format: "auto" as const,
};

/** First grapheme of the title, used as the logo placeholder. */
function channelInitial(title: string): string {
	const [first] = Array.from(title.trim());
	return first ? first.toUpperCase() : "?";
}

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
 * Streamed list/grid/degraded panel only — section heading lives outside
 * Suspense in HomeLanding (same shell-outside pattern as /official-channels).
 */
export default async function OfficialChannelsHome({ locale }: Props) {
	const t = await getTranslations({ locale, namespace: "OfficialChannels" });
	const tShell = await getTranslations({ locale, namespace: "Shell" });
	const { items, mode } = await getOfficialChannels();

	return (
		<div
			data-mode={mode}
			className="mx-auto w-full max-w-6xl text-start"
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
				<ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{items.map((item) => (
						<li key={item.id}>
							<a
								href={item.link}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={t("openChannel", { title: item.title })}
								className="flex h-full items-center gap-4 rounded-2xl border border-black/5 bg-white p-4 text-black transition-colors hover:border-black/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
							>
								{item.logo ? (
									// eslint-disable-next-line @next/next/no-img-element -- CF /cdn-cgi/image + upstream hosts
									<img
										src={cloudflareImageUrl(item.logo, LOGO_CF)}
										srcSet={cloudflareImageSrcSet(item.logo, LOGO_CF)}
										alt={t("logoAlt", { title: item.title })}
										width={LOGO_SIZE}
										height={LOGO_SIZE}
										sizes={`${LOGO_SIZE}px`}
										loading="lazy"
										decoding="async"
										referrerPolicy="no-referrer"
										className="h-12 w-12 shrink-0 rounded-full object-cover"
									/>
								) : (
									<span
										aria-hidden="true"
										className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-hero-background text-lg font-semibold text-black"
									>
										{channelInitial(item.title)}
									</span>
								)}
								<span className="text-base font-medium text-black">
									{item.title}
								</span>
							</a>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

/** Suspense fallback — list skeleton only; heading stays outside Suspense. */
export function OfficialChannelsHomeFallback({ locale }: { locale: UrlLocale }) {
	return <OfficialChannelsLoading locale={locale} />;
}
