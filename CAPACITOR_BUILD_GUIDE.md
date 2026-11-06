# Mochii - Capacitor Android Build Guide 📱

This project is fully configured with **Capacitor** to package the Mochii video chat web application into a native Android APK.

---

## ⚡ Can the `.apk` file be compiled directly inside this web sandbox?

**In this online web container:** No, because compiling native Android binaries (`.apk` / `.aab`) requires the **Android SDK (~12GB+)**, Android build tools, and **Java JDK 17**, which are not present in this lightweight Node.js web development environment (`java: not found`).

**However, the entire Capacitor Android setup is already 100% prepared and ready to build:**
1. ✅ **Capacitor Core & Android runtime installed**: `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/haptics`.
2. ✅ **Complete native Android directory (`/android`)** generated with native gradle wrapper and native bridge.
3. ✅ **Permissions configured** in `android/app/src/main/AndroidManifest.xml` (Camera, Microphone, Audio Settings, Haptics, Network State).
4. ✅ **Web assets bundled and synced** directly into `android/app/src/main/assets/public`.
5. ✅ **Automated GitHub Actions CI** workflow (`.github/workflows/build-capacitor-apk.yml`) pre-configured with JDK 17, Android SDK, and automated APK artifact upload.

---

## Option 1: Build the APK automatically with GitHub Actions (Recommended & Free) 🚀

You don't need to install anything on your computer! GitHub provides free runners equipped with JDK 17 and Android SDK.

1. **Push this repository to GitHub**:
   ```bash
   git add .
   git commit -m "feat: setup capacitor android build"
   git push origin main
   ```

2. **Run the workflow**:
   - Go to your repository on GitHub (`https://github.com/nataliechyna86-sketch/Chat-app-`).
   - Click the **Actions** tab at the top.
   - In the left sidebar, select **📱 Build Capacitor Android APK**.
   - Click **Run workflow** ➔ Select branch `main` ➔ Click **Run workflow**.

3. **Download your APK**:
   - The build takes around **1.5 - 2 minutes**.
   - Once completed with a green checkmark ✅, click on the workflow run.
   - Scroll down to the **Artifacts** section at the bottom.
   - Click **Mochii-Capacitor-Android-APK** to download `mochii-capacitor-android.apk`.
   - Transfer and install it directly on your Android phone!

---

## Option 2: Build or Run locally on your PC / Mac with Android Studio 💻

If you have a computer with Android Studio installed:

1. Clone or download your repo:
   ```bash
   git clone https://github.com/nataliechyna86-sketch/Chat-app-.git
   cd Chat-app-
   ```

2. Install dependencies & sync assets:
   ```bash
   npm install
   npm run cap:build
   ```

3. Open the Android project in Android Studio:
   ```bash
   npm run cap:open
   ```
   *(Or open the `android` folder directly in Android Studio).*

4. Build or Run:
   - Click **Run (Green Play button)** to launch Mochii on a connected phone or emulator.
   - Or go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)** to generate the installable `.apk` file.

---

## 🔧 Technical Details

- **App ID**: `com.mochii.videochat`
- **App Name**: `mochii`
- **Native WebRTC Routing**: Inside the native Capacitor Android app, WebRTC and WebSocket calls dynamically connect to your hosted Cloud Run production signaling server (`ais-pre-ollmggw5fqklgkr5otu3h2-808300536981.europe-west2.run.app`), ensuring seamless real-time video chat and pairing.
