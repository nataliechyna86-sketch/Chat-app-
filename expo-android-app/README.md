# ChatPulse - React Native Android App (APK Guide)

This folder contains the complete native React Native (Expo) code for the **ChatPulse** Android app using `react-native-webrtc`.

## How to Build the Standalone Android APK

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 3: Log in to Expo
```bash
eas login
```

### Step 4: Build Standalone APK (Preview Profile)
```bash
eas build -p android --profile preview
```

EAS will build your `.apk` in the cloud. Once complete, you will receive a direct download link and QR code to download and install the `.apk` on your Android phone!

## Running Locally on an Android Emulator or Connected Device
```bash
npx expo run:android
```
