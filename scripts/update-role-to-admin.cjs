// Script to update user role to admin in Firebase
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Read admin credentials (from project root, not scripts directory)
const adminCredentialsPath = path.join(__dirname, '../.credentials/admin.json');
const adminCredentials = JSON.parse(fs.readFileSync(adminCredentialsPath, 'utf8'));

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID || 'cursuri-411b4',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function updateToAdmin() {
  try {
    const uid = adminCredentials.uid;

    console.log('Updating user role to admin...');

    // Update Firestore profile
    await db.collection('users').doc(uid).update({
      role: 'admin',
      isActive: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Firestore profile updated to admin role');

    // Set custom claims
    await auth.setCustomUserClaims(uid, {
      admin: true,
      role: 'admin'
    });

    console.log('✅ Custom claims updated');
    console.log('\n=== ADMIN USER ===');
    console.log('Email:', adminCredentials.email);
    console.log('UID:', uid);
    console.log('Role: admin');
    console.log('==================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating role:', error.message);
    process.exit(1);
  }
}

updateToAdmin();
