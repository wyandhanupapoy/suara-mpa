'use client';

import React, { useState } from 'react';
import { Share2, MessageCircle, Check, Copy } from 'lucide-react';

export default function WhatsAppShare({ aspiration, type = 'tracking' }) {
  const [copied, setCopied] = useState(false);

  const generateMessage = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    switch (type) {
      case 'tracking':
        return `*Suara MPA - Tracking Code*\n\nAspirasi Anda telah diterima!\n\n📋 Tracking Code: *${aspiration.tracking_code}*\n🔗 Track: ${baseUrl}/track/${aspiration.tracking_code}\n\nGunakan kode di atas untuk melacak status aspirasi Anda.`;
      
      case 'status_update':
        return `*Suara MPA - Update Status*\n\n📋 ${aspiration.title}\n📍 Tracking: ${aspiration.tracking_code}\n✅ Status: ${aspiration.status}\n\n🔗 Detail: ${baseUrl}/track/${aspiration.tracking_code}`;
      
      case 'share':
        return `*Lihat Aspirasi ini!*\n\n${aspiration.title}\n\n🔗 ${baseUrl}/aspirations/${aspiration.id}`;
      
      default:
        return `Suara MPA: ${aspiration.title}`;
    }
  };

  const getWhatsAppUrl = (phoneNumber = '') => {
    const message = generateMessage();
    const encodedMessage = encodeURIComponent(message);
    
    if (phoneNumber) {
      // Format Indonesian number: remove leading 0, add 62
      const formatted = phoneNumber.startsWith('0') 
        ? '62' + phoneNumber.substring(1)
        : phoneNumber;
      return `https://wa.me/${formatted}?text=${encodedMessage}`;
    }
    
    // Open WhatsApp without specific number
    return `https://wa.me/?text=${encodedMessage}`;
  };

  const handleCopyMessage = () => {
    const message = generateMessage();
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    window.open(getWhatsAppUrl(), '_blank');
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 
                 text-white font-bold rounded-lg transition-all shadow-lg"
        title="Share via WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="hidden sm:inline">WhatsApp</span>
      </button>

      <button
        onClick={handleCopyMessage}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 
                 text-gray-700 font-medium rounded-lg transition-all border border-gray-200"
        title="Copy message"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-600">Copied!</span>
          </>
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
