import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import validator from 'validator';

// Prevent static export of API routes
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { email, trackingCode } = await request.json();

    // Input validation
    if (!email || !trackingCode) {
      return NextResponse.json(
        { error: 'Email dan tracking code wajib diisi' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    // Validate tracking code format (MPA-XXXXXX)
    if (!/^MPA-[A-Z0-9]{6}$/.test(trackingCode)) {
      return NextResponse.json(
        { error: 'Format tracking code tidak valid' },
        { status: 400 }
      );
    }

    // Check if env variables are set
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_EMAIL_PASSWORD) {
      console.error('Missing email credentials in environment variables');
      return NextResponse.json(
        { error: 'Layanan email belum dikonfigurasi. Silakan hubungi administrator.' },
        { status: 503 }
      );
    }

    // Sanitize email to prevent injection
    const sanitizedEmail = validator.normalizeEmail(email, {
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
    });

    // Create transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASSWORD,
      },
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('Email transporter verification failed:', verifyError);
      return NextResponse.json(
        { error: 'Gagal menghubungkan ke server email. Silakan coba lagi nanti.' },
        { status: 503 }
      );
    }

    // Escape tracking code for safe display
    const safeTrackingCode = trackingCode.replace(/[<>"']/g, '');

    // Email content with sanitized data
    const mailOptions = {
      from: `"MPA Aspirasi" <${process.env.ADMIN_EMAIL}>`,
      to: sanitizedEmail,
      subject: `✅ Kode Tracking Aspirasi Anda - ${safeTrackingCode}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI',Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 30px; background: white; border-radius: 20px 20px 0 0; margin-top: -20px; box-shadow: 0 -10px 20px rgba(0,0,0,0.05); }
            .tracking-card { background: #f1f5f9; border: 2px solid #e2e8f0; padding: 30px; margin: 30px 0; text-align: center; border-radius: 16px; }
            .tracking-label { color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
            .tracking-code-display { font-size: 42px; font-weight: 900; color: #1e40af; letter-spacing: 4px; font-family: 'Courier New', Courier, monospace; margin: 10px 0; display: inline-block; padding: 10px 20px; background: white; border-radius: 8px; border: 1px solid #cbd5e1; }
            .copy-hint { color: #3b82f6; font-size: 12px; font-weight: 600; margin-top: 10px; }
            .footer { text-align: center; padding: 30px; color: #94a3b8; font-size: 12px; }
            .info-box { background: #eff6ff; border-radius: 12px; padding: 20px; margin-top: 20px; border: 1px solid #bfdbfe; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800;">✅ Aspirasi Diterima!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Kode tracking Anda telah siap</p>
            </div>
            
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 24px;">Halo,</p>
              <p style="font-size: 16px;">Aspirasi Anda telah berhasil kami terima. Silakan simpan kode tracking di bawah ini untuk memantau status tindak lanjut kami.</p>
              
              <div class="tracking-card">
                <div class="tracking-label">Kode Tracking Milik Anda</div>
                <div class="tracking-code-display">${safeTrackingCode}</div>
                <div class="copy-hint">💡 Tips: Simpan kode ini dengan aman</div>
              </div>
              
              <div class="info-box">
                <h4 style="margin:0 0 10px 0; color: #1e40af;">📌 Cara Melacak:</h4>
                <p style="margin:0; font-size: 14px; color: #334155;">Kunjungi website <strong>Suara MPA</strong>, pilih menu <strong>Cek Status</strong>, dan masukkan kode di atas untuk melihat respon tim kami secara real-time.</p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <p style="font-size: 14px; color: #64748b;">Aspirasi Anda sangat berharga bagi kemajuan kita bersama.</p>
              </div>
            </div>
            
            <div class="footer">
              <p>Email ini dikirim secara otomatis. Mohon tidak membalas email ini.</p>
              <p style="margin-top: 10px;">© ${new Date().getFullYear()} MPA HIMAKOM POLBAN</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Aspirasi Anda Telah Diterima!
============================

Halo, aspirasi Anda telah kami terima dengan baik.
Gunakan kode tracking di bawah ini untuk memantau status tindak lanjut:

KODE TRACKING: ${safeTrackingCode}

Simpan kode ini untuk digunakan pada menu "Cek Status" di website kami.

Terima kasih atas partisipasi Anda.

© ${new Date().getFullYear()} MPA HIMAKOM POLBAN
      `,
    };

    // Send email with timeout
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email timeout')), 10000)
    );

    await Promise.race([sendPromise, timeoutPromise]);

    return NextResponse.json({
      success: true,
      message: 'Email berhasil dikirim',
    });

  } catch (error) {
    console.error('Error sending email:', error);
    
    // Provide helpful error messages without exposing system details
    let errorMessage = 'Gagal mengirim email. Silakan coba lagi.';
    let statusCode = 500;
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Konfigurasi email salah. Silakan hubungi administrator.';
      statusCode = 503;
    } else if (error.code === 'ECONNECTION' || error.message === 'Email timeout') {
      errorMessage = 'Gagal terhubung ke server email. Silakan coba lagi.';
      statusCode = 503;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
