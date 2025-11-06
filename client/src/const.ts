export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

// Logo configuration:
// 1. Check environment variable first (for hosted URLs)
// 2. Try local file in public folder (/logo.png or /logo.svg)
// 3. Fall back to placeholder
export const APP_LOGO =
  import.meta.env.VITE_APP_LOGO ||
  "/logo.png" || // Will be used if file exists in public folder
  "https://placehold.co/128x128/E1E7EF/1F2937?text=App";

// Simple login URL for Supabase auth
export const getLoginUrl = () => "/login";