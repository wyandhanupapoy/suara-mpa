import { NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import crypto from 'crypto';

// Prevent static export of API routes
export const dynamic = 'force-dynamic';

// Initialize Firebase (server-side)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Hash IP for privacy
function hashIP(ip) {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

export async function POST(request) {
  try {
    const { ip, appId = 'mpa-himakom', category } = await request.json();
    
    if (!ip) {
      return NextResponse.json(
        { error: 'IP address is required' },
        { status: 400 }
      );
    }

    const ipHash = hashIP(ip);

    try {
      // Get admin settings for cooldown configuration
      const settingsRef = doc(db, 'artifacts', appId, 'admin', 'settings');
      const settingsSnap = await getDoc(settingsRef);
      
      const settings = settingsSnap.exists() 
        ? settingsSnap.data() 
        : { 
            cooldown_days: 7, 
            cooldown_enabled: true,
            max_aspirations_per_period: 1,
            allowed_categories: ['Akademik', 'Organisasi', 'Fasilitas', 'Kebijakan', 'Lainnya']
          };

      // If cooldown is disabled, allow submission
      if (!settings.cooldown_enabled) {
        return NextResponse.json({
          allowed: true,
          message: 'Cooldown disabled'
        });
      }

      // Check if category is allowed
      if (category && settings.allowed_categories) {
        if (!settings.allowed_categories.includes(category)) {
          return NextResponse.json({
            allowed: false,
            message: 'Category not allowed',
            error: `Kategori "${category}" tidak diizinkan saat ini`
          });
        }
      }

      // Check if IP is whitelisted
      const ipTrackingRef = doc(db, 'artifacts', appId, 'ip_tracking', ipHash);
      const ipTrackingSnap = await getDoc(ipTrackingRef);

      if (ipTrackingSnap.exists()) {
        const ipData = ipTrackingSnap.data();
        
        // Check whitelist
        if (ipData.is_whitelisted) {
          return NextResponse.json({
            allowed: true,
            message: 'IP whitelisted'
          });
        }

        // Check submission count in current period
        const lastSubmission = ipData.last_submission_at?.toDate() || null;
        if (lastSubmission) {
          const cooldownMs = settings.cooldown_days * 24 * 60 * 60 * 1000;
          const timeSinceLastSubmission = Date.now() - lastSubmission.getTime();
          
          // If still in cooldown period, check submission count
          if (timeSinceLastSubmission < cooldownMs) {
            const submissionCount = ipData.submission_count_in_period || 0;
            const maxSubmissions = settings.max_aspirations_per_period || 1;
            
            if (submissionCount >= maxSubmissions) {
              const timeRemaining = cooldownMs - timeSinceLastSubmission;
              const daysRemaining = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));
              const hoursRemaining = Math.ceil(timeRemaining / (60 * 60 * 1000));
              
              return NextResponse.json({
                allowed: false,
                message: 'Max submissions reached',
                timeRemaining,
                daysRemaining,
                hoursRemaining,
                submissionCount,
                maxSubmissions,
                lastTrackingCode: ipData.last_tracking_code,
                lastSubmissionAt: lastSubmission.toISOString(),
                nextAllowedAt: new Date(lastSubmission.getTime() + cooldownMs).toISOString()
              });
            }
          }
        }
      }

      // IP can submit
      return NextResponse.json({
        allowed: true,
        message: 'Submission allowed'
      });

    } catch (firestoreError) {
      // Handle Firestore permission errors
      if (firestoreError.code === 'permission-denied') {
        console.error('Firestore permission denied - rules not deployed');
        // Allow submission but warn the user
        return NextResponse.json({
          allowed: true,
          message: 'Cooldown check skipped',
          warning: 'FIRESTORE_RULES_NOT_DEPLOYED',
          warningMessage: 'Firestore rules belum di-deploy. Cooldown disabled sementara.'
        });
      }
      throw firestoreError;
    }

  } catch (error) {
    console.error('Error checking cooldown:', error);
    return NextResponse.json(
      { error: 'Failed to check cooldown', details: error.message },
      { status: 500 }
    );
  }
}
