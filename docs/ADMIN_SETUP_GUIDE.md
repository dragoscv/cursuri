# Admin Setup Guide - Cursuri Platform

## Overview
This guide explains how to set up admin access for the Cursuri platform and troubleshoot common permission issues.

## Prerequisites
- Node.js installed
- Firebase project configured
- Admin credentials file located at `.credentials/admin.json`

## Quick Setup

### 1. Set Admin Role in Firestore

To grant admin access to a user, run the setup script:

```bash
node scripts/update-role-to-admin.cjs
```

This script will:
- Update the user's role to `admin` in Firestore
- Set custom claims in Firebase Authentication
- Mark the user as active

### 2. Verify Admin Credentials

The admin credentials are stored in `.credentials/admin.json`:

```json
{
  "email": "admin@cursuri-platform.com",
  "password": "ahfpYGxJPcXHUIm0",
  "uid": "4IlfFMDBv9VqDCqEy4CL1eh7fcv1",
  "role": "admin"
}
```

### 3. Login with Admin Account

1. Navigate to the login page
2. Use the email and password from `.credentials/admin.json`
3. The system will automatically detect admin privileges

## Troubleshooting Permission Errors

### Error: "FirebaseError: Missing or insufficient permissions"

This error occurs when:
1. User is not logged in
2. User doesn't have admin role in Firestore
3. Firestore security rules are preventing access

**Solution:**

1. **Check if logged in:**
   - Open browser console
   - Check for authentication state
   - Verify user object has data

2. **Verify Firestore role:**
   ```bash
   # Use Firebase Console or run verification script
   node scripts/check-admin-role.cjs
   ```

3. **Update role if needed:**
   ```bash
   node scripts/update-role-to-admin.cjs
   ```

4. **Check Firestore rules:**
   - Open `firestore.rules`
   - Verify `isAdmin()` function exists
   - Ensure courses collection allows write for admins

### Error: "Content Security Policy directive violated"

This error is caused by browser security policies blocking scripts.

**Solution:**

The CSP headers have been configured in `next.config.js` to allow:
- Google Analytics scripts
- Firebase connections
- Web workers (blob:)
- YouTube/Vimeo embeds

If you still see CSP errors:
1. Check `next.config.js` headers configuration
2. Verify middleware isn't overriding CSP headers
3. Clear browser cache and reload

## Firestore Security Rules

Admin access is controlled by Firestore rules in `firestore.rules`:

```javascript
function isAdmin() {
  return request.auth != null && 
         exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin'] &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isActive == true;
}

match /courses/{courseId} {
  allow read: if true;
  allow write: if isAdmin();
}
```

## Admin User Structure in Firestore

Admin users must have the following structure in the `users` collection:

```json
{
  "uid": "user-uid-here",
  "email": "admin@example.com",
  "role": "admin",
  "isActive": true,
  "permissions": {
    "canManageCourses": true,
    "canManageUsers": true,
    "canManagePayments": true,
    "canViewAnalytics": true,
    "canManageSettings": false
  },
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

## Creating Additional Admin Users

### Option 1: Using Script (Recommended)

1. Update `.credentials/admin.json` with new user's UID
2. Run: `node scripts/update-role-to-admin.cjs`

### Option 2: Manual Firestore Update

1. Go to Firebase Console → Firestore Database
2. Navigate to `users` collection
3. Find user document by UID
4. Add/update fields:
   - `role`: "admin"
   - `isActive`: true
   - `permissions`: (object with permissions)

### Option 3: Admin UI (Future)

An admin user management interface will be added to allow super admins to promote users through the UI.

## Admin Routes Protection

All admin routes are protected with the `AdminGuard` component:

```tsx
import AdminGuard from '@/components/Admin/AdminGuard';

export default function AdminPage() {
  return (
    <AdminGuard>
      {/* Admin content here */}
    </AdminGuard>
  );
}
```

The guard will:
- Show loading state while checking permissions
- Redirect unauthenticated users to home
- Show error message for non-admin users
- Render admin content for authorized users

## Environment Variables

Ensure these environment variables are set in `.env.local`:

```bash
# Firebase Admin SDK (for server-side operations)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Firebase Client SDK (for browser)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Testing Admin Access

1. **Login with admin credentials**
2. **Navigate to admin pages:**
   - `/admin` - Admin dashboard
   - `/admin/courses` - Course management
   - `/admin/courses/add` - Add new course
   - `/admin/analytics` - Analytics dashboard

3. **Verify permissions:**
   - Can create courses
   - Can edit courses
   - Can delete courses
   - Can manage users
   - Can view analytics

## Common Issues

### Issue: Admin routes return 404

**Solution:** Ensure the admin pages exist in `app/admin/` directory

### Issue: Can't create courses (permission denied)

**Solution:** 
1. Check Firestore rules
2. Verify admin role is set
3. Check browser console for detailed error

### Issue: Changes not reflecting

**Solution:**
1. Clear browser cache
2. Sign out and sign in again
3. Force refresh custom claims

## Security Best Practices

1. **Never commit `.credentials/admin.json` to git** (already in .gitignore)
2. **Use strong passwords** for admin accounts
3. **Rotate admin passwords** regularly
4. **Monitor admin activities** through analytics
5. **Use `super_admin` role** for sensitive operations
6. **Enable 2FA** for admin accounts (future feature)

## Support

If you encounter issues not covered in this guide:

1. Check browser console for detailed errors
2. Review Firestore rules in Firebase Console
3. Verify user document structure in Firestore
4. Check application logs for authentication errors

## Related Documentation

- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Role-Based Access Control](./docs/RBAC_IMPLEMENTATION.md)
- [API Security](./docs/API_SECURITY_IMPLEMENTATION.md)
- [Admin Architecture](./docs/PROJECT_ANALYSIS_COMPREHENSIVE_2025-10-15.md)
