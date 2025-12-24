const nodemailer = require('nodemailer');
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, trackingCode } = await request.json();

    if (!email || !trackingCode) {
      return NextResponse.json(
        { error: 'Email and tracking code are required' },
        { status: 400 }
      );
    }

    // Check if env variables are set
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_EMAIL_PASSWORD) {
      console.error('Missing email credentials in environment variables');
      return NextResponse.json(
        { error: 'Email service not configured. Please contact administrator.' },
        { status: 503 }
      );
    }

    // Create transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASSWORD
      }
    });

    // Verify transporter configuration
    await transporter.verify();

    // Email content
    const mailOptions = {
      from: `"MPA Aspirasi" <${process.env.ADMIN_EMAIL}>`,
      to: email,
      subject: `✅ Kode Tracking Aspirasi Anda - ${trackingCode}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .tracking-code { background: white; border: 2px dashed #3b82f6; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
            .tracking-code-text { font-size: 32px; font-weight: bold; color: #1e3a8a; letter-spacing: 2px; font-family: monospace; }
            .info-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🎯 Aspirasi Anda Telah Diterima!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Terima kasih telah menyampaikan aspirasi Anda</p>
            </div>
            
            <div class="content">
              <p>Halo,</p>
              <p>Aspirasi Anda telah berhasil dikirim dan kami telah menerimanya. Gunakan kode tracking di bawah ini untuk memantau status aspirasi Anda.</p>
              
              <div class="tracking-code">
                <p style="margin: 0 0 10px 0; color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">Kode Tracking Anda</p>
                <div class="tracking-code-text">${trackingCode}</div>
              </div>
              
              <div class="info-box">
                <strong>📌 Cara Menggunakan Kode Tracking:</strong>
                <ol style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Kunjungi website kami</li>
                  <li>Klik menu "Cek Status"</li>
                  <li>Masukkan kode tracking di atas</li>
                  <li>Lihat status dan tanggapan dari tim kami</li>
                </ol>
              </div>
              
              <div style="text-align: center; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; color: #64748b;">Simpan kode ini dengan baik</p>
              </div>
              
              <div class="info-box" style="background: #fef3c7; border-color: #f59e0b;">
                <strong>⚠️ Penting:</strong>
                <p style="margin: 5px 0 0 0;">Kode tracking ini bersifat rahasia dan hanya Anda yang memilikinya. Jangan bagikan kode ini kepada siapa pun.</p>
              </div>
            </div>
            
            <div class="footer">
              <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
              <p style="margin: 5px 0; color: #94a3b8;">© ${new Date().getFullYear()} MPA Aspirasi. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Aspirasi Anda Telah Diterima!

Kode Tracking Anda: ${trackingCode}

Gunakan kode ini untuk memantau status aspirasi Anda di website kami.

Cara menggunakan:
1. Kunjungi website kami
2. Klik menu "Cek Status"
3. Masukkan kode tracking
4. Lihat status dan tanggapan

Simpan kode ini dengan baik. Jangan bagikan kepada siapa pun.

---
Email otomatis - Jangan balas email ini
© ${new Date().getFullYear()} MPA Aspirasi
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to send email';
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check your email credentials. Make sure you use an App Password.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Could not connect to email server. Please check your internet connection or email provider.';
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: error.message,
        code: error.code,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
