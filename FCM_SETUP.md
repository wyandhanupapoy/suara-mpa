# Firebase Cloud Messaging (FCM) Setup Guide

## Overview
This guide will help you set up Firebase Cloud Messaging for push notifications in the Suara MPA Android app.

## Prerequisites
- Firebase project already created ✅
- Capacitor Android platform installed ✅
- Android Studio installed

---

## Step 1: Enable FCM in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **Suara MPA**
3. Navigate to **Build > Cloud Messaging**
4. Click **Get Started** (if first time)
5. No additional configuration needed - FCM is enabled!

---

## Step 2: Install Capacitor Push Notifications Plugin

```bash
npm install @capacitor/push-notifications
npx cap sync
```

---

## Step 3: Update Android Configuration

### 3.1 Update `android/app/build.gradle`

Add FCM dependency:

```gradle
dependencies {
    // ... existing dependencies
    implementation 'com.google.firebase:firebase-messaging:23.1.0'
}
```

### 3.2 Update `AndroidManifest.xml`

Add permissions (already done if you followed Capacitor guide):

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
```

Add FCM service:

```xml
<application>
    <!-- ... existing config -->
    
    <service
        android:name="com.google.firebase.messaging.FirebaseMessagingService"
        android:exported="false">
        <intent-filter>
            <action android:name="com.google.firebase.MESSAGING_EVENT" />
        </intent-filter>
    </service>
</application>
```

---

## Step 4: Create Push Notification Utility

Create `src/lib/pushNotifications.js`:

```javascript
import { PushNotifications } from '@capacitor/push-notifications';
import { isPlatform } from './capacitor';

export const initPushNotifications = async () => {
  if (!isPlatform('android')) {
    console.log('Push notifications only work on Android');
    return;
  }

  // Request permission
  let permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== 'granted') {
    throw new Error('User denied permissions!');
  }

  await PushNotifications.register();
};

export const setupPushListeners = () => {
  // On registration success
  PushNotifications.addListener('registration', (token) => {
    console.log('Push registration success, token: ' + token.value);
    // TODO: Send token to backend to save
  });

  // On registration error
  PushNotifications.addListener('registrationError', (error) => {
    console.error('Error on registration: ' + JSON.stringify(error));
  });

  // On notification received (app in foreground)
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push received: ' + JSON.stringify(notification));
    // Show local notification or update UI
  });

  // On notification action performed (user clicked)
  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Push action performed: ' + JSON.stringify(notification));
    // Navigate to specific page based on notification data
  });
};
```

---

## Step 5: Initialize in App

Update your main `page.js` or `_app.js`:

```javascript
import { useEffect } from 'react';
import { initPushNotifications, setupPushListeners } from '@/lib/pushNotifications';

export default function App() {
  useEffect(() => {
    // Setup push notifications
    setupPushListeners();
    
    // Request permission on app start
    if (typeof window !== 'undefined') {
      initPushNotifications().catch(console.error);
    }
  }, []);

  return (
    // ... your app
  );
}
```

---

## Step 6: Send Test Notification

### Via Firebase Console (Manual)

1. Go to Firebase Console > Cloud Messaging
2. Click **Send your first message**
3. Enter notification title and text
4. Click **Send test message**
5. Enter your FCM token (from console logs)
6. Click **Test**

### Via Backend API (Programmatic)

Create `src/app/api/send-push/route.js`:

```javascript
import admin from 'firebase-admin';

export async function POST(request) {
  const { token, title, body, data } = await request.json();

  const message = {
    notification: {
      title,
      body
    },
    data,
    token
  };

  try {
    const response = await admin.messaging().send(message);
    return Response.json({ success: true, messageId: response });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

---

## Step 7: Testing

### On Android Emulator:
1. Run `npm run android:dev`
2. Open Android Studio
3. Build and run on emulator
4. Check logcat for FCM token
5. Send test notification via Firebase Console

### On Physical Device:
1. Build APK: `npm run android:build`
2. Install on device
3. Grant notification permission
4. Test notifications

---

## Notification Types to Implement

### 1. Status Update
```javascript
{
  title: "Status Update",
  body: "Your aspiration has been updated to: In Progress",
  data: {
    type: "status_update",
    aspirationId: "abc123",
    status: "process"
  }
}
```

### 2. New Comment
```javascript
{
  title: "New Comment",
  body: "Admin replied to your aspiration",
  data: {
    type: "new_comment",
    aspirationId: "abc123",
    commentId: "xyz789"
  }
}
```

### 3. Assignment (Staff Only)
```javascript
{
  title: "New Assignment",
  body: "You have been assigned a new aspiration",
  data: {
    type: "assignment",
    aspirationId: "abc123"
  }
}
```

---

## Best Practices

✅ **Always request permission explicitly**
✅ **Handle notification clicks properly**
✅ **Don't spam users - respect preferences**
✅ **Test on real devices, not just emulator**
✅ **Provide opt-out in settings**
✅ **Use notification channels (Android 8+)**

---

## Troubleshooting

### Token not generated?
- Check internet connection
- Ensure FCM is enabled in Firebase
- Check for errors in logcat
- Reinstall app and clear cache

### Notifications not appearing?
- Check notification permission granted
- Verify token is saved to backend
- Check notification settings on device
- Test with Firebase Console first

### App crashes on notification click?
- Check deep link handling
- Verify notification data structure
- Handle null cases properly

---

## Cost

**FREE!** ✅
- Unlimited notifications
- No message limit
- No expiration

---

## Security

- Never expose FCM Server Key publicly
- Use Firebase Admin SDK on backend
- Validate notification payloads
- Rate limit notification sending

---

## Next Steps

1. Complete FCM setup
2. Integrate with notification preferences
3. Implement backend notification triggers
4. Test thoroughly on multiple devices
5. Deploy to production

---

**Setup Time**: ~30 minutes  
**Difficulty**: Medium  
**Priority**: High (for Android app)

Ready to go! 🚀
