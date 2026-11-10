/**
 * Home longform landing matrix contract — plan-home-longform-landing.
 *
 * Covers frozen I/O matrix rows without a browser: copy shape for all six
 * locales, section composition + bot CTA, channels ok/degraded markup paths,
 * claim scan, Headless UI tabs for How-it-works, and pricing comparison table.
 *
 * Run: `pnpm check:home-landing` (or `pnpm dlx tsx scripts/contracts/home-landing.contract.ts`)
 */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
	getHomeCopy,
	homeCopyProductLocales,
	type HomeCopy,
} from "../../src/lib/home-copy";
import { MARKETING_SITEMAP } from "../../src/lib/content";
import {
	absoluteLocaleSitemapUrls,
	buildSitemapIndexXml,
	buildUrlsetXml,
	localeMarketingPageUrls,
} from "../../src/lib/seo-sitemap";
import { siteDetails } from "../../src/data/siteDetails";
import type { UrlLocale } from "../../src/i18n/routing";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const URL_LOCALES = ["ar", "en", "es", "fr", "pt", "ru"] as const satisfies readonly UrlLocale[];

const SECTION_ORDER = [
	"HomeHero",
	"HomeFeatureBand", // notifications
	"HomeFeatureBand", // mini-app
	"HowItWorksTabs",
	"PricingTabs",
	"OfficialChannelsHome",
	"FaqAccordion",
	"ClosingCta",
] as const;

let caseCount = 0;
let failureCount = 0;

async function check(name: string, run: () => Promise<void>): Promise<void> {
	caseCount += 1;
	try {
		await run();
		console.log(`OK   ${name}`);
	} catch (error) {
		failureCount += 1;
		const message = error instanceof Error ? error.message : String(error);
		console.error(`FAIL ${name}: ${message}`);
	}
}

function assertPricingFacts(copy: HomeCopy, locale: string): void {
	assert.ok(copy.pricing.rows.length >= 3, `${locale}: pricing rows`);
	const blob = [
		copy.pricing.title,
		copy.pricing.description,
		copy.pricing.freeColumn,
		copy.pricing.premiumColumn,
		...copy.pricing.rows.flatMap((row) => [row.label, row.free, row.premium]),
	].join(" ");
	assert.match(blob, /\b49\b/, `${locale}: pricing must cite 49 Stars`);
	assert.match(blob, /\b30\b/, `${locale}: pricing must cite 30 days`);
	assert.match(
		blob,
		/real[\s-]?time|tiempo\s+real|temps\s+réel|tempo\s+real|реального\s+времени|الوقت\s+الفعلي/i,
		`${locale}: pricing must cite real-time alerts`,
	);
	assert.doesNotMatch(
		blob,
		/personal Premium|\bgrace\b/i,
		`${locale}: pricing must not claim personal Premium or grace jargon`,
	);
}

async function main(): Promise<void> {
	await check("happy home: all locales load full section copy", async () => {
		assert.equal(homeCopyProductLocales().length, 6);
		for (const locale of URL_LOCALES) {
			const copy = await getHomeCopy(locale);
			assert.ok(copy.hero.headline);
			assert.ok(copy.notifications.title);
			assert.ok(copy.miniApp.title);
			assert.equal(copy.howItWorks.tabs.length, 3);
			assert.deepEqual(
				copy.howItWorks.tabs.map((t) => t.id),
				["personal", "groups", "channels"],
			);
			for (const tab of copy.howItWorks.tabs) {
				assert.ok(tab.steps.length >= 2, `${locale}/${tab.id} steps`);
			}
			assertPricingFacts(copy, locale);
			assert.ok(copy.channels.title);
			assert.ok(
				copy.faq.items.length >= 8 && copy.faq.items.length <= 12,
				`${locale} FAQ count ${copy.faq.items.length}`,
			);
			assert.ok(copy.closingCta.heading);
		}
	});

	await check("happy home: page + landing section order + bot CTA", async () => {
		const page = await readFile(
			path.join(root, "src/app/[locale]/page.tsx"),
			"utf8",
		);
		assert.match(page, /HomeLanding/);
		assert.doesNotMatch(page, /MarketingMarkdownPage/);

		const landing = await readFile(
			path.join(root, "src/components/home/HomeLanding.tsx"),
			"utf8",
		);
		let cursor = 0;
		for (const name of SECTION_ORDER) {
			const idx = landing.indexOf(name, cursor);
			assert.ok(idx >= 0, `missing or out-of-order section ${name}`);
			cursor = idx + name.length;
		}
		assert.match(landing, /home-notifications\.webp/);
		assert.match(landing, /home-miniapp\.webp/);

		const cta = await readFile(
			path.join(root, "src/components/home/BotCtaLink.tsx"),
			"utf8",
		);
		assert.match(cta, /siteDetails\.botUrl/);
		assert.equal(siteDetails.botUrl, "https://t.me/LiveScoreAppBot/app");
	});

	await check("channels OK path: grid markup when items resolve", async () => {
		const source = await readFile(
			path.join(root, "src/components/home/OfficialChannelsHome.tsx"),
			"utf8",
		);
		assert.match(source, /getOfficialChannels/);
		assert.match(source, /grid-cols-1/);
		assert.match(source, /xl:grid-cols-4/);
		assert.match(source, /item\.link/);
		assert.match(source, /data-mode=\{mode\}/);
	});

	await check(
		"channels degraded: heading+description survive error/empty modes",
		async () => {
			const landing = await readFile(
				path.join(root, "src/components/home/HomeLanding.tsx"),
				"utf8",
			);
			assert.match(landing, /home-official-channels-heading/);
			assert.match(landing, /copy\.channels\.description/);
			assert.doesNotMatch(
				landing,
				/href=["']\/official-channels["']/,
				"home must not link to the standalone official-channels page",
			);
			assert.match(
				landing,
				/Suspense[\s\S]*OfficialChannelsHome/,
				"list streams under Suspense while heading stays outside",
			);

			const source = await readFile(
				path.join(root, "src/components/home/OfficialChannelsHome.tsx"),
				"utf8",
			);
			assert.match(source, /mode === "error"/);
			assert.match(source, /items\.length === 0/);
			assert.match(source, /ChannelStatePanel/);
			assert.match(source, /role="status"/);
			assert.doesNotMatch(
				source,
				/home-official-channels-heading/,
				"heading must live in HomeLanding, not the streamed panel",
			);
		},
	);

	await check("claim scan: check:home-claims passes", async () => {
		const result = spawnSync(
			process.platform === "win32" ? "pnpm.cmd" : "pnpm",
			["check:home-claims"],
			{ cwd: root, encoding: "utf8", shell: true },
		);
		assert.equal(
			result.status,
			0,
			result.stderr || result.stdout || "check:home-claims failed",
		);
	});

	await check("tab UI: How-it-works uses Headless UI; Pricing is a table", async () => {
		const how = await readFile(
			path.join(root, "src/components/home/HowItWorksTabs.tsx"),
			"utf8",
		);
		const pricing = await readFile(
			path.join(root, "src/components/home/PricingTabs.tsx"),
			"utf8",
		);
		assert.match(how, /TabGroup/, "how TabGroup");
		assert.match(how, /TabList/, "how TabList");
		assert.match(how, /TabPanel/, "how TabPanel");
		assert.match(how, /@headlessui\/react/, "how headlessui");
		assert.match(pricing, /<table/, "pricing table");
		assert.doesNotMatch(pricing, /TabGroup/, "pricing has no tabs");
	});

	await check("deleted marketing sub-routes are absent", async () => {
		const { access } = await import("node:fs/promises");
		for (const rel of [
			"src/app/[locale]/pricing/page.tsx",
			"src/app/[locale]/faq/page.tsx",
			"src/app/[locale]/guide/groups/page.tsx",
			"src/app/[locale]/guide/channels/page.tsx",
			"src/app/[locale]/official-channels/page.tsx",
			"src/app/[locale]/privacy/page.tsx",
			"src/app/[locale]/terms/page.tsx",
		]) {
			await assert.rejects(
				() => access(path.join(root, rel)),
				(err: NodeJS.ErrnoException) => err?.code === "ENOENT",
				`${rel} must be absent (single-page crawl surface)`,
			);
		}
	});

	await check("locale not-found + home page exist", async () => {
		const { access } = await import("node:fs/promises");
		await access(path.join(root, "src/app/[locale]/not-found.tsx"));
		await access(path.join(root, "src/app/[locale]/page.tsx"));
	});

	await check("home-only sitemap helpers emit lastmod + hreflang", async () => {
		assert.equal(MARKETING_SITEMAP.length, 1, "MARKETING_SITEMAP is home-only");
		assert.equal(MARKETING_SITEMAP[0]?.urlPath, "", "only home urlPath");

		assert.deepEqual(
			localeMarketingPageUrls("en"),
			["https://football-live-bot.online/en"],
			"one home loc per locale",
		);

		const xml = buildUrlsetXml("en", "2026-11-10");
		assert.match(xml, /<loc>https:\/\/football-live-bot\.online\/en<\/loc>/);
		assert.match(xml, /<lastmod>2026-11-10<\/lastmod>/);
		assert.match(xml, /xmlns:xhtml=/);
		for (const loc of ["ar", "en", "es", "fr", "pt", "ru"]) {
			assert.match(
				xml,
				new RegExp(
					`hreflang="${loc}" href="https://football-live-bot\\.online/${loc}"`,
				),
				`hreflang ${loc}`,
			);
		}
		assert.match(
			xml,
			/hreflang="x-default" href="https:\/\/football-live-bot\.online\/en"/,
		);
		assert.equal(
			(xml.match(/<url>/g) ?? []).length,
			1,
			"exactly one <url> in locale sitemap",
		);

		const indexXml = buildSitemapIndexXml(absoluteLocaleSitemapUrls());
		assert.equal(
			(indexXml.match(/<sitemap>/g) ?? []).length,
			6,
			"sitemap index lists six locale sitemaps",
		);
		for (const loc of ["ar", "en", "es", "fr", "pt", "ru"]) {
			assert.match(
				indexXml,
				new RegExp(
					`<loc>https://football-live-bot\\.online/sitemaps/${loc}\\.xml</loc>`,
				),
			);
		}
	});

	console.log(`\n${caseCount - failureCount}/${caseCount} passed`);
	if (failureCount > 0) {
		process.exit(1);
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
