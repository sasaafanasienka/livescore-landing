import { getOfficialChannels } from "@/lib/official-channels";

/**
 * Public BFF for the official channels list (epic-official-channels).
 *
 * Anonymous by design: no auth, no cookies, no `initData`. Always HTTP 200 —
 * degraded upstream states travel in `mode`, so the page and any consumer can
 * render an empty/error state instead of handling transport failures.
 *
 * `force-dynamic`: `mode` comes from runtime env, so the response must not be
 * baked into a build artifact. Freshness of the upstream read is the fetch
 * data cache in `src/lib/official-channels.ts` (`OFFICIAL_CHANNELS_REVALIDATE`).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
	const { items, mode } = await getOfficialChannels();

	return Response.json({ data: { items }, mode });
}
