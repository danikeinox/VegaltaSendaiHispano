import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const srcDir = path.join(rootDir, "src");
const proxyFile = path.join(srcDir, "proxy.ts");
const middlewareFile = path.join(srcDir, "middleware.ts");
const stashFile = path.join(rootDir, "scripts", ".proxy.stash.ts");

const middlewareSource = `import type { NextRequest } from "next/server";
import { handleSiteRequest } from "@/lib/site-proxy";

export function middleware(request: NextRequest) {
  return handleSiteRequest(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
`;

function prepareEdgeMiddleware() {
  if (fs.existsSync(middlewareFile) && !fs.existsSync(proxyFile)) {
    return;
  }

  if (fs.existsSync(middlewareFile)) {
    fs.unlinkSync(middlewareFile);
  }

  if (!fs.existsSync(proxyFile)) {
    if (fs.existsSync(stashFile)) {
      fs.renameSync(stashFile, proxyFile);
    } else {
      throw new Error("src/proxy.ts not found for Cloudflare build preparation.");
    }
  }

  if (!fs.existsSync(proxyFile)) {
    throw new Error("src/proxy.ts not found for Cloudflare build preparation.");
  }

  fs.renameSync(proxyFile, stashFile);
  fs.writeFileSync(middlewareFile, middlewareSource, "utf8");
  console.log("Prepared edge middleware for Cloudflare (proxy.ts stashed).");
}

function restoreProxy() {
  if (fs.existsSync(middlewareFile)) {
    fs.unlinkSync(middlewareFile);
  }

  if (fs.existsSync(stashFile)) {
    fs.renameSync(stashFile, proxyFile);
    console.log("Restored src/proxy.ts after Cloudflare build.");
  }
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const mode = process.argv[2] ?? "build";

prepareEdgeMiddleware();

try {
  if (mode === "build") {
    run("npx", ["opennextjs-cloudflare", "build"]);
  } else if (mode === "preview") {
    run("npx", ["opennextjs-cloudflare", "build"]);
    run("npx", ["opennextjs-cloudflare", "preview"]);
  } else if (mode === "deploy") {
    run("npx", ["opennextjs-cloudflare", "build"]);
    run("npx", ["opennextjs-cloudflare", "deploy"]);
  } else {
    throw new Error(`Unknown Cloudflare proxy mode: ${mode}`);
  }
} finally {
  restoreProxy();
}
