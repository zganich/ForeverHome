import { createApp } from "../server/_core/app.js";
import type { Request, Response } from "express";

let appPromise: ReturnType<typeof createApp> | undefined;
export default async function handler(req: Request, res: Response) {
  appPromise ??= createApp().catch(error => {
    appPromise = undefined;
    throw error;
  });
  const app = await appPromise;
  await new Promise<void>((resolve, reject) => {
    res.once("finish", resolve);
    res.once("close", resolve);
    app(req, res, error => {
      if (error) reject(error);
      else {
        res.statusCode = 404;
        res.end();
      }
    });
  });
}
