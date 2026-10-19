import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};
export const authConfigured = Object.values(config).every(Boolean);

export function getFirebaseAuth() {
  if (!authConfigured)
    throw new Error("Authentication is not configured. Contact the app owner.");
  return getAuth(
    getApps().some(app => app.name === "[DEFAULT]")
      ? getApp()
      : initializeApp(config)
  );
}
