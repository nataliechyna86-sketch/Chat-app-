# Complete Guide: Wrapping Mochii into a Native Android App (WebView with Camera, Mic & Native Features)

**Yes, absolutely!** This is one of the cleanest and most common ways production apps are built. Your web app handles the UI, WebRTC video calling, and WebSocket matchmaking, while Android provides native hardware access, Google Play distribution, AdMob ads, and hardware permissions.

---

## ⚠️ The Golden Rule for WebRTC in Android WebView
For camera and microphone to work inside an Android WebView, you **MUST** do two things:
1. Request runtime permissions (`CAMERA` and `RECORD_AUDIO`) in Android.
2. Override `WebChromeClient.onPermissionRequest()` in the WebView to grant WebRTC hardware resources.

Below are the **two best ways** to do it:
- **Option 1 (Capacitor - Recommended & Easiest)**: Wraps this existing React web build into native Android Studio in 3 terminal commands with full native plugin support.
- **Option 2 (Native Android Studio Kotlin)**: Pure native Android app with custom `WebView` and `WebChromeClient`.

---

## Option 1: Capacitor (Recommended — 5 Minutes)

Capacitor (by Ionic) turns your web app into a real native Android Studio project. It automatically configures WebRTC camera/mic handling and lets you use native Android features via simple JavaScript/TypeScript calls.

### Step 1: Install Capacitor in your project root
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init mochii com.mochii.videochat --web-dir dist
```

### Step 2: Build the web app and add Android
```bash
npm run build
npx cap add android
```
*(This automatically creates a real `android/` directory that opens directly in Android Studio!)*

### Step 3: Add Native Features to your web app
You can now invoke native Android features directly from React:

* **Native Haptic Feedback (vibrations on match / skip)**:
  ```bash
  npm install @capacitor/haptics
  ```
  ```ts
  import { Haptics, ImpactStyle } from '@capacitor/haptics';
  await Haptics.impact({ style: ImpactStyle.Medium });
  ```

* **Native Google AdMob Ads**:
  ```bash
  npm install @capacitor-community/admob
  ```

* **Native Push Notifications**:
  ```bash
  npm install @capacitor/push-notifications
  ```

* **Native Status Bar & Splash Screen**:
  ```bash
  npm install @capacitor/status-bar @capacitor/splash-screen
  ```

### Step 4: Run or build APK
```bash
npx cap sync
npx cap open android
```
Android Studio opens. Click **Build ➔ Build Bundle(s) / APK(s) ➔ Build APK(s)**.

---

## Option 2: Pure Native Android Studio (Kotlin WebView)

If you prefer building a native Android app in Android Studio from scratch:

### 1. `AndroidManifest.xml`
Add camera, microphone, and internet permissions:
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.mochii.videochat">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

    <uses-feature android:name="android.hardware.camera" android:required="true" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
    <uses-feature android:name="android.hardware.microphone" android:required="true" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="mochii"
        android:theme="@style/Theme.AppCompat.NoActionBar"
        android:hardwareAccelerated="true">

        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### 2. `MainActivity.kt`
Here is the complete activity that asks for camera/mic permissions and tells the WebView to allow WebRTC video/audio streams:

```kotlin
package com.mochii.videochat

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private val PERMISSION_REQUEST_CODE = 1001

    // Replace with your hosted URL (Render, Cloud Run, or custom domain)
    private val APP_URL = "https://mochii-video-chat.onrender.com"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        setContentView(webView)

        configureWebView()
        requestHardwarePermissions()
    }

    private fun configureWebView() {
        val settings: WebSettings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.mediaPlaybackRequiresUserAction = false // Crucial for instant video streaming
        settings.allowFileAccess = true
        settings.loadsImagesAutomatically = true
        settings.setSupportZoom(false)

        webView.webViewClient = WebViewClient()

        // CRITICAL FOR WEBRTC: Grant camera & mic access to web code
        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest?) {
                runOnUiThread {
                    request?.let {
                        // Automatically grant CAMERA and AUDIO permissions to your site
                        it.grant(it.resources)
                    }
                }
            }
        }

        webView.loadUrl(APP_URL)
    }

    private fun requestHardwarePermissions() {
        val requiredPermissions = arrayOf(
            Manifest.permission.CAMERA,
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.MODIFY_AUDIO_SETTINGS
        )

        val missingPermissions = requiredPermissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (missingPermissions.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, missingPermissions.toTypedArray(), PERMISSION_REQUEST_CODE)
        }
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
```

---

## 📱 Adding Native JavaScript Bridge (Two-Way Communication)

You can pass messages between your React website and native Android code using `@JavascriptInterface`:

### In Android (`MainActivity.kt`):
```kotlin
class AndroidBridge(val activity: MainActivity) {
    @android.webkit.JavascriptInterface
    fun showToast(message: String) {
        android.widget.Toast.makeText(activity, message, android.widget.Toast.LENGTH_SHORT).show()
    }

    @android.webkit.JavascriptInterface
    fun triggerVibration() {
        val vibrator = activity.getSystemService(android.content.Context.VIBRATOR_SERVICE) as android.os.Vibrator
        vibrator.vibrate(100)
    }
}

// Attach to webView:
webView.addJavascriptInterface(AndroidBridge(this), "AndroidNative")
```

### In React (`SetupScreen.tsx` or `VideoArea.tsx`):
```ts
// Call native Android method directly from React:
if ((window as any).AndroidNative) {
  (window as any).AndroidNative.triggerVibration();
}
```

---

## Summary Recommendation
- If you want the **fastest, cleanest setup with zero native boilerplate**: Use **Capacitor** (Option 1). It takes 5 minutes and lets you install native plugins like AdMob, Haptics, and Notifications using `npm`.
- If you prefer **custom Android Studio code**: Use **Kotlin WebView** (Option 2) with `WebChromeClient.onPermissionRequest`.
