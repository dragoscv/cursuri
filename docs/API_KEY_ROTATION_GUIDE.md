# API Key Rotation Guide

## Overview

This guide covers rotating all API keys for the cursuri platform: Firebase, Azure Blob Storage, and Stripe. Regular key rotation is a critical security practice.

**Frequency**: Rotate keys every 90 days or immediately if compromised.

---

## 🔥 Task 22: Firebase API Keys Rotation

### Prerequisites:

- Access to Firebase Console
- Firebase project: cursuri
- Admin permissions

### Step 1: Generate New Firebase Web App Config

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **cursuri**
3. Click gear icon (⚙️) → **Project Settings**
4. Scroll to **Your apps** section
5. Select your web app (or create new one if needed)
6. Under **SDK setup and configuration**, click **Config**
7. Copy the new configuration object

### Step 2: Update Environment Variables

Edit `.env.local`:

```bash
# Firebase Configuration (NEW KEYS)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy... (new key)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=cursuri-xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=cursuri-xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=cursuri-xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 3: Test Firebase Functionality

```powershell
# Start dev server
npm run dev

# Test in browser (http://localhost:33990):
# 1. User Registration
# 2. User Login
# 3. Firestore data read/write
# 4. Firebase Storage upload/download
# 5. Analytics tracking
```

### Step 4: Delete Old Firebase App (Optional)

1. In Firebase Console → Project Settings
2. Under **Your apps**, find old web app
3. Click **Delete app** (three dots menu)
4. Confirm deletion

**⚠️ Warning**: Only delete after verifying new keys work in all environments!

### Step 5: Update Production Environment

**Vercel**:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select **cursuri** project
3. Settings → Environment Variables
4. Update each Firebase variable with new values
5. Select **Production** scope
6. Click **Save**
7. Redeploy application

### Step 6: Verify Production

```powershell
# Test production deployment
# Visit: https://cursuri.vercel.app (or your domain)

# Test:
# 1. Login functionality
# 2. Course data loading
# 3. User profile access
# 4. Admin panel access
```

### Step 7: Document Rotation

Create entry in `docs/SECURITY.md`:

```markdown
## Firebase Key Rotation History

| Date       | Rotated By  | Reason             | Verified |
| ---------- | ----------- | ------------------ | -------- |
| 2025-10-21 | [Your Name] | Scheduled rotation | ✅       |
```

---

## ☁️ Task 23: Azure Blob Storage Keys Rotation

### Prerequisites:

- Access to Azure Portal
- Azure subscription with Storage Account
- Storage Account name: [your-storage-account]

### Step 1: Generate New Connection String

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Storage Accounts**
3. Select your storage account
4. In left menu: **Security + networking** → **Access keys**
5. Click **Rotate key** for key1 or key2
6. Copy the new **Connection string**

### Step 2: Update Environment Variables

Edit `.env.local`:

```bash
# Azure Blob Storage Configuration (NEW KEY)
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...;AccountKey=NEW_KEY;EndpointSuffix=core.windows.net
```

### Step 3: Test Azure Storage Functionality

```powershell
# Start dev server
npm run dev

# Test video upload:
# 1. Login as admin
# 2. Navigate to admin/courses/[courseId]/lessons
# 3. Upload a test video file
# 4. Verify video appears in lesson
# 5. Play video to confirm download works
```

### Step 4: Regenerate Storage Key

After verifying new connection string works:

1. In Azure Portal → Storage Account → Access keys
2. Click **Regenerate** on the old key
3. This invalidates the old key immediately

**⚠️ Important**: Update all environments before regenerating!

### Step 5: Update Production Environment

**Vercel**:

1. Vercel Dashboard → cursuri → Settings → Environment Variables
2. Update `AZURE_STORAGE_CONNECTION_STRING`
3. Scope: **Production**
4. Save and redeploy

### Step 6: Verify Production

Test video upload/download in production environment.

### Step 7: Document Rotation

Update `docs/SECURITY.md`:

```markdown
## Azure Storage Key Rotation History

| Date       | Key Rotated | Rotated By  | Verified |
| ---------- | ----------- | ----------- | -------- |
| 2025-10-21 | key1        | [Your Name] | ✅       |
```

---

## 💳 Task 24: Stripe API Keys Rotation

### Prerequisites:

- Access to Stripe Dashboard
- Stripe account for cursuri platform
- Both Test and Live mode access

### Step 1: Generate New Test Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Toggle to **Test mode** (top-right)
3. Click **Developers** → **API keys**
4. Under **Standard keys**, click **Create secret key**
5. Name: "cursuri-test-2025-10-21"
6. Copy the new **Secret key** (starts with `sk_test_`)
7. Copy the **Publishable key** (starts with `pk_test_`)

### Step 2: Update Test Environment Variables

Edit `.env.local`:

```bash
# Stripe Configuration - TEST MODE (NEW KEYS)
STRIPE_SECRET_KEY=sk_test_NEW_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_NEW_KEY_HERE
```

### Step 3: Test Stripe Functionality (Test Mode)

```powershell
# Start dev server
npm run dev

# Test payment flow:
# 1. Browse to a course
# 2. Click "Enroll" or "Purchase"
# 3. Use Stripe test card: 4242 4242 4242 4242
# 4. Expiry: Any future date (e.g., 12/26)
# 5. CVC: Any 3 digits (e.g., 123)
# 6. Verify payment succeeds
# 7. Verify enrollment is granted
```

### Step 4: Update Webhook Secret (Test)

1. Stripe Dashboard → Developers → Webhooks
2. Find your webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Click **...** → **Update endpoint**
4. Or create new endpoint if rotating
5. Copy the new **Signing secret** (starts with `whsec_`)

Edit `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_NEW_SECRET_HERE
```

### Step 5: Generate New Live Keys

**⚠️ Only after testing thoroughly in test mode!**

1. Stripe Dashboard → Toggle to **Live mode**
2. Developers → API keys
3. Create new secret key: "cursuri-live-2025-10-21"
4. Copy new **Secret key** (starts with `sk_live_`)
5. Copy **Publishable key** (starts with `pk_live_`)

### Step 6: Update Production Environment Variables

**Vercel Production**:

```bash
# Stripe Configuration - LIVE MODE
STRIPE_SECRET_KEY=sk_live_NEW_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_NEW_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_NEW_LIVE_SECRET_HERE
```

### Step 7: Update Live Webhook Secret

1. Stripe Dashboard (Live mode) → Developers → Webhooks
2. Update or create webhook: `https://cursuri.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy new signing secret
5. Update in Vercel production environment variables

### Step 8: Test Production Payment Flow

**⚠️ Use real payment method in live mode!**

1. Create test purchase with small amount
2. Verify payment processes correctly
3. Verify webhook receives event
4. Verify enrollment is granted
5. Request refund for test transaction

### Step 9: Delete Old Stripe Keys

1. Stripe Dashboard → Developers → API keys
2. Find old keys by name/date
3. Click **Delete** (trash icon)
4. Confirm deletion

**⚠️ Important**: Only delete after verifying new keys work in all environments!

### Step 10: Document Rotation

Update `docs/SECURITY.md`:

```markdown
## Stripe Key Rotation History

| Date       | Mode | Rotated By  | Verified |
| ---------- | ---- | ----------- | -------- |
| 2025-10-21 | Test | [Your Name] | ✅       |
| 2025-10-21 | Live | [Your Name] | ✅       |
```

---

## 📋 Complete Rotation Checklist

### Firebase:

- [ ] Generated new Firebase web app config
- [ ] Updated `.env.local` with new keys
- [ ] Tested authentication (register, login, logout)
- [ ] Tested Firestore read/write operations
- [ ] Tested Firebase Storage upload/download
- [ ] Updated Vercel production environment variables
- [ ] Deployed to production
- [ ] Verified production functionality
- [ ] Deleted old Firebase app (optional)
- [ ] Documented rotation in SECURITY.md

### Azure Blob Storage:

- [ ] Regenerated storage account key in Azure Portal
- [ ] Updated `.env.local` with new connection string
- [ ] Tested video upload functionality
- [ ] Tested video playback/download
- [ ] Updated Vercel production environment variables
- [ ] Deployed to production
- [ ] Verified production video functionality
- [ ] Regenerated old key (invalidated)
- [ ] Documented rotation in SECURITY.md

### Stripe:

- [ ] Generated new test mode secret key
- [ ] Generated new test mode publishable key
- [ ] Updated `.env.local` with new test keys
- [ ] Tested payment flow with test card
- [ ] Verified enrollment after test payment
- [ ] Updated test webhook secret
- [ ] Generated new live mode secret key
- [ ] Generated new live mode publishable key
- [ ] Updated Vercel production environment variables
- [ ] Updated live webhook secret
- [ ] Tested production payment (real transaction)
- [ ] Verified production enrollment
- [ ] Refunded test transaction
- [ ] Deleted old Stripe keys
- [ ] Documented rotation in SECURITY.md

---

## 🚨 Rollback Procedures

### If New Keys Don't Work:

**Firebase**:

1. Revert `.env.local` to old keys (keep backup!)
2. Restart dev server
3. Keep old Firebase app active until resolved

**Azure**:

1. Use the other key (key1 or key2) - both are active
2. Revert connection string in `.env.local`
3. Restart dev server

**Stripe**:

1. Old keys remain active until deleted
2. Revert to old keys in environment variables
3. Redeploy if necessary
4. Investigate issue before trying again

---

## 📚 Security Best Practices

1. **Never commit keys to version control**
   - Always use `.env.local` (gitignored)
   - Use environment variables in all environments

2. **Rotate keys regularly**
   - Schedule: Every 90 days minimum
   - Immediately after: Security incidents, team member departure

3. **Use separate keys per environment**
   - Development: Local `.env.local`
   - Staging: Vercel preview environment variables
   - Production: Vercel production environment variables

4. **Monitor key usage**
   - Check Firebase, Azure, and Stripe dashboards for unusual activity
   - Set up alerts for suspicious patterns

5. **Document all rotations**
   - Maintain rotation history in `docs/SECURITY.md`
   - Include: date, rotated by, reason, verification status

6. **Test thoroughly before production**
   - Always test new keys in development first
   - Verify all functionality works
   - Only then update production

7. **Keep old keys active during transition**
   - Update all environments before deleting old keys
   - Verify production works before cleanup

---

## 📞 Support Resources

- **Firebase Support**: https://firebase.google.com/support
- **Azure Support**: https://azure.microsoft.com/support
- **Stripe Support**: https://support.stripe.com

---

**Document Status**: Ready for Use
**Created**: October 21, 2025
**Last Updated**: October 21, 2025
**Next Review**: January 21, 2026 (90 days)
