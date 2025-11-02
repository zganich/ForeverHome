// Vercel serverless function entry point
import { createApp } from '../server/_core/index.js';
import { serveStatic } from '../server/_core/vite.js';

let appPromise: Promise<import('express').Express> | null = null;

/**
 * Get or create the Express app (lazy initialization for Vercel)
 * This is cached to avoid re-creating the app on every request
 */
async function getApp() {
  if (!appPromise) {
    appPromise = createApp().then(async (app) => {
      // In Vercel production, serve static files
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
        serveStatic(app);
      }
      return app;
    });
  }
  return appPromise;
}

/**
 * Vercel serverless function handler
 * Vercel will call this function for all requests
 */
export default async function handler(req: any, res: any) {
  const app = await getApp();
  
  // Use Express app to handle the request
  // Vercel's req/res are compatible with Express
  return new Promise<void>((resolve, reject) => {
    app(req, res, (err?: any) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

