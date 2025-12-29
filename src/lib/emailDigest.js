/**
 * Email Digest System
 * Send automated email summaries and notifications
 */

import { getStatusLabel } from './statusUtils';

/**
 * Generate weekly admin digest
 */
export const generateAdminDigest = (aspirations, staff, period = 'week') => {
  const now = new Date();
  const periodStart = new Date();
  
  if (period === 'week') {
    periodStart.setDate(now.getDate() - 7);
  } else if (period === 'month') {
    periodStart.setMonth(now.getMonth() - 1);
  }

  // Filter aspirations from period
  const periodAspirations = aspirations.filter(asp => {
    const date = asp.created_at?.toDate ? asp.created_at.toDate() : new Date(asp.created_at);
    return date >= periodStart;
  });

  // Calculate stats
  const stats = {
    new: periodAspirations.length,
    pending: aspirations.filter(a => a.status === 'received' || a.status === 'verified').length,
    inProgress: aspirations.filter(a => a.status === 'process' || a.status === 'followed_up').length,
    finished: aspirations.filter(a => a.status === 'finished').length,
    needsAttention: aspirations.filter(a => {
      const age = now - (a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at));
      const daysSinceCreation = age / (1000 * 60 * 60 * 24);
      return a.status === 'received' && daysSinceCreation > 3;
    }).length
  };

  // Top categories
  const categoryCounts = {};
  periodAspirations.forEach(asp => {
    categoryCounts[asp.category] = (categoryCounts[asp.category] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Staff performance
  const staffStats = staff.map(s => ({
    name: s.displayName,
    assigned: aspirations.filter(a => a.assignedTo === s.uid).length,
    completed: aspirations.filter(a => a.assignedTo === s.uid && a.status === 'finished').length
  })).filter(s => s.assigned > 0);

  return {
    period,
    stats,
    topCategories,
    staffStats,
    urgentItems: aspirations.filter(a => a.tags?.includes('urgent')).slice(0, 5)
  };
};

/**
 * Generate admin digest HTML email
 */
export const generateAdminDigestHTML = (digestData) => {
  const { period, stats, topCategories, staffStats, urgentItems } = digestData;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Suara MPA - ${period === 'week' ? 'Weekly' : 'Monthly'} Digest</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #334155; background: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
        .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
        .content { padding: 32px; }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 32px; }
        .stat-card { background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; }
        .stat-value { font-size: 32px; font-weight: 800; color: #3b82f6; margin: 0; }
        .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; margin: 4px 0 0; }
        .section { margin-bottom: 32px; }
        .section-title { font-size: 18px; font-weight: 800; color: #1e293b; margin: 0 0 16px; }
        .list-item { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin-bottom: 8px; border-radius: 4px; }
        .list-item strong { color: #1e293b; }
        .urgent-badge { display: inline-block; background: #ef4444; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-left: 8px; }
        .footer { background: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #64748b; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 ${period === 'week' ? 'Weekly' : 'Monthly'} Digest</h1>
          <p>Suara MPA - ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        
        <div class="content">
          <!-- Stats -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${stats.new}</div>
              <div class="stat-label">Aspirasi Baru</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.pending}</div>
              <div class="stat-label">Pending</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.inProgress}</div>
              <div class="stat-label">Dalam Proses</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.finished}</div>
              <div class="stat-label">Selesai</div>
            </div>
          </div>

          ${stats.needsAttention > 0 ? `
          <div class="section">
            <div class="section-title">⚠️ Perlu Perhatian (${stats.needsAttention})</div>
            <p style="color: #64748b; font-size: 14px;">Aspirasi yang sudah lebih dari 3 hari tanpa respon</p>
          </div>
          ` : ''}

          ${urgentItems.length > 0 ? `
          <div class="section">
            <div class="section-title">🔥 Urgent Items</div>
            ${urgentItems.map(item => `
              <div class="list-item">
                <strong>${item.title}</strong>
                <span class="urgent-badge">Urgent</span>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">#${item.tracking_code}</div>
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${topCategories.length > 0 ? `
          <div class="section">
            <div class="section-title">📁 Top Kategori</div>
            ${topCategories.map(([cat, count]) => `
              <div class="list-item">
                <strong>${cat}</strong>  <span style="color: #3b82f6; font-weight: 600;">${count} aspirasi</span>
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${staffStats.length > 0 ? `
          <div class="section">
            <div class="section-title">👥 Staff Performance</div>
            ${staffStats.map(s => `
              <div class="list-item">
                <strong>${s.name}</strong><br>
                <span style="font-size: 12px; color: #64748b;">
                  ${s.assigned} assigned • ${s.completed} completed
                </span>
              </div>
            `).join('')}
          </div>
          ` : ''}

          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin" class="button">
              Buka Dashboard
            </a>
          </div>
        </div>

        <div class="footer">
          <p>Suara MPA HIMAKOM POLBAN</p>
          <p>Email otomatis • <a href="#">Unsubscribe</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate status update email for user
 */
export const generateStatusUpdateEmail = (aspiration, oldStatus, newStatus) => {
  const statusEmojis = {
    received: '📥',
    verified: '✅',
    process: '⚙️',
    followed_up: '🔄',
    finished: '🎉',
    rejected: '❌'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: sans-serif; line-height: 1.6; color: #334155; background: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .badge { display: inline-block; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 14px; }
        .badge-success { background: #10b981; color: white; }
        .code { font-family: monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${statusEmojis[newStatus]} Status Aspirasi Anda Diupdate</h2>
        <p>Aspirasi Anda telah diperbarui:</p>
        
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <strong>${aspiration.title}</strong><br>
          <span style="color: #64748b; font-size: 12px;">Tracking Code: <span class="code">${aspiration.tracking_code}</span></span>
        </div>

        <p>
          Status: <span class="badge badge-success">${getStatusLabel(newStatus)}</span>
        </p>

        ${aspiration.admin_response ? `
          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 16px 0;">
            <strong style="color: #1e40af;">Respon Admin:</strong><br>
            ${aspiration.admin_response}
          </div>
        ` : ''}

        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track/${aspiration.tracking_code}" class="button">
          Lihat Detail
        </a>

        <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
          Terima kasih telah menggunakan Suara MPA!<br>
          HIMAKOM POLBAN
        </p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send email digest
 */
export const sendEmailDigest = async (to, subject, html) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject,
        html
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to send digest:', error);
    return { success: false, error };
  }
};
