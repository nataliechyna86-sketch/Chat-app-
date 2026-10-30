# Mochii - React Native Expo & Google Cloud Deployment Guide

This guide explains how to:
1. Build an Android APK using **React Native Expo** on your computer with real WebRTC & Google AdMob.
2. Rehost the Mochii server on your **personal Google Cloud Account (Cloud Run)** with 1 command and free tier hosting.

---

## Part 1: Building with React Native Expo (Android APK)

Because video chat requires native camera, microphone, and C++ WebRTC drivers, you use **Expo Development Build (EAS)** instead of standard Expo Go.

### Step 1: Initialize the Expo Project
Open your computer terminal:
```bash
npx create-expo-app@latest mochii-mobile
cd mochii-mobile
```

### Step 2: Install WebRTC & Google AdMob
Install the official Expo config plugins and native packages:
```bash
npx expo install react-native-webrtc @config-plugins/react-native-webrtc
npx expo install react-native-google-mobile-ads
npx expo install lucide-react-native react-native-svg
```

### Step 3: Configure `app.json`
Add the camera/microphone permissions and AdMob test app ID into your `app.json`:
```json
{
  "expo": {
    "name": "mochii",
    "slug": "mochii",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "android": {
      "package": "com.mochii.videochat",
      "permissions": [
        "CAMERA",
        "RECORD_AUDIO",
        "MODIFY_AUDIO_SETTINGS",
        "ACCESS_NETWORK_STATE"
      ]
    },
    "plugins": [
      [
        "@config-plugins/react-native-webrtc",
        {
          "cameraPermission": "Allow mochii to access your camera for video chat.",
          "microphonePermission": "Allow mochii to access your microphone for voice calls."
        }
      ],
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-3940256099942544~3347511713"
        }
      ]
    ]
  }
}
```

### Step 4: Add Real AdMob Test Banner in Expo
In any React Native screen:
```tsx
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

export function AdBanner() {
  return (
    <BannerAd
      unitId={TestIds.BANNER}
      size={BannerAdSize.BANNER}
      requestOptions={{
        requestNonPersonalizedAdsOnly: true,
      }}
    />
  );
}
```

### Step 5: Build the Standalone Android APK
You can generate a direct installable `.apk` file using Expo Application Services (EAS):
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```
*(EAS will compile the APK in the cloud for free and give you a download link / QR code directly to install on your phone!)*

If you prefer building locally on your computer with Android Studio:
```bash
npx expo run:android
```

---

## Part 2: Rehosting on Your Personal Google Cloud Account

Google Cloud Run offers a generous **Free Tier** (2 million requests/month, 360,000 GB-seconds, and automatic free SSL).

### Step 1: Install & Authenticate Google Cloud CLI
Install the Google Cloud SDK (`gcloud`) on your computer from [cloud.google.com/sdk](https://cloud.google.com/sdk), then run:
```bash
gcloud auth login
```
Select your personal Google account (`ashelchibvaz@gmail.com`).

### Step 2: Set Your Google Cloud Project
Create a new project in the [Google Cloud Console](https://console.cloud.google.com/) (e.g. `my-mochii-chat`), then set it in your terminal:
```bash
gcloud config set project YOUR_PROJECT_ID
```

### Step 3: Enable Cloud Run & Cloud Build APIs
```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com
```

### Step 4: Deploy in One Command
Navigate to the root of this project and run:
```bash
gcloud run deploy mochii \
  --source . \
  --region europe-west2 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000
```

Cloud Run will:
1. Automatically read the existing `Dockerfile`.
2. Build the production React frontend bundle and start the Node.js/WebSocket server.
3. Output a permanent, secure HTTPS URL (e.g. `https://mochii-xyz-ew.a.run.app`).

### Step 5: Optional - Connect Your Custom Domain (e.g. mochii.app)
In Google Cloud Console:
1. Go to **Cloud Run** ➔ **Manage Custom Domains**.
2. Click **Add Mapping** and select your `mochii` service.
3. Enter your domain name and follow the standard DNS CNAME/A record instructions. Google Cloud provisions free managed SSL certificates automatically.
