/**
 * Platform detection utilities for Capacitor
 * Detects if the app is running on web, Android, or iOS
 */

// Check if Capacitor is available
export function isCapacitor() {
  if (typeof window === 'undefined') return false;
  return !!(window.Capacitor);
}

// Check if running on Android
export function isAndroid() {
  if (typeof window === 'undefined') return false;
  return window.Capacitor?.getPlatform() === 'android';
}

// Check if running on iOS
export function isIOS() {
  if (typeof window === 'undefined') return false;
  return window.Capacitor?.getPlatform() === 'ios';
}

// Check if running on web (not in Capacitor)
export function isWeb() {
  if (typeof window === 'undefined') return true;
  return !isCapacitor();
}

// Get current platform
export function getPlatform() {
  if (typeof window === 'undefined') return 'server';
  if (isCapacitor()) {
    return window.Capacitor.getPlatform();
  }
  return 'web';
}

// Check if running on mobile (Android or iOS)
export function isMobile() {
  return isAndroid() || isIOS();
}

// Platform-specific feature availability checks
export const features = {
  // Check if native file system is available
  hasNativeFilesystem: () => isMobile(),
  
  // Check if native camera is available
  hasNativeCamera: () => isMobile(),
  
  // Check if native notifications are available
  hasNativeNotifications: () => isMobile(),
  
  // Check if push notifications are available
  hasPushNotifications: () => isMobile(),
};

// Helper to conditionally execute code based on platform
export function onPlatform(handlers) {
  const platform = getPlatform();
  
  if (handlers[platform]) {
    return handlers[platform]();
  }
  
  if (handlers.default) {
    return handlers.default();
  }
}

// Example usage:
// onPlatform({
//   android: () => console.log('Running on Android'),
//   ios: () => console.log('Running on iOS'),
//   web: () => console.log('Running on Web'),
//   default: () => console.log('Unknown platform')
// });
