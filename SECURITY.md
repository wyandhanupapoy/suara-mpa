# Security Policy

## Keamanan Website Suara MPA

Dokumen ini menguraikan pedoman keamanan untuk website Suara MPA HIMAKOM.

## Pelaporan Kerentanan1. **Jangan** melaporkan kerentanan keamanan melalui issue publik di GitHub
2. Email langsung ke administrator: [admin-email@example.com]
3. Sertakan detail lengkap tentang kerentanan yang ditemukan
4. Berikan waktu reasonable (7-14 hari) sebelum public disclosure

## Praktik Keamanan yang Diterapkan

### 1. Environment Variables
- **JANGAN PERNAH** commit file `.env.local` atau `.env` ke Git
- Gunakan `.env.example` sebagai template
- Firebasekeys harus disimpan di environment variables
- Gmail App Password (bukan password biasa) untuk email service

### 2. Input Validation & Sanitization
- Semua user input di-sanitize menggunakan DOMPurify
- Email validation menggunakan library `validator`
- Tracking code format validation dengan regex  
- Image size limits (maksimal 2MB base64)

### 3. Rate Limiting
- API endpoints: 60 requests/menit
- Email sending: 3 requests/jam
- Form submissions: 10 requests/jam
- IP-based throttling

### 4. Security Headers
Aplikasi menggunakan security headers berikut:
- `Strict-Transport-Security`: Force HTTPS
- `X-Frame-Options: DENY`: Prevent clickjacking
- `X-Content-Type-Options: nosniff`: Prevent MIME sniffing
- `Content-Security-Policy`: Restrict resource loading
- `Referrer-Policy`: Control referrer information

### 5. CSRF Protection
- Origin validation untuk POST requests
- Same-origin policy enforcement
- Middleware validation di semua API routes

### 6. Firestore Security Rules
- Data structure validation
- Field type checking
- Size limits enforcement
- Role-based access control (admin vs user)

### 7. Error Handling
- Generic error messages untuk user
- Detailed logs untuk debugging (server-side only)
- No system information exposure di error responses

## Setup Keamanan untuk Developer

### Instalasi

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local dengan credentials Anda
# JANGAN commit file ini!
```

### Firebase Setup

1. Buat project di [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Anonymous)
3. Enable Firestore Database
4. Deploy Firestore Rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
5. Copy credentials ke `.env.local`

### Gmail App Password Setup

1. Enable 2-Factor Authentication di Google Account
2. Buka [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate App Password untuk "Mail"
4. Copy 16-character password ke `.env.local` sebagai `ADMIN_EMAIL_PASSWORD`

## Deployment Checklist

Sebelum deploy ke production, pastikan:

- [ ] Semua environment variables sudah diset di hosting platform (Vercel/Railway)
- [ ] Firestore rules sudah deployed
- [ ] `.env` files tidak ada di repository
- [ ] Security headers configured di `next.config.mjs`
- [ ] Rate limiting middleware active
- [ ] Email service tested dan working
- [ ] CSP policies tidak block required resources
- [ ] HTTPS enabled di production URL

## Monitoring & Maintenance

### Regular Checks
- Monitor Firebase usage dan costs
- Check error logs di Vercel dashboard
- Review Firestore security rules setiap 3 bulan
- Update dependencies (npm audit)
- Test rate limiting effectiveness

### Security Updates
- Segera update dependencies dengan security vulnerabilities
- Review dan update CSP policies sesuai kebutuhan
- Monitor failed authentication attempts
- Backup Firestore data secara berkala

## Kontak

Untuk pertanyaan terkait keamanan, hubungi:
- Email: [security-contact]
- Emergency: [emergency-contact]

---

**Last Updated**: 2025-12-27
**Security Version**: 1.0
