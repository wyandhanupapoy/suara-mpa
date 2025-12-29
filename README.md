# 🎯 Suara MPA - HIMAKOM POLBAN

Platform Aspirasi digital untuk Mahasiswa Politeknik Negeri Bandung. Dibangun dengan Next.js dan Firebase, kini tersedia untuk **Web** dan **Android**!

---

## 🌟 Features

- ✅ **Submission Aspirasi Anonim** dengan tracking code
- ✅ **Admin Dashboard** untuk mengelola aspirasi
- ✅ **Real-time Updates** dengan Firebase Firestore
- ✅ **Email Notifications** otomatis ke peng-submit
- ✅ **IP-based Cooldown** untuk mencegah spam
- ✅ **Multi-platform**: Web dan Android
- ✅ **Security Headers** & Rate Limiting
- ✅ **Responsive Design** - mobile dan desktop friendly

---

## 🚀 Platforms

### 🌐 Web Version
Deploy di: [https://suara-mpa.vercel.app](https://suara-mpa.vercel.app)

### 📱 Android Version
Build as native Android APK dengan Capacitor.
👉 **[Lihat Android Build Guide](./ANDROID_BUILD.md)**

---

## 📋 Quick Start - Development

### Prerequisites

- Node.js 18+ dan npm
- Firebase project (sudah dikonfigurasi)
- Email account untuk notifications (Gmail)

### Installation

1. **Clone repository**:
   ```bash
   git clone <repository-url>
   cd suara-mpa
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` dan isi dengan credentials yang benar:
   ```env
   # Firebase Config
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   # ... dst

   # Email Config
   ADMIN_EMAIL=your-gmail@gmail.com
   ADMIN_EMAIL_PASSWORD=your-app-specific-password
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Open browser**: [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Build & Deploy

### Web (Vercel)

```bash
# Build production
npm run build

# Start production server locally
npm run start

# Deploy ke Vercel
vercel --prod
```

### Android

Lihat **[ANDROID_BUILD.md](./ANDROID_BUILD.md)** untuk panduan lengkap.

Quick commands:
```bash
# Sync web changes to Android
npm run cap:sync

# Open Android Studio
npm run cap:open

# atau gunakan shortcut
npm run android:build
```

---

## 📂 Project Structure

```
suara-mpa/
├── src/
│   ├── app/
│   │   ├── api/              # API routes (server-side)
│   │   │   ├── check-cooldown/
│   │   │   ├── get-ip/
│   │   │   └── send-email/
│   │   ├── page.js           # Main page component
│   │   ├── layout.js         # Root layout
│   │   └── globals.css       # Global styles
│   ├── lib/
│   │   ├── firebase.js       # Firebase config
│   │   └── capacitor.js      # Platform detection utilities
│   └── middleware.js         # Rate limiting & security
├── public/                   # Static files
│   ├── Logo_MPA.png
│   └── Logo_HIMAKOM.png
├── android/                  # Android native project (Capacitor)
├── capacitor.config.json     # Capacitor configuration
├── next.config.mjs           # Next.js configuration
├── firestore.rules           # Firestore security rules
├── ANDROID_BUILD.md          # Android build guide
├── SECURITY.md               # Security documentation
└── FIRESTORE_RULES_GUIDE.md  # Firestore rules guide
```

---

## ⚙️ Configuration

### Firebase Setup

1. Create Firebase project di [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Deploy security rules dari `firestore.rules`
4. Copy config ke `.env.local`

### Email Notifications

Gunakan Gmail dengan App-Specific Password:

1. Enable 2-Factor Authentication di Google Account
2. Generate App Password: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Paste password ke `ADMIN_EMAIL_PASSWORD` di `.env.local`

---

## 🔒 Security Features

- **Rate Limiting**: Protect API endpoints dari spam
- **CSRF Protection**: Validate origin untuk POST requests
- **Security Headers**: CSP, XSS Protection, Frame Options, dll
- **Input Validation**: Sanitize semua user inputs
- **IP Hashing**: Privacy-preserving cooldown system
- **Environment Variables**: Semua credentials di `.env.local` (never committed)

Lihat [SECURITY.md](./SECURITY.md) untuk detail.

---

## 📱 Platform Detection

Aplikasi ini support web dan mobile dengan conditional features:

```javascript
import { isMobile, isAndroid, isIOS, getPlatform } from '@/lib/capacitor';

if (isMobile()) {
  // Gunakan native features
} else {
  // Web-only features
}
```

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework dengan App Router
- **React 19** - UI library
- **Tailwind CSS 4** - Utility-first CSS
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Serverless functions
- **Firebase Firestore** - NoSQL database
- **Nodemailer** - Email sending
- **rate-limiter-flexible** - Rate limiting

### Mobile
- **Capacitor** - Native container untuk web apps
- **Android SDK** - Android development

### Deployment
- **Vercel** - Web hosting
- **Android APK** - Mobile distribution

---

## 👥 Admin Access

Default admin credentials:
- **Username**: `admin`
- **Password**: `admin123`

> ⚠️ **IMPORTANT**: Ubah credentials ini setelah deploy pertama kali!

---

## 📄 Additional Documentation

- 📱 **[Android Build Guide](./ANDROID_BUILD.md)** - Cara build APK
- 🔒 **[Security Guide](./SECURITY.md)** - Security best practices
- 🔥 **[Firestore Rules Guide](./FIRESTORE_RULES_GUIDE.md)** - Database security
- ⚠️ **[Known Warnings](./KNOWN_WARNINGS.md)** - Expected warnings yang bisa diabaikan

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📊 Scripts Reference

```bash
# Development
npm run dev                 # Start dev server

# Production Build
npm run build              # Build for production
npm run start              # Start production server

# Capacitor/Android
npm run cap:add            # Add Android platform (first time only)
npm run cap:sync           # Sync web code to Android
npm run cap:open           # Open Android Studio
npm run android:dev        # Start dev server for Android testing
npm run android:build      # Sync + Open Android Studio
```

---

## 📝 License

© 2024 MPA HIMAKOM POLBAN. All rights reserved.

---

## 🆘 Support

Untuk masalah atau pertanyaan:
- Web deployment: Check Vercel logs
- Android build: Lihat [ANDROID_BUILD.md](./ANDROID_BUILD.md) troubleshooting section
- Firebase: Check Firestore rules dan security settings

---

**Built with ❤️ by MPA HIMAKOM POLBAN**
