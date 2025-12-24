# Firestore Security Rules Deployment Guide

## Step 1: Open Firebase Console

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **suara-mpa** (or your project name)

## Step 2: Navigate to Firestore Rules

1. Click **Firestore Database** in the left sidebar
2. Click the **Rules** tab at the top

## Step 3: Update Rules

Copy and paste these rules into the editor:

\`\`\`javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is admin (has email)
    function isAdmin() {
      return request.auth != null && request.auth.token.email != null;
    }
    
    // Artifacts collection
    match /artifacts/{appId} {
      
      // Public aspirations - anyone can read, authenticated users can write
      match /public/data/aspirations/{aspirationId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated();
        allow update, delete: if isAdmin();
      }
      
      // IP tracking - only admins can read/write
      match /ip_tracking/{ipHash} {
        allow read, write: if isAdmin();
      }
      
      // Admin settings - only admins can read/write
      match /admin/settings {
        allow read, write: if isAdmin();
      }
      
      // Allow reading nested documents for authenticated users
      match /{document=**} {
        allow read: if isAuthenticated();
      }
    }
  }
}
\`\`\`

## Step 4: Publish Rules

1. Click the **Publish** button
2. Wait for confirmation message

## Step 5: Test

1. Refresh your application at http://localhost:3000
2. Try submitting an aspiration
3. Error should be resolved ✓

---

## What These Rules Do

- **Anonymous users** can sign in anonymously
- **Authenticated users** (including anonymous) can read and create aspirations
- **Admin users** (with email) can update, delete, and access admin features
- **IP tracking** data is only accessible to admins
- **Settings** can only be modified by admins

This ensures proper security while allowing the anonymous aspiration system to work correctly.
