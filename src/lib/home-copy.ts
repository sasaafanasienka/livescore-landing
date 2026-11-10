import { readFile } from "node:fs/promises";
import path from "node:path";

import {
	type ProductLocale,
	type UrlLocale,
	toProductLocale,
} from "@/i18n/routing";
import { typografDeep } from "@/lib/typograf";

export type HomeFaqItem = {
	question: string;
	answer: string;
};

export type HomeHowTab = {
	id: "personal" | "groups" | "channels";
	label: string;
	steps: string[];
};

export type HomePricingRow = {
	label: string;
	free: string;
	premium: string;
};

export type HomeCopy = {
	hero: {
		headline: string;
		subhead: string;
	};
	notifications: {
		title: string;
		description: string;
		bullets: string[];
		imageAlt: string;
	};
	miniApp: {
		title: string;
		description: string;
		bullets: string[];
		imageAlt: string;
	};
	howItWorks: {
		title: string;
		description: string;
		tabs: HomeHowTab[];
	};
	pricing: {
		title: string;
		description: string;
		moreLink: string;
		freeColumn: string;
		premiumColumn: string;
		rows: HomePricingRow[];
	};
	channels: {
		title: string;
		description: string;
		seeAll: string;
	};
	faq: {
		title: string;
		description: string;
		moreLink: string;
		items: HomeFaqItem[];
	};
	closingCta: {
		heading: string;
		subheading: string;
	};
};

const PRODUCT_LOCALES = [
	"ar",
	"en",
	"es",
	"fr",
	"pt-BR",
	"ru",
] as const satisfies readonly ProductLocale[];

function assertHomeCopy(value: unknown, locale: ProductLocale): HomeCopy {
	if (!value || typeof value !== "object") {
		throw new Error(`Invalid home copy for ${locale}`);
	}

	const copy = value as HomeCopy;
	if (
		!copy.hero?.headline ||
		!copy.notifications?.title ||
		!copy.miniApp?.title ||
		!copy.howItWorks?.tabs?.length ||
		!copy.pricing?.rows?.length ||
		!copy.pricing?.freeColumn ||
		!copy.pricing?.premiumColumn ||
		!copy.channels?.title ||
		!copy.faq?.items?.length ||
		!copy.closingCta?.heading
	) {
		throw new Error(`Incomplete home copy for ${locale}`);
	}

	return copy;
}

/** Loads structured longform home copy for a URL locale. */
export async function getHomeCopy(urlLocale: UrlLocale): Promise<HomeCopy> {
	const productLocale = toProductLocale(urlLocale);
	const filePath = path.join(
		process.cwd(),
		"content",
		"home",
		`${productLocale}.json`,
	);
	const raw = await readFile(filePath, "utf8");
	const copy = assertHomeCopy(JSON.parse(raw) as unknown, productLocale);
	return typografDeep(copy, urlLocale);
}

export function homeCopyProductLocales(): readonly ProductLocale[] {
	return PRODUCT_LOCALES;
}
