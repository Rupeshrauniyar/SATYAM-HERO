# Android Setup Guide - Splash Screen & Logo

## Completed:
1. ✅ Updated Capacitor dependencies to compatible versions (v8.4.1 core, v8.1.0 app, v8.0.1 splash-screen)
2. ✅ Installed npm dependencies successfully
3. ✅ Configured splash-screen plugin in capacitor.config.json
4. ✅ Created Android back-button handler in App.jsx with URL-based overlay closing
5. ✅ Updated all pages to use URL query parameters for comment/share/insights overlays:
   - Home.jsx
   - Profile.jsx
   - Alerts.jsx
   - GovDashboard.jsx
   - GovProfile.jsx
6. ✅ Updated AppShell.jsx to display Logo.jpeg from public folder
7. ✅ Created splash.xml drawable layout that references splash_logo image
8. ✅ Added splash_bg_color to Android color resources
9. ✅ Copied Logo.jpeg to all Android drawable density folders
10. ✅ Built React app: `npm run build` ✓
11. ✅ Synced with Android: `npx cap sync android` ✓

## Remaining Manual Steps:

### 1. Install Java Development Kit (JDK)
Download and install JDK 11 or later from:
https://www.oracle.com/java/technologies/downloads/#java11

Set JAVA_HOME environment variable to your JDK installation path.

### 2. Build APK
Once Java is installed, run in FRONTEND directory:
```bash
npx cap build android
```

### 3. Deploy to Device/Emulator
- Connect Android device via USB with debugging enabled, OR
- Use Android Emulator from Android Studio
- Install APK:
```bash
adb install app-debug.apk
```

## Features Implemented:

### URL-Based Overlay Navigation
- Opening comments: `/?comments=reportId`
- Opening share: `/?share=reportId`
- Opening insights: `/?insights=reportId`
- Closing overlays automatically removes query params

### Android Back Button Handling
- If home page (/) and back pressed → Exit app
- If overlay open (has URL params) → Close overlay without exiting
- Otherwise → Navigate to previous page

### Splash Screen
- Displays Logo.jpeg centered on white background
- Auto-hides after 1200ms when app loads
- Configured via Capacitor SplashScreen plugin
