/**
 * Home longform landing matrix contract — plan-home-longform-landing.
 *
 * Covers frozen I/O matrix rows without a browser: copy shape for all six
 * locales, section composition + bot CTA, channels ok/degraded markup paths,
 * claim scan, and Headless UI tab wiring for How-it-works + Pricing.
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
	const personalBlob = [
		copy.pricing.personal.title,
		copy.pricing.personal.body,
		...copy.pricing.personal.points,
	].join(" ");
	assert.match(
		personalBlob,
		/free|gratis|gratuit|бесплат|مجاني|ilimitad|unlimited|без лимит|بدون حدود/i,
		`${locale}: personal panel must state free/unlimited`,
	);
	assert.doesNotMatch(
		personalBlob,
		/\b49\b/,
		`${locale}: personal panel must not quote Chat Premium Stars price`,
	);

	const chatsBlob = [
		copy.pricing.chats.title,
		copy.pricing.chats.body,
		...copy.pricing.chats.points,
	].join(" ");
	assert.match(chatsBlob, /\b49\b/, `${locale}: chats panel must cite 49 Stars`);
	assert.match(chatsBlob, /\b30\b/, `${locale}: chats panel must cite 30 days`);
	assert.match(
		chatsBlob,
		/\b24\b/,
		`${locale}: chats panel must cite 24h grace`,
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
		assert.equal(siteDetails.botUrl, "https://t.me/LiveScoreAppBot");
	});

	await check("channels OK path: carousel markup when items resolve", async () => {
		const source = await readFile(
			path.join(root, "src/components/home/OfficialChannelsHome.tsx"),
			"utf8",
		);
		assert.match(source, /getOfficialChannels/);
		assert.match(source, /overflow-x-auto/);
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
			assert.match(landing, /copy\.channels\.seeAll/);
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

	await check("tab UI: How-it-works + Pricing use Headless UI tabs", async () => {
		const how = await readFile(
			path.join(root, "src/components/home/HowItWorksTabs.tsx"),
			"utf8",
		);
		const pricing = await readFile(
			path.join(root, "src/components/home/PricingTabs.tsx"),
			"utf8",
		);
		for (const [label, source] of [
			["how", how],
			["pricing", pricing],
		] as const) {
			assert.match(source, /TabGroup/, `${label} TabGroup`);
			assert.match(source, /TabList/, `${label} TabList`);
			assert.match(source, /TabPanel/, `${label} TabPanel`);
			assert.match(source, /@headlessui\/react/, `${label} headlessui`);
		}
	});

	await check("dedicated pricing + faq routes still present", async () => {
		for (const rel of [
			"src/app/[locale]/pricing/page.tsx",
			"src/app/[locale]/faq/page.tsx",
		]) {
			const text = await readFile(path.join(root, rel), "utf8");
			assert.match(text, /MarketingMarkdownPage/);
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
