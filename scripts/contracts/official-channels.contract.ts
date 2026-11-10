/**
 * Executable upstream contract test — epic-official-channels, story 4.2.
 *
 * Pins the recorded public contract
 * (`GET /api/public/channels` → `{ data: { items: [{ id, title, logo, link }] } }`,
 * `id` numeric from the product's DB, `logo` nullable, `link` a `https://t.me/...`
 * URL) against a local HTTP stub on 127.0.0.1:4399, and proves every degraded
 * mode of the landing adapter (`mode: "error"` / `"unconfigured"`).
 *
 * No test framework and no new dependencies: `node:assert` + a `node:http`
 * stub, run with `pnpm dlx tsx scripts/contracts/official-channels.contract.ts`
 * (or `pnpm check:official-channels`). Exits non-zero when any case fails.
 */

import assert from "node:assert/strict";
import { createServer, type Server, type ServerResponse } from "node:http";

import {
	getOfficialChannels,
	normalizeOfficialChannels,
	type OfficialChannel,
} from "../../src/lib/official-channels";

const STUB_HOST = "127.0.0.1";
const STUB_PORT = 4399;
const STUB_URL = `http://${STUB_HOST}:${STUB_PORT}/api/public/channels`;

/** Upstream behaviors the stub can play; the adapter must survive all of them. */
type StubBehavior = "ok" | "server-error" | "broken-json" | "wrong-shape" | "hang";

let behavior: StubBehavior = "ok";
let body: unknown = { data: { items: [] } };

/** Responses the stub deliberately never answers (the timeout case). */
const hangingResponses = new Set<ServerResponse>();

const server: Server = createServer((_request, response) => {
	if (behavior === "hang") {
		hangingResponses.add(response);
		return;
	}

	if (behavior === "server-error") {
		response.writeHead(500, { "content-type": "application/json" });
		response.end(JSON.stringify({ error: { message: "Failed to load channels" } }));
		return;
	}

	if (behavior === "broken-json") {
		response.writeHead(200, { "content-type": "application/json" });
		response.end('{"data": {"items": [');
		return;
	}

	response.writeHead(200, { "content-type": "application/json" });
	response.end(JSON.stringify(body));
});

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

/** `url: null` means "no configured upstream"; the fixture flag is never set. */
function configureUpstream(url: string | null): void {
	delete process.env.OFFICIAL_CHANNELS_FIXTURE;

	if (url === null) {
		delete process.env.OFFICIAL_CHANNELS_API_URL;
		return;
	}

	process.env.OFFICIAL_CHANNELS_API_URL = url;
}

/** Serves `payload` as the contract body and switches the stub to the happy path. */
function servePayload(payload: unknown): void {
	behavior = "ok";
	body = payload;
}

function listen(): Promise<void> {
	return new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(STUB_PORT, STUB_HOST, () => {
			server.removeListener("error", reject);
			resolve();
		});
	});
}

async function closeStub(): Promise<void> {
	for (const response of Array.from(hangingResponses)) {
		response.destroy();
	}
	hangingResponses.clear();

	const closed = new Promise<void>((resolve) => {
		server.close(() => resolve());
	});
	server.closeAllConnections();
	await closed;
}

/** Numeric ids are what `listOwnerChannels` really returns (`channels.id`). */
const NUMERIC_ID_PAYLOAD = {
	data: {
		items: [
			{
				id: 7,
				title: "Alpha League",
				logo: "https://cdn.example.test/alpha.png",
				link: "https://t.me/alpha_league",
			},
			{ id: 3, title: "Beta Cup", logo: null, link: "https://t.me/beta_cup" },
			{
				id: 11,
				title: "Gamma Football",
				logo: "not-a-url",
				link: "https://t.me/gamma_football",
			},
		],
	},
};

const NUMERIC_ID_EXPECTED: OfficialChannel[] = [
	{
		id: "7",
		title: "Alpha League",
		logo: "https://cdn.example.test/alpha.png",
		link: "https://t.me/alpha_league",
	},
	{ id: "3", title: "Beta Cup", logo: null, link: "https://t.me/beta_cup" },
	{ id: "11", title: "Gamma Football", logo: null, link: "https://t.me/gamma_football" },
];

const JUNK_ROWS_PAYLOAD = {
	data: {
		items: [
			{
				id: "42",
				title: "String Id Channel",
				logo: null,
				link: "https://t.me/string_id",
			},
			{ id: 8, title: "", logo: null, link: "https://t.me/no_title" },
			{ id: 9, title: "Script link", logo: null, link: "javascript:alert(1)" },
			{ id: null, title: "Null id", logo: null, link: "https://t.me/null_id" },
			{ title: "Missing id", logo: null, link: "https://t.me/missing_id" },
			{ id: 10, title: "Missing link", logo: null },
			"not-an-object",
			null,
		],
	},
};

/** Shape checks shared by both live cases. */
function assertChannelShape(items: OfficialChannel[]): void {
	for (const item of items) {
		assert.deepEqual(Object.keys(item).sort(), ["id", "link", "logo", "title"]);
		assert.equal(typeof item.id, "string");
		assert.ok(item.id.length > 0);
		assert.equal(typeof item.title, "string");
		assert.ok(item.title.length > 0);
		assert.ok(item.logo === null || typeof item.logo === "string");
		assert.match(item.link, /^https:\/\/t\.me\//);
	}
}

async function main(): Promise<void> {
	console.log(`stub upstream: ${STUB_URL}`);
	await listen();

	try {
		await check("unconfigured: no OFFICIAL_CHANNELS_API_URL → empty list, no network", async () => {
			configureUpstream(null);
			const result = await getOfficialChannels();
			assert.deepEqual(result, { items: [], mode: "unconfigured" });
		});

		await check("live: numeric upstream ids become strings, order kept, logo nullable", async () => {
			configureUpstream(STUB_URL);
			servePayload(NUMERIC_ID_PAYLOAD);

			const result = await getOfficialChannels();
			assert.equal(result.mode, "live");
			assert.deepEqual(result.items, NUMERIC_ID_EXPECTED);
			assertChannelShape(result.items);
			assert.deepEqual(
				result.items.map((item) => item.id),
				["7", "3", "11"],
			);
			assert.equal(result.items[1].logo, null);
			assert.equal(result.items[2].logo, null);
		});

		await check("live: string ids still work, invalid rows dropped, order kept", async () => {
			configureUpstream(STUB_URL);
			servePayload(JUNK_ROWS_PAYLOAD);

			const result = await getOfficialChannels();
			assert.equal(result.mode, "live");
			assert.deepEqual(result.items, [
				{
					id: "42",
					title: "String Id Channel",
					logo: null,
					link: "https://t.me/string_id",
				},
			]);
			assertChannelShape(result.items);
			assert.deepEqual(normalizeOfficialChannels(JUNK_ROWS_PAYLOAD), result.items);
		});

		await check("error: upstream HTTP 500", async () => {
			configureUpstream(STUB_URL);
			behavior = "server-error";

			const startedAt = Date.now();
			const result = await getOfficialChannels();
			const elapsed = Date.now() - startedAt;

			assert.deepEqual(result, { items: [], mode: "error" });
			assert.ok(elapsed < 6000, `answered in ${elapsed} ms, expected < 6000 ms`);
		});

		await check("error: broken JSON body", async () => {
			configureUpstream(STUB_URL);
			behavior = "broken-json";

			const result = await getOfficialChannels();
			assert.deepEqual(result, { items: [], mode: "error" });
		});

		await check("error: wrong payload shape (no data / items not an array)", async () => {
			configureUpstream(STUB_URL);

			for (const payload of [{ items: [] }, { data: { items: "nope" } }, { data: null }, []]) {
				servePayload(payload);
				assert.equal(
					normalizeOfficialChannels(payload),
					null,
					`payload ${JSON.stringify(payload)} must not normalize`,
				);
				const result = await getOfficialChannels();
				assert.deepEqual(result, { items: [], mode: "error" });
			}
		});

		await check("error: upstream hangs past the 5 s timeout", async () => {
			configureUpstream(STUB_URL);
			behavior = "hang";

			const startedAt = Date.now();
			const result = await getOfficialChannels();
			const elapsed = Date.now() - startedAt;

			assert.deepEqual(result, { items: [], mode: "error" });
			assert.ok(elapsed >= 4500, `gave up after ${elapsed} ms, expected the ~5 s timeout`);
			assert.ok(elapsed < 8000, `took ${elapsed} ms, expected < 8000 ms`);
		});

		await check("unconfigured: env removed again → no stale live state", async () => {
			configureUpstream(null);
			const result = await getOfficialChannels();
			assert.deepEqual(result, { items: [], mode: "unconfigured" });
		});
	} finally {
		configureUpstream(null);
		await closeStub();
	}

	console.log(`\n${caseCount - failureCount}/${caseCount} cases OK, ${failureCount} failed`);
	process.exitCode = failureCount === 0 ? 0 : 1;
}

main().catch((error: unknown) => {
	const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
	console.error(`FAIL contract run aborted: ${message}`);
	process.exitCode = 1;
});
