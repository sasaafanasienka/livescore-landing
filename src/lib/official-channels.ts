/**
 * Official channels — public contract + upstream adapter (epic-official-channels).
 *
 * Shared by the BFF route (`src/app/api/official-channels/route.ts`) and the
 * `/{locale}/official-channels` page so both read the same source of truth.
 * Server-only: never import from a client component (env reads, no secrets).
 *
 * Shape mirrors the product's owner-channels list
 * (`{ data: { items: [{ id, title, logo, link }] } }`), served by the landing
 * BFF as `{ data: { items }, mode }`. The Mini-App-authed `GET /api/channels`
 * is never called from this repo.
 */

/** One official (app-owner) Telegram channel. `logo` is nullable upstream. */
export type OfficialChannel = {
	id: string;
	title: string;
	logo: string | null;
	link: string;
};

/**
 * `live` — upstream answered and parsed; `fixture` — explicit dev switch;
 * `unconfigured` — no upstream URL (no network call); `error` — upstream
 * failed (non-200, timeout, malformed payload). Degraded states never throw.
 */
export type OfficialChannelsMode = "live" | "fixture" | "unconfigured" | "error";

export type OfficialChannelsResult = {
	items: OfficialChannel[];
	mode: OfficialChannelsMode;
};

/** Next data-cache tag for on-demand revalidation of the upstream fetch. */
const OFFICIAL_CHANNELS_TAG = "official-channels";

const DEFAULT_REVALIDATE_SECONDS = 300;
const MAX_REVALIDATE_SECONDS = 86_400;
const FETCH_TIMEOUT_MS = 5_000;

/**
 * Fixture data — test/contract data only, never a source of truth for channels.
 * `logo: null` on purpose so fixture renders exercise the initials placeholder.
 */
const FIXTURE_ITEMS: readonly OfficialChannel[] = [
	{
		id: "fixture-1",
		title: "Fixture League One",
		logo: null,
		link: "https://t.me/fixture_league_one",
	},
	{
		id: "fixture-2",
		title: "Fixture League Two",
		logo: null,
		link: "https://t.me/fixture_league_two",
	},
	{
		id: "fixture-3",
		title: "Fixture Cup",
		logo: null,
		link: "https://t.me/fixture_cup",
	},
];

/** `OFFICIAL_CHANNELS_REVALIDATE` in seconds; safe parse, default 300. */
function officialChannelsRevalidateSeconds(): number {
	const raw = process.env.OFFICIAL_CHANNELS_REVALIDATE?.trim();
	if (!raw) {
		return DEFAULT_REVALIDATE_SECONDS;
	}

	const parsed = Number.parseInt(raw, 10);
	if (!Number.isFinite(parsed) || parsed < 0) {
		return DEFAULT_REVALIDATE_SECONDS;
	}

	return Math.min(parsed, MAX_REVALIDATE_SECONDS);
}

/**
 * Fixture mode requires the exact flag `1`. It never wins over a configured
 * upstream: with `OFFICIAL_CHANNELS_API_URL` set the live path always runs, so
 * fixture data cannot shadow real channel data in a production deploy.
 */
function officialChannelsFixtureEnabled(): boolean {
	if (process.env.OFFICIAL_CHANNELS_FIXTURE?.trim() !== "1") {
		return false;
	}

	return !process.env.OFFICIAL_CHANNELS_API_URL?.trim();
}

function isHttpUrl(value: string): boolean {
	return /^https?:\/\//i.test(value);
}

/** Absolute http(s) origin for relative upstream logos (`/uploads/...`). */
function officialChannelsAssetOrigin(): string {
	const raw = process.env.OFFICIAL_CHANNELS_ASSET_ORIGIN?.trim();
	if (raw && isHttpUrl(raw)) {
		return raw.replace(/\/+$/, "");
	}

	const apiUrl = process.env.OFFICIAL_CHANNELS_API_URL?.trim();
	if (!apiUrl) {
		return "";
	}

	try {
		return new URL(apiUrl).origin;
	} catch {
		return "";
	}
}

/** Keep absolute logos; prefix relative `/…` paths with the asset origin. */
function resolveLogoUrl(logo: string, assetOrigin: string): string | null {
	if (!logo) {
		return null;
	}

	if (isHttpUrl(logo)) {
		return logo;
	}

	if (logo.startsWith("/") && assetOrigin) {
		return `${assetOrigin}${logo}`;
	}

	return null;
}

function readText(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

/**
 * Upstream `id` is the product's DB id (`channels.id`), so it arrives as a
 * number: `OwnerChannelItem.id: number` in `packages/core`. The landing only
 * needs a stable string key, so both forms are accepted and coerced here —
 * a numeric-only contract would otherwise drop every real row.
 */
function readId(value: unknown): string {
	if (typeof value === "string") {
		return value.trim();
	}

	if (typeof value === "number" && Number.isFinite(value)) {
		return String(value);
	}

	return "";
}

/**
 * Normalizes the upstream payload to `OfficialChannel[]`.
 * Drops rows without a usable `id` (non-empty string or finite number, coerced
 * to string) and non-empty string `title`/`link` (and non-http(s) links), keeps
 * upstream order (no local sorting), `logo` → `null` when absent or not an
 * http(s) URL. Returns `null` when the payload shape is not the contract's
 * `{ data: { items: [...] } }`.
 */
export function normalizeOfficialChannels(
	payload: unknown,
	assetOrigin = officialChannelsAssetOrigin(),
): OfficialChannel[] | null {
	if (typeof payload !== "object" || payload === null) {
		return null;
	}

	const data = (payload as { data?: unknown }).data;
	if (typeof data !== "object" || data === null) {
		return null;
	}

	const items = (data as { items?: unknown }).items;
	if (!Array.isArray(items)) {
		return null;
	}

	const normalized: OfficialChannel[] = [];

	for (const item of items) {
		if (typeof item !== "object" || item === null) {
			continue;
		}

		const record = item as Record<string, unknown>;
		const id = readId(record.id);
		const title = readText(record.title);
		const link = readText(record.link);

		if (!id || !title || !link || !isHttpUrl(link)) {
			continue;
		}

		normalized.push({
			id,
			title,
			logo: resolveLogoUrl(readText(record.logo), assetOrigin),
			link,
		});
	}

	return normalized;
}

/**
 * Degraded result: empty list with the reason in `mode`. Degradation is a
 * payload state, never a throw and never a non-200 — both callers (the BFF and
 * the page) render it, so it is built in one place.
 */
function emptyResult(
	mode: Extract<OfficialChannelsMode, "unconfigured" | "error">,
): OfficialChannelsResult {
	return { items: [], mode };
}

/**
 * Reads the official channels list for the public marketing site.
 * Never throws: every upstream failure degrades to `mode: "error"` with an
 * empty list, and nothing about the failure (URL, stack) leaves this module.
 */
export async function getOfficialChannels(): Promise<OfficialChannelsResult> {
	if (officialChannelsFixtureEnabled()) {
		return { items: [...FIXTURE_ITEMS], mode: "fixture" };
	}

	const url = process.env.OFFICIAL_CHANNELS_API_URL?.trim();
	if (!url) {
		return emptyResult("unconfigured");
	}

	try {
		const response = await fetch(url, {
			headers: { accept: "application/json" },
			// Cached upstream read: the list refreshes without a content commit
			// or deploy, and stays invalidatable through the `official-channels` tag.
			next: {
				revalidate: officialChannelsRevalidateSeconds(),
				tags: [OFFICIAL_CHANNELS_TAG],
			},
			signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
		});

		if (!response.ok) {
			return emptyResult("error");
		}

		const items = normalizeOfficialChannels(await response.json());
		if (!items) {
			return emptyResult("error");
		}

		return { items, mode: "live" };
	} catch {
		return emptyResult("error");
	}
}
