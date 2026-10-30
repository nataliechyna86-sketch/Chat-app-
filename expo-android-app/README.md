# mochii - React Native Expo Android App (Complete Build Guide)

This folder (`expo-android-app/`) contains the complete native Android project ready to build into an installable `.apk` file for your phone.

---

## 🚀 How to Build the APK on Your Computer (3 Easy Steps)

### Step 1: Open the `expo-android-app` folder in your terminal
```bash
cd expo-android-app
npm install
```

### Step 2: Install the EAS Build CLI (Free cloud APK builder by Expo)
```bash
npm install -g eas-cli
eas login
```
*(If you don't have an Expo account yet, it takes 30 seconds to create a free account at [expo.dev](https://expo.dev).)*

### Step 3: Run the Cloud Build Command
```bash
eas build -p android --profile preview
```

### What Happens Next:
1. EAS packages your project and compiles the native Android C++ WebRTC and camera drivers in the cloud.
2. In ~5 minutes, EAS outputs a **direct download URL** and a **QR Code** in your terminal.
3. Scan the QR code or click the download link on your Android phone to install `mochii.apk`!

---

## 💻 Alternative: Running Locally on Android Studio (Mac / Windows / Linux)

If you have Android Studio and an Android phone plugged into your computer via USB:
```bash
cd expo-android-app
npx expo run:android
```
This compiles the `.apk` directly on your local machine and installs it to your phone.

---

## 💰 Enabling Real Google AdMob Ads in the APK

In `app.json`:
Replace the test App ID with your real AdMob App ID from [admob.google.com](https://admob.google.com):
```json
"plugins": [
  [
    "react-native-google-mobile-ads",
    {
      "androidAppId": "ca-app-pub-YOUR_PUBLISHER_ID~YOUR_APP_ID"
    }
  ]
]
```
