import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  // Remove any HTML tags and sanitize
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
  });
  
  // Trim whitespace
  return sanitized.trim();
}

/**
 * Sanitize HTML content (for display purposes)
 * @param {string} html - The HTML string to sanitize
 * @returns {string} - Sanitized HTML
 */
export function sanitizeHTML(html) {
  if (typeof html !== 'string') return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  });
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return validator.isEmail(email);
}

/**
 * Validate and sanitize aspiration form data
 * @param {object} data - Form data object
 * @returns {object} - Object with isValid flag and sanitized data or errors
 */
export function validateAspirationData(data) {
  const errors = [];
  const sanitized = {};

  // Validate category
  const validCategories = ['Akademik', 'Organisasi', 'Fasilitas', 'Kebijakan', 'Lainnya'];
  if (!data.category || !validCategories.includes(data.category)) {
    errors.push('Kategori tidak valid');
  } else {
    sanitized.category = data.category;
  }

  // Validate and sanitize title
  if (!data.title || typeof data.title !== 'string') {
    errors.push('Judul tidak boleh kosong');
  } else {
    const title = sanitizeInput(data.title);
    if (title.length < 5) {
      errors.push('Judul minimal 5 karakter');
    } else if (title.length > 200) {
      errors.push('Judul maksimal 200 karakter');
    } else {
      sanitized.title = title;
    }
  }

  // Validate and sanitize message
  if (!data.message || typeof data.message !== 'string') {
    errors.push('Pesan tidak boleh kosong');
  } else {
    const message = sanitizeInput(data.message);
    if (message.length < 10) {
      errors.push('Pesan minimal 10 karakter');
    } else if (message.length > 2000) {
      errors.push('Pesan maksimal 2000 karakter');
    } else {
      sanitized.message = message;
    }
  }

  // Validate image (optional)
  if (data.image) {
    if (typeof data.image !== 'string') {
      errors.push('Format gambar tidak valid');
    } else if (data.image.length > 3000000) { // ~2MB base64
      errors.push('Ukuran gambar terlalu besar (maksimal 2MB)');
    } else if (!data.image.startsWith('data:image/')) {
      errors.push('Format gambar tidak valid');
    } else {
      sanitized.image = data.image;
    }
  }

  return {
    isValid: errors.length === 0,
    data: sanitized,
    errors,
  };
}

/**
 * Format date safely
 * @param {Date|Timestamp} timestamp - Date object or Firestore timestamp
 * @returns {string} - Formatted date string
 */
export function formatDate(timestamp) {
  try {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    if (isNaN(date.getTime())) return '-';
    
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
}

/**
 * Escape special characters for safe display
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
export function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return str.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Generate a secure random tracking code
 * @returns {string} - Tracking code (MPA-XXXXXX format)
 */
export function generateTrackingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars
  let result = 'MPA-';
  
  // Use crypto for better randomness if available
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(6);
    crypto.getRandomValues(array);
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(array[i] % chars.length);
    }
  } else {
    // Fallback to Math.random
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  
  return result;
}

/**
 * Hash IP address for privacy
 * @param {string} ip - IP address
 * @returns {string} - Hashed IP (simple client-side hash)
 */
export function hashIP(ip) {
  if (typeof ip !== 'string') return 'unknown';
  
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16);
}

/**
 * Safe JSON parse
 * @param {string} json - JSON string
 * @param {any} defaultValue - Default value if parse fails
 * @returns {any} - Parsed object or default value
 */
export function safeJSONParse(json, defaultValue = null) {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('JSON parse error:', error);
    return defaultValue;
  }
}
