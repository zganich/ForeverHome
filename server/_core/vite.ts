import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Determine the correct path based on environment
  let distPath: string;
  
  if (process.env.VERCEL) {
    // In Vercel, static files are in the output directory (dist/public)
    // The serverless function runs from .vercel/output/functions/api/index
    // We need to go up to find dist/public
    distPath = path.resolve(process.cwd(), "dist", "public");
  } else if (process.env.NODE_ENV === "development") {
    distPath = path.resolve(import.meta.dirname, "../..", "dist", "public");
  } else {
    distPath = path.resolve(import.meta.dirname, "../..", "dist", "public");
  }

  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
    // Try alternative paths
    const altPath = path.resolve(process.cwd(), "dist", "public");
    if (fs.existsSync(altPath)) {
      distPath = altPath;
      console.log(`Using alternative path: ${distPath}`);
    }
  }

  app.use(express.static(distPath, { index: false }));

  // fall through to index.html if the file doesn't exist (SPA routing)
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Not found");
    }
  });
}
