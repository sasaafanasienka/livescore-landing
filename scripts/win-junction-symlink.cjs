const fs = require("node:fs");
const path = require("node:path");

// Windows without Developer Mode rejects symlink(). Next standalone tracing
// only needs directory links into the pnpm store, and those can be junctions.
function resolveTarget(target, dest) {
	return path.isAbsolute(target) ? target : path.resolve(path.dirname(dest), target);
}

function fallback(target, dest, callback) {
	const abs = resolveTarget(target, dest);
	fs.stat(abs, (err, stat) => {
		if (err) {
			callback(err);
			return;
		}
		if (stat.isDirectory()) {
			fs.symlink(target, dest, "junction", callback);
			return;
		}
		fs.copyFile(abs, dest, callback);
	});
}

const symlink = fs.symlink;
fs.symlink = function patchedSymlink(target, dest, type, callback) {
	if (typeof type === "function") {
		callback = type;
		type = undefined;
	}
	if (type === "junction") {
		return symlink.call(fs, target, dest, type, callback);
	}
	return symlink.call(fs, target, dest, type, (err) => {
		if (err && (err.code === "EPERM" || err.code === "EACCES")) {
			fallback(target, dest, callback);
			return;
		}
		callback(err);
	});
};

const symlinkSync = fs.symlinkSync;
fs.symlinkSync = function patchedSymlinkSync(target, dest, type) {
	if (type === "junction") {
		return symlinkSync.call(fs, target, dest, type);
	}
	try {
		return symlinkSync.call(fs, target, dest, type);
	} catch (err) {
		if (!err || (err.code !== "EPERM" && err.code !== "EACCES")) {
			throw err;
		}
		const abs = resolveTarget(target, dest);
		const stat = fs.statSync(abs);
		if (stat.isDirectory()) {
			return symlinkSync.call(fs, target, dest, "junction");
		}
		fs.copyFileSync(abs, dest);
	}
};

const symlinkAsync = fs.promises.symlink;
fs.promises.symlink = async function patchedSymlinkAsync(target, dest, type) {
	if (type === "junction") {
		return symlinkAsync.call(fs.promises, target, dest, type);
	}
	try {
		return await symlinkAsync.call(fs.promises, target, dest, type);
	} catch (err) {
		if (!err || (err.code !== "EPERM" && err.code !== "EACCES")) {
			throw err;
		}
		const abs = resolveTarget(target, dest);
		const stat = await fs.promises.stat(abs);
		if (stat.isDirectory()) {
			await symlinkAsync.call(fs.promises, target, dest, "junction");
			return;
		}
		await fs.promises.copyFile(abs, dest);
	}
};
