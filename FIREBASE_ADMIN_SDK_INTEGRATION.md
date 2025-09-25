# Firebase Admin SDK Integration Guide

## Overview

The Firebase Admin SDK has been successfully integrated into your SoulSeer platform, providing powerful server-side Firebase capabilities including user management, authentication verification, and database operations.

## 🔧 Setup Complete

### Files Added/Modified:

- ✅ `src/lib/firebase-admin.ts` - Firebase Admin SDK configuration and utilities
- ✅ `src/lib/firebase-auth-middleware.ts` - Middleware for Firebase authentication
- ✅ `src/lib/auth-server.ts` - Updated with `withAuth` and `withRole` wrappers
- ✅ `config/firebase-service-account.json` - Service account key (moved from root)
- ✅ `src/app/api/auth/firebase-sync/route.ts` - Updated to use token verification
- ✅ `src/app/api/admin/firebase/users/route.ts` - Admin user management endpoints
- ✅ `src/app/api/firebase-admin/test/route.ts` - Test endpoint for Firebase Admin
- ✅ `.env` - Updated with Firebase configuration variables

### Dependencies Added:

- ✅ `firebase-admin` - Firebase Admin SDK for Node.js

## 🚀 Available Features

### 1. **User Authentication & Verification**

```typescript
// Verify Firebase ID tokens server-side
const result = await FirebaseAdminService.verifyIdToken(idToken);

// Get user by UID
const userResult = await FirebaseAdminService.getUserByUid(uid);

// Get user by email
const userResult = await FirebaseAdminService.getUserByEmail(email);
```

### 2. **User Management**

```typescript
// Update user profile
await FirebaseAdminService.updateUser(uid, {
  displayName: "New Name",
  photoURL: "https://example.com/photo.jpg",
});

// Set custom claims for role-based access
await FirebaseAdminService.setCustomClaims(uid, { role: "admin" });

// Delete user
await FirebaseAdminService.deleteUser(uid);
```

### 3. **Custom Token Generation**

```typescript
// Generate custom tokens for server-side authentication
const tokenResult = await FirebaseAdminService.createCustomToken(uid, {
  customClaim: "value",
});
```

### 4. **Email Operations**

```typescript
// Generate email verification links
const linkResult = await FirebaseAdminService.generateEmailVerificationLink(
  email
);

// Generate password reset links
const resetResult = await FirebaseAdminService.generatePasswordResetLink(email);
```

### 5. **Batch Operations**

```typescript
// List all users with pagination
const usersResult = await FirebaseAdminService.listUsers(maxResults, pageToken);

// Get multiple users at once
const batchResult = await FirebaseAdminService.getUsers([
  { uid: "user1" },
  { email: "user2@example.com" },
]);
```

### 6. **Firestore Operations**

```typescript
// Create/update/delete documents
await FirebaseAdminService.createDocument("users", "docId", data);
await FirebaseAdminService.updateDocument("users", "docId", updates);
await FirebaseAdminService.deleteDocument("users", "docId");
```

## 🛡️ Security Features

### 1. **Middleware Protection**

```typescript
// Require Firebase authentication
export const POST = withFirebaseAuth(async (request, { firebaseUser }) => {
  // Your protected code here
});

// Optional Firebase authentication
export const GET = withOptionalFirebaseAuth(
  async (request, { firebaseUser, isAuthenticated }) => {
    // Your code with optional auth
  }
);
```

### 2. **Role-Based Access Control**

```typescript
// Traditional role-based protection
export const DELETE = withRole("ADMIN")(async (request, { user }) => {
  // Admin-only operations
});
```

## 📡 API Endpoints

### Authentication Endpoints

- **POST** `/api/auth/firebase-sync` - Sync Firebase user with database (requires Firebase ID token)

### Admin Endpoints (Requires Admin Role)

- **GET** `/api/admin/firebase/users` - List Firebase users
- **POST** `/api/admin/firebase/users` - Update user or set custom claims
- **DELETE** `/api/admin/firebase/users?uid=<uid>` - Delete user

### Test Endpoints

- **GET** `/api/firebase-admin/test` - Test Firebase Admin SDK initialization
- **POST** `/api/firebase-admin/test` - Test user operations

## 🔐 Environment Variables

Add these to your `.env` file:

```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID="agileflow-etv98"

# Firebase Client Configuration (already added)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyD6J3oE8GWlWE2Jc4sFoUeR9nYdLfC8vXw"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="agileflow-etv98.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="agileflow-etv98"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="agileflow-etv98.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="450928710947"
NEXT_PUBLIC_FIREBASE_APP_ID="1:450928710947:web:9fb31e4b6b4b1e4c8a7f2e"
```

## 🧪 Testing the Integration

### 1. Test Firebase Admin SDK Initialization

```bash
curl http://localhost:3000/api/firebase-admin/test
```

### 2. Test User Authentication

```javascript
// In your frontend, after Firebase sign-in:
const idToken = await user.getIdToken();
const response = await fetch("/api/auth/firebase-sync", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${idToken}`,
    "Content-Type": "application/json",
  },
});
```

## 🔄 Integration with Existing Auth System

The Firebase Admin SDK seamlessly integrates with your existing authentication system:

1. **Client-side**: Users sign in with Firebase (social login or email/password)
2. **Token Exchange**: Firebase ID tokens are sent to your API
3. **Server-side Verification**: Admin SDK verifies tokens and extracts user data
4. **Database Sync**: User data is synchronized with your Prisma database
5. **Session Management**: Your existing JWT system continues to work

## 📋 Best Practices

### 1. **Token Handling**

- Always verify Firebase ID tokens on the server
- Use short-lived tokens and refresh when needed
- Never trust client-side token claims

### 2. **Error Handling**

- Always handle Firebase Admin SDK errors gracefully
- Log errors for debugging but don't expose sensitive details
- Provide meaningful error messages to clients

### 3. **Security**

- Keep service account key secure (never commit to version control)
- Use role-based access control for admin operations
- Validate all input data before processing

## 🚨 Important Security Notes

1. **Service Account Key**: The `config/firebase-service-account.json` file contains sensitive credentials. Ensure it's:

   - Added to `.gitignore`
   - Secured in production environments
   - Rotated regularly

2. **Admin Operations**: All admin endpoints require proper authentication and role validation

3. **Token Validation**: All Firebase tokens are verified server-side before processing

## 🎯 Next Steps

1. **Test the integration** by starting your development server
2. **Try social login** from your frontend
3. **Monitor Firebase Console** for user activities
4. **Implement custom claims** for role-based access control
5. **Set up production environment** with proper security measures

The Firebase Admin SDK integration is now complete and ready for use! 🔥
