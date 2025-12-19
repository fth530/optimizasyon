import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, mkdir, writeFile } from "fs/promises";
import { join } from "path";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "serverless-http",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });
  await rm("api", { recursive: true, force: true });
  await rm("netlify/functions", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  // Create Netlify Function handler
  console.log("creating Netlify Function handler...");
  await mkdir("netlify/functions", { recursive: true });
  await writeFile(
    "netlify/functions/server.js",
    `// Netlify serverless function handler
const { netlifyFunction } = require("../../dist/index.cjs");

exports.handler = async (event, context) => {
  return netlifyFunction(event, context);
};
`,
    "utf-8"
  );

  // Create Vercel API handler (for backward compatibility)
  console.log("creating Vercel API handler...");
  await mkdir("api", { recursive: true });
  await writeFile(
    "api/index.js",
    `// Vercel serverless function handler
// Import the default export (handler function) from the built server
const handler = require("../dist/index.cjs").default;
module.exports = handler;
`,
    "utf-8"
  );
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
