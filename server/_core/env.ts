export const ENV = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  // OWNER_OPEN_ID - used for admin/owner checks (optional, can be empty string)
  ownerId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  firebaseProjectId: process.env.GOOGLE_CLOUD_PROJECT ?? "",
  storageBucket: process.env.GCS_BUCKET ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiBaseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
};
