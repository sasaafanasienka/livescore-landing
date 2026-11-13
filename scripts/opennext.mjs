import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(
	root,
	"node_modules",
	"@opennextjs",
	"cloudflare",
	"dist",
	"cli",
	"index.js",
);

const env = { ...process.env };
if (process.platform === "win32") {
	const preload = path.join(root, "scripts", "win-junction-symlink.cjs").replaceAll("\\", "/");
	const kept = (env.NODE_OPTIONS ?? "").replace(/--require(?:=|\s+)\S+/g, "").trim();
	env.NODE_OPTIONS = [kept, `--require=${preload}`].filter(Boolean).join(" ");
}

const result = spawnSync(process.execPath, [cli, ...process.argv.slice(2)], {
	cwd: root,
	env,
	stdio: "inherit",
});

if ((result.status ?? 1) !== 0) {
	process.exit(result.status ?? 1);
}

// OpenNext's on-disk patch never reaches the copy of next-server.js that esbuild
// bundles on Windows (pnpm hardlink). The Cloudflare content patch empties
// loadNodeMiddleware but leaves getMiddlewareManifest, which then dynamic-requires
// `/.next/server/middleware-manifest.json` and 500s. Middleware already ran in the worker.
if (process.argv[2] === "build") {
	const handlerPath = path.join(root, ".open-next", "server-functions", "default", "handler.mjs");
	const before = readFileSync(handlerPath, "utf8");
	const after = before.replaceAll(
		"getMiddlewareManifest(){return this.minimalMode?null:require(this.middlewareManifestPath)}",
		"getMiddlewareManifest(){return null}",
	);
	if (after === before) {
		console.error("opennext: getMiddlewareManifest patch did not match handler.mjs");
		process.exit(1);
	}
	writeFileSync(handlerPath, after);
}

process.exit(0);
