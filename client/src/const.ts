export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "InterpWhat";

// The repository has no bundled logo asset.
export const APP_LOGO = import.meta.env.VITE_APP_LOGO || "";

// Simple login URL for Firebase auth
export const getLoginUrl = () => "/login";