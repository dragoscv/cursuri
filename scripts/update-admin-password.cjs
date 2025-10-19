// Script to update password for existing admin user
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Read admin credentials
const adminCredentialsPath = path.join(__dirname, 'credentials/admin.json');
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

const auth = admin.auth();

async function updatePassword() {
  try {
    const uid = adminCredentials.uid;
    const newPassword = adminCredentials.password;

    console.log('Updating password for user:', uid);

    await auth.updateUser(uid, {
      password: newPassword,
      emailVerified: true
    });

    console.log('✅ Password updated successfully!');
    console.log('\n=== ADMIN CREDENTIALS ===');
    console.log('Email:', adminCredentials.email);
    console.log('Password:', newPassword);
    console.log('UID:', uid);
    console.log('Role:', adminCredentials.role);
    console.log('========================\n');

    // Update the note in credentials file
    adminCredentials.note = 'Platform administrator account - Password updated and verified';
    adminCredentials.passwordUpdatedAt = new Date().toISOString();
    delete adminCredentials.existingUser;

    fs.writeFileSync(adminCredentialsPath, JSON.stringify(adminCredentials, null, 2));
    console.log('✅ Credentials file updated');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating password:', error.message);
    process.exit(1);
  }
}

updatePassword();
