/**
 * Claim gate for longform home copy — fails if banned marketing tokens appear
 * in home structured copy, home components, or shell messages.
 *
 * Patterns mirror plan Verification + review gate:
 * prediction | Discord | player-follow | personal Premium | highlights cron
 * | live highlights pipeline (and close equivalents)
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const BANNED = [
	{ id: "prediction", re: /prediction/i },
	{ id: "Discord", re: /\bDiscord\b/i },
	{ id: "player-follow", re: /player[-\s]?follow/i },
	{ id: "personal Premium", re: /personal\s+Premium/i },
	{ id: "highlights cron", re: /highlights?\s+cron/i },
	{
		id: "live highlights pipeline",
		re: /live\s+highlights?\s+pipeline|live\s+scheduled\s+highlights?|automatic\s+highlight\s+delivery/i,
	},
];

const SCAN_ROOTS = [
	path.join(root, "content", "home"),
	path.join(root, "src", "components", "home"),
	path.join(root, "messages"),
];

async function collectFiles(dir) {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await collectFiles(full)));
			continue;
		}
		if (/\.(json|ts|tsx|md|mjs|js)$/i.test(entry.name)) {
			files.push(full);
		}
	}
	return files;
}

const hits = [];

for (const scanRoot of SCAN_ROOTS) {
	const files = await collectFiles(scanRoot);
	for (const file of files) {
		const text = await readFile(file, "utf8");
		for (const rule of BANNED) {
			if (rule.re.test(text)) {
				hits.push(`${path.relative(root, file)} → ${rule.id}`);
			}
		}
	}
}

if (hits.length > 0) {
	console.error("Banned claim tokens found:");
	for (const hit of hits) {
		console.error(`  - ${hit}`);
	}
	process.exit(1);
}

console.log("check:home-claims OK — no banned claim tokens in home surfaces");
