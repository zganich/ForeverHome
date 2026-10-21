/** Exact staging destinations; custom-domain/feature additions need review. */
export const stagingApiOrigin =
  "https://foreverhome-api-726465463592.us-central1.run.app";
export const browserCsp = [
  "default-src 'none'",
  "script-src 'self'",
  // React/Radix/chart components use inline styles, never inline scripts.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' blob: data:",
  `connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com ${stagingApiOrigin}`,
  "frame-src https://foreverhome-reclaimware-2026.firebaseapp.com",
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");
export const commonSecurityHeaders = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};
export const hostingSecurityHeaders = {
  ...commonSecurityHeaders,
  "Content-Security-Policy": browserCsp,
};
export const apiSecurityHeaders = {
  ...commonSecurityHeaders,
  "Content-Security-Policy":
    "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
};
