// One-click local launcher: runs the fast production build on http://localhost:3001
// and opens it in the default browser. Rebuilds only when the code has changed.
// Usage: double-click "Start Placement Coach.bat", or run `npm run local`.

import { spawn, spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const PORT = 3001;
const URL = `http://localhost:${PORT}`;
const root = join(import.meta.dirname, "..");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

/** Newest modification time of any file under the given paths. */
function newestChange(paths) {
  let newest = 0;
  const visit = (path) => {
    if (!existsSync(path)) return;
    const stat = statSync(path);
    if (stat.isDirectory()) readdirSync(path).forEach((name) => visit(join(path, name)));
    else newest = Math.max(newest, stat.mtimeMs);
  };
  paths.forEach((p) => visit(join(root, p)));
  return newest;
}

async function isRunning() {
  try {
    await fetch(URL, { signal: AbortSignal.timeout(1000), redirect: "manual" });
    return true;
  } catch {
    return false;
  }
}

function openBrowser() {
  const [cmd, args] =
    process.platform === "win32" ? ["cmd", ["/c", "start", "", URL]] : [process.platform === "darwin" ? "open" : "xdg-open", [URL]];
  spawn(cmd, args, { stdio: "ignore", detached: true }).unref();
}

/** Stops whatever is serving the port (an older copy of this app). */
function stopRunningServer() {
  if (process.platform === "win32") {
    const out = spawnSync("netstat", ["-ano"], { encoding: "utf8" }).stdout ?? "";
    const pids = new Set(
      out
        .split(/\r?\n/)
        .filter((line) => line.includes(`:${PORT} `) && /LISTENING/.test(line))
        .map((line) => line.trim().split(/\s+/).at(-1)),
    );
    pids.forEach((pid) => spawnSync("taskkill", ["/PID", pid, "/T", "/F"], { stdio: "ignore" }));
  } else {
    spawnSync("sh", ["-c", `lsof -ti tcp:${PORT} | xargs kill`], { stdio: "ignore" });
  }
}

const buildId = join(root, ".next", "BUILD_ID");
const builtAt = existsSync(buildId) ? statSync(buildId).mtimeMs : 0;
const changedAt = newestChange(["src", "public", "package.json", "next.config.ts", ".env.local"]);
const stale = changedAt > builtAt;

if (await isRunning()) {
  if (!stale) {
    console.log(`Placement Coach is already running at ${URL}`);
    openBrowser();
    process.exit(0);
  }
  console.log("An older version of the app is running — stopping it to update...");
  stopRunningServer();
}

if (stale) {
  console.log("Code has changed since the last build — building (about a minute)...");
  const build = spawnSync(npm, ["run", "build"], { cwd: root, stdio: "inherit", shell: true });
  if (build.status !== 0) {
    console.error("Build failed. Fix the error above, then try again.");
    process.exit(1);
  }
}

console.log(`Starting Placement Coach at ${URL} (keep this window open; close it to stop the app)...`);
const server = spawn(npm, ["run", "start", "--", "-p", String(PORT)], { cwd: root, stdio: "inherit", shell: true });
server.on("exit", (code) => process.exit(code ?? 0));

for (let i = 0; i < 60; i++) {
  if (await isRunning()) {
    openBrowser();
    break;
  }
  await new Promise((r) => setTimeout(r, 500));
}
