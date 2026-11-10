import { getTranslations } from "next-intl/server";

import type { UrlLocale } from "@/i18n/routing";

type Props = {
	locale: UrlLocale;
};

/**
 * `Suspense` fallback for the live list — server component, so the loading
 * state never adds a client fetch. The visible skeleton is decorative and
 * `aria-hidden`; screen readers get the localized `loading` label through a
 * polite live region instead of a pile of placeholder boxes.
 *
 * Deliberately carries no `data-mode`: the mode is only known once the list
 * resolves, and claiming one here would report a state the request has not
 * reached yet.
 */
export default async function OfficialChannelsLoading({ locale }: Props) {
	const t = await getTranslations({ locale, namespace: "OfficialChannels" });

	return (
		<div
			role="status"
			aria-live="polite"
			className="mx-auto w-full max-w-2xl text-start"
		>
			<span className="sr-only">{t("loading")}</span>
			<div
				aria-hidden="true"
				className="flex flex-col gap-3 motion-safe:animate-pulse"
			>
				{[0, 1, 2].map((row) => (
					<div
						key={row}
						className="flex items-center gap-4 rounded-2xl border border-black/5 p-4"
					>
						<div className="h-12 w-12 shrink-0 rounded-full bg-hero-background" />
						<div className="h-4 w-1/2 rounded-full bg-hero-background" />
					</div>
				))}
			</div>
		</div>
	);
}
