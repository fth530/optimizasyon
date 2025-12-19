import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // In production build, __dirname will be dist/, so public is at dist/public
  // But we need to check both locations for flexibility
  let distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    // Try alternative path (for Vercel deployment)
    distPath = path.resolve(process.cwd(), "dist", "public");
    if (!fs.existsSync(distPath)) {
      throw new Error(
        `Could not find the build directory. Tried: ${path.resolve(__dirname, "public")} and ${distPath}. Make sure to build the client first`,
      );
    }
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
