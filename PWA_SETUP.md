# PWA Setup Guide

Your Reader app is now a Progressive Web App (PWA) with share target support!

## Features

✅ **Installable** - Users can install the app on their devices  
✅ **Share Target** - Share URLs from other apps directly to Reader  
✅ **Offline Support** - Basic offline functionality via service worker  
✅ **App-like Experience** - Standalone mode when installed  

## Setup Instructions

### 1. Create PWA Icons

You need to create two icon files:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

**Option A: Use the icon generator**
1. Open `client/public/create-icons.html` in a browser
2. Right-click each canvas and save as `icon-192.png` and `icon-512.png`
3. Place them in `client/public/`

**Option B: Create custom icons**
- Use any image editor to create icons
- Recommended: Use your app logo or a book icon
- Save as PNG files with the exact names above
- Place in `client/public/`

### 2. Test the PWA

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Install the PWA:**
   - Open the app in Chrome/Edge
   - Look for the install prompt in the address bar
   - Or go to Settings → Install "Reader"

4. **Test Share Target:**
   - Install the PWA first
   - Open any app with a share button (browser, news app, etc.)
   - Share a URL
   - "Reader" should appear in the share menu
   - Select it to save the article

### 3. HTTPS Requirement

PWAs require HTTPS (except for localhost). For production:
- Use a service like Vercel, Netlify, or Railway
- Or set up SSL certificates for your domain

## How Share Target Works

1. User shares a URL from another app
2. Reader app opens at `/share?url=...`
3. If not logged in, user is redirected to login
4. After login, the article is automatically saved
5. User is redirected to their library

## Troubleshooting

**Share target not appearing:**
- Make sure the PWA is installed
- Clear browser cache and reinstall
- Check that manifest.json is accessible at `/manifest.json`

**Service worker not registering:**
- Check browser console for errors
- Ensure you're on HTTPS (or localhost)
- Verify `sw.js` is accessible at `/sw.js`

**Icons not showing:**
- Verify icon files exist in `client/public/`
- Check file names match exactly (case-sensitive)
- Rebuild the app after adding icons

## Browser Support

- ✅ Chrome/Edge (Android & Desktop)
- ✅ Safari (iOS 16.4+)
- ✅ Firefox (Android)
- ⚠️ Share target: Chrome/Edge only (Android & Desktop)
