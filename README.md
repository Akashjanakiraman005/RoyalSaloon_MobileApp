# RoyalSalon Luxury Concierge

A premium mobile management suite for high-end salons featuring service catalogs, client management, real-time billing, and analytics. Built with React, Vite, and Capacitor for Android.

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **Android Studio** (if you want to build and run the native Android app)

---

## 1. Setup & Environment Variables

1. Install dependencies in the root folder:
   ```bash
   npm install
   ```
2. Create or configure your `.env.local` file in the root directory and add your credentials:
   ```env
   GEMINI_API_KEY="your_gemini_api_key_here"
   ```

---

## 2. Run the Backend API (Required)

The backend is required for billing, PDF generation, email, and WhatsApp notifications.
Run this command in a separate terminal:
```bash
npm run dev:backend
```
The backend server runs on `http://localhost:5005` (or as configured in `.env.local`).

---

## 3. How to Run the Frontend Application

Choose one of the options below to run the app:

### Option A: Mobile View in your Web Browser (Fastest)
1. Run the local development server:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:3000` in Google Chrome.
3. Press **`F12`** (to open Developer Tools) and click the **Toggle Device Toolbar** icon (or press **`Ctrl + Shift + M`** / **`Cmd + Shift + M`**) to view it as a mobile device.

### Option B: On a Native Android Emulator or Physical Phone
1. Build the production assets:
   ```bash
   npm run build
   ```
2. Sync the assets to the Capacitor Android project:
   ```bash
   npx cap sync
   ```
3. Open the Android project in **Android Studio**:
   ```bash
   npx cap open android
   ```
4. In Android Studio, connect your physical phone via USB (with Developer Options & USB Debugging enabled) or start a Virtual Device (Emulator), then click the green **Run** button.

### Option C: Install directly on Android (APK)
You can find the pre-built installer package in:
`android/app/build/outputs/apk/debug/app-debug.apk`

Transfer this `.apk` file to your Android phone to install it directly.

