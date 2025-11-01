# Firebase Storage CORS Configuration Fix

## Problem
When editing courses on production, you get this error:
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/v0/b/studiai-prod.firebasestorage.app/o?name=...' 
from origin 'https://studiai.ro' has been blocked by CORS policy
```

## Root Cause
The Firebase Storage bucket `studiai-prod.firebasestorage.app` doesn't have CORS (Cross-Origin Resource Sharing) configured to allow requests from your domain `https://studiai.ro`.

## Solution

### Option 1: Using Firebase Console (Easiest)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your `studiai-prod` project
3. Navigate to **Storage** → **Files**
4. Click on the **Rules** tab
5. Verify your storage rules are deployed (they should be)
6. For CORS, you need to use the Firebase CLI or gsutil (see options below)

### Option 2: Using Firebase CLI
```powershell
# Make sure you're logged in to the correct project
firebase use studiai-prod

# Deploy storage rules (this doesn't fix CORS but ensures rules are correct)
firebase deploy --only storage
```

**Note**: Firebase CLI doesn't directly configure CORS. You need gsutil (Option 3).

### Option 3: Using gsutil (Recommended)
1. **Install Google Cloud SDK**:
   - Download from: https://cloud.google.com/sdk/docs/install
   - Run the installer
   - Initialize: `gcloud init`

2. **Authenticate**:
   ```powershell
   gcloud auth login
   gcloud config set project studiai-prod
   ```

3. **Apply CORS Configuration**:
   ```powershell
   # Run the provided PowerShell script
   .\scripts\configure-storage-cors.ps1
   ```

   Or manually:
   ```powershell
   gsutil cors set cors.json gs://studiai-prod.firebasestorage.app
   ```

4. **Verify CORS Configuration**:
   ```powershell
   gsutil cors get gs://studiai-prod.firebasestorage.app
   ```

### Option 4: Quick Fix via Firebase Console Storage Settings
1. Go to Firebase Console → Storage
2. Click on the three dots menu (⋮) next to your bucket
3. Select "Edit bucket CORS configuration"
4. Add the following JSON:
   ```json
   [
     {
       "origin": ["https://studiai.ro", "https://www.studiai.ro"],
       "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
       "maxAgeSeconds": 3600
     }
   ]
   ```

## CORS Configuration Explained

The `cors.json` file configures:
- **origin**: Which domains can access your storage
  - `https://studiai.ro` - Your production domain
  - `https://www.studiai.ro` - WWW subdomain
  - `http://localhost:3000` - Local development
  
- **method**: Allowed HTTP methods (GET, POST, PUT, DELETE, etc.)
- **maxAgeSeconds**: How long browsers cache CORS preflight results (1 hour)
- **responseHeader**: Headers that can be exposed to the browser

## Testing After Configuration

1. Clear your browser cache
2. Try editing a course again
3. Upload an image
4. Verify no CORS errors in the console

## Additional Notes

### About the SVG viewBox Error
The error `<svg> attribute viewBox: Expected number, "0 0 100% 4"` is coming from a browser extension (`content.js`), not your application code. This is harmless and doesn't affect functionality.

### Storage Security
Your storage rules are correctly configured to:
- Allow public read access to course materials
- Restrict write access to admins only
- Validate file types and sizes for user uploads

## Troubleshooting

### If CORS persists after configuration:
1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Hard refresh**: Ctrl+F5
3. **Check bucket name**: Ensure it's `studiai-prod.firebasestorage.app`
4. **Verify authentication**: Make sure you're logged in as admin
5. **Check Firebase project**: Confirm you're in the `studiai-prod` project

### If gsutil commands fail:
```powershell
# Re-authenticate
gcloud auth login

# Set correct project
gcloud config set project studiai-prod

# List your buckets to verify access
gsutil ls
```

## Prevention
Always configure CORS when setting up a new Firebase Storage bucket that will be accessed from a web application.
