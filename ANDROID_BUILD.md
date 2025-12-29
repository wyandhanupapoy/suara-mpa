# 🤖 Android Build Guide - Suara MPA

Panduan lengkap untuk membuild aplikasi **Suara MPA** menjadi APK Android menggunakan Capacitor dan Android Studio.

---

## 📋 Prerequisites

Sebelum mulai, pastikan sudah menginstall:

### 1. **Node.js & npm**
```bash
node --version  # v18 atau lebih baru
npm --version   # v9 atau lebih baru
```

### 2. **Android Studio**
- Download: [https://developer.android.com/studio](https://developer.android.com/studio)
- Install dengan **Android SDK**, **Android SDK Platform**, dan **Android Virtual Device**

### 3. **Java Development Kit (JDK)**
- JDK 17 (recommended untuk Android)
- Set `JAVA_HOME` environment variable

### 4. **Android SDK**
Pastikan sudah menginstall di Android Studio:
- Android SDK Platform 34 (atau yang terbaru)
- Android SDK Build-Tools
- Android Emulator (opsional, untuk testing)

### 5. **Environment Variables**
Tambahkan ke PATH:
```bash
# Windows (PowerShell)
$env:ANDROID_HOME = "C:\Users\YourUsername\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools"
$env:PATH += ";$env:ANDROID_HOME\tools"

# Linux/Mac
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
```

---

## 🚀 Quick Start

### 1. **Install Dependencies**
```bash
cd c:\Users\nunu\Documents\MPA\suara-mpa\suara-mpa\suara-mpa
npm install
```

### 2. **Sync Capacitor**
Setelah mengubah apa pun di web app:
```bash
npm run cap:sync
```

### 3. **Open Android Studio**
```bash
npm run cap:open
```
Atau manual:
```bash
npx cap open android
```

### 4. **Build APK**
Di Android Studio:
1. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Tunggu proses build selesai
3. APK akan tersimpan di `android/app/build/outputs/apk/debug/app-debug.apk`

---

## ⚙️ Configuration

### Capacitor Config
File: `capacitor.config.json`

```json
{
  "appId": "com.himakom.suarampa",
  "appName": "Suara MPA",
  "webDir": "public",
  "server": {
    "url": "https://suara-mpa.vercel.app",
    "cleartext": true,
    "androidScheme": "https"
  }
}
```

> **📌 Important**: App ini menggunakan **hosted URL approach**. Artinya, Android app akan load content dari Vercel deployment, bukan dari static files. Ini memungkinkan API routes dan fitur server-side tetap berfungsi.

### Mengubah ke Development Mode (Localhost)

Untuk development, ubah `server.url` di `capacitor.config.json`:

```json
{
  "server": {
    "url": "http://10.0.2.2:3000",  // Untuk Android Emulator
    "cleartext": true,
    "androidScheme": "http"
  }
}
```

> **💡 Tip**: `10.0.2.2` adalah alias untuk `localhost` di Android Emulator. Kalau pakai device fisik, gunakan IP address komputer Anda di network yang sama.

Jangan lupa sync setelah mengubah config:
```bash
npm run cap:sync
```

---

## 🏗️ Build Workflow

### Development (Testing di emulator/device)

1. **Start Next.js dev server**:
   ```bash
   npm run dev
   ```

2. **Update capacitor config** untuk point ke localhost (lihat di atas)

3. **Sync dan open Android Studio**:
   ```bash
   npm run cap:sync
   npm run cap:open
   ```

4. **Run di emulator/device** dari Android Studio (▶️ Play button)

### Production (Build APK untuk distribusi)

1. **Pastikan capacitor.config.json** menggunakan production URL:
   ```json
   {
     "server": {
       "url": "https://suara-mpa.vercel.app"
     }
   }
   ```

2. **Sync kapasitor**:
   ```bash
   npm run cap:sync
   ```

3. **Open Android Studio**:
   ```bash
   npm run android:build
   ```

4. **Build Release APK**:
   - **Build** → **Generate Signed Bundle / APK**
   - Pilih **APK**
   - Create/Select keystore (untuk production)
   - Build APK

5. **Lokasi APK**:
   - Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
   - Release (signed): `android/app/build/outputs/apk/release/app-release.apk`

---

## 🔑 App Signing (Production)

Untuk publish ke Google Play Store, APK harus di-sign dengan keystore:

### 1. **Generate Keystore**
```bash
keytool -genkey -v -keystore suara-mpa-release.keystore -alias suara-mpa -keyalg RSA -keysize 2048 -validity 10000
```

### 2. **Configure Gradle**
Buat file `android/key.properties`:
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=suara-mpa
storeFile=../suara-mpa-release.keystore
```

### 3. **Update build.gradle**
File: `android/app/build.gradle`

Tambahkan sebelum `android` block:
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Di dalam `android` block, tambahkan `signingConfigs`:
```gradle
android {
    ...
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

> **⚠️ IMPORTANT**: Jangan commit `key.properties` dan `.keystore` file ke git! Simpan dengan aman.

---

## 🎨 App Icon & Splash Screen

### Auto-generate Icons

Gunakan logo MPA yang sudah ada:

1. **Prepare source image** (1024x1024px):
   ```bash
   # Copy logo MPA
   copy public\Logo_MPA.png resources\icon.png
   ```

2. **Generate dengan Capacitor**:
   ```bash
   npm install -g @capacitor/assets
   npx capacitor-assets generate --iconBackgroundColor='#ffffff' --splashBackgroundColor='#1e3a8a'
   ```

### Manual Configuration

Edit `android/app/src/main/res/` directories untuk custom icons:
- `mipmap-mdpi/` - 48x48px
- `mipmap-hdpi/` - 72x72px
- `mipmap-xhdpi/` - 96x96px
- `mipmap-xxhdpi/` - 144x144px
- `mipmap-xxxhdpi/` - 192x192px

---

## 🐛 Troubleshooting

### Error: "SDK location not found"

**Solution**:
Buat file `android/local.properties`:
```properties
sdk.dir=C\:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

### Error: "Gradle build failed"

**Solutions**:
1. **Clean build**:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

2. **Invalidate cache** di Android Studio:
   **File** → **Invalidate Caches / Restart**

3. **Re-sync Capacitor**:
   ```bash
   npm run cap:sync
   ```

### Error: "Unable to load  script from assets"

**Solution**:
Pastikan `capacitor.config.json` sudah benar dan jalankan:
```bash
npm run cap:sync
```

### App tidak bisa connect ke localhost

**Solution untuk Android Emulator**:
- Gunakan IP `10.0.2.2` bukan `localhost` atau `127.0.0.1`

**Solution untuk Physical Device**:
- Pastikan device dan komputer di network yang sama
- Gunakan IP address komputer, bukan localhost
- Check firewall tidak blocking port 3000

### CORS Errors

**Solution**:
Update `next.config.mjs`:
```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
      ],
    },
  ];
},
```

---

## 📱 Testing

### Di Android Emulator

1. Buka Android Studio
2. **Tools** → **Device Manager**
3. Create/Start emulator
4. Run app dari Android Studio

### Di Physical Device

1. Enable **Developer Options** di Android:
   - **Settings** → **About Phone**
   - Tap **Build Number** 7x
   
2. Enable **USB Debugging**:
   - **Settings** → **Developer Options** → **USB Debugging**

3. Connect device via USB

4. Run dari Android Studio (device akan muncul di device list)

### Debug dengan Chrome DevTools

1. Open Chrome: `chrome://inspect`
2. Select device
3. Inspect app
4. Full access ke Console, Network, Elements, dll

---

## 📦 Distribution

### Google Play Store

1. **Build signed release APK/AAB** (lihat App Signing section)

2. **Create Google Play Console account**:
   - [https://play.google.com/console](https://play.google.com/console)
   - One-time $25 registration fee

3. **Create app listing**:
   - App name, description, screenshots
   - Category, content rating
   - Privacy policy URL

4. **Upload APK/AAB**:
   - Recommended: AAB (Android App Bundle) untuk ukuran lebih kecil
   - Build AAB: **Build** → **Generate Signed Bundle / APK** → **Android App Bundle**

5. **Submit for review**

### Direct Distribution (APK)

Share APK file langsung:
1. Build release APK
2. Share file `app-release.apk`
3. Users install dengan enable **Install from Unknown Sources**

---

## 🔄 Update Workflow

Setelah update website:

### 1. **Approach 1: Hosted URL (Current)**
- Deploy ke Vercel seperti biasa
- APK akan otomatis load content terbaru
- ✅ **No need to rebuild APK**

### 2. **Approach 2: Static Files** (Future, jika perlu offline support)
- Update code
- Rebuild web: `npm run build`
- Sync to Android: `npm run cap:sync`
- Rebuild APK di Android Studio
- Distribute new APK

---

## 📚 Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

---

## ✅ Checklist untuk First Build

- [ ] Install Android Studio + SDK
- [ ] Install JDK 17
- [ ] Set environment variables (ANDROID_HOME, PATH)
- [ ] Verify installations: `npx cap doctor`
- [ ] Install dependencies: `npm install`
- [ ] Sync Capacitor: `npm run cap:sync`
- [ ] Open Android Studio: `npm run cap:open`
- [ ] Build debug APK
- [ ] Test di emulator/device
- [ ] Setup keystore untuk production
- [ ] Build release APK

---

## 💬 Support

Jika ada masalah atau pertanyaan:
1. Check troubleshooting section di atas
2. Check Capacitor docs: https://capacitorjs.com/docs
3. Check Android docs: https://developer.android.com

**Happy Building! 🚀**
