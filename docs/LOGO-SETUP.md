# Logo Setup Guide

## Quick Steps

1. **Get transparent logo:**
   - Use [remove.bg](https://www.remove.bg) or [Adobe Express](https://www.adobe.com/express/feature/image/remove-background)
   - Upload your logo with white background
   - Download as PNG with transparent background

2. **Add to project:**
   - Save as: `client/public/logo.png`
   - Or: `client/public/logo.svg` (if SVG format)

3. **That's it!** The code will automatically detect and use it.

## Alternative: Hosted Logo URL

If you prefer to host the logo elsewhere:

1. Upload to:
   - Vercel Blob Storage
   - Cloudinary
   - Your own CDN
   - Any image hosting service

2. Set environment variable:
   ```env
   VITE_APP_LOGO=https://your-logo-url.com/logo.png
   ```

3. Add to Vercel Dashboard:
   - Settings → Environment Variables
   - Add `VITE_APP_LOGO` with your URL

## Logo Specifications

- **Format:** PNG (with transparency) or SVG
- **Size:** 128x128px minimum (will be scaled)
- **Shape:** Square recommended (will be cropped to circle in nav)
- **Background:** Transparent (required)

## Current Status

The navigation code is already set up to:
- ✅ Use `APP_LOGO` if available
- ✅ Fall back to PawPrint icon if no logo
- ✅ Display in rounded circle
- ✅ Scale properly on all devices

Just add the logo file and it will appear automatically!

