import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { ENV } from "./env";

export async function verifyFirebaseToken(token: string) {
  if (!ENV.firebaseProjectId)
    throw new Error("Firebase project is not configured");
  if (
    process.env.NODE_ENV === "production" &&
    process.env.FIREBASE_AUTH_EMULATOR_HOST
  )
    throw new Error("Auth emulator is forbidden in production");
  const app =
    getApps().find(app => app.name === "foreverhome-api") ??
    initializeApp(
      {
        credential: applicationDefault(),
        projectId: ENV.firebaseProjectId,
      },
      "foreverhome-api"
    );
  // Verify signature, project audience/issuer, expiry AND revocation/disabled user.
  return getAuth(app).verifyIdToken(token, true);
}
