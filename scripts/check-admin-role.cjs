// Script to check if user has admin role in Firebase
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Read admin credentials
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

async function checkAdminRole() {
    try {
        const uid = adminCredentials.uid;
        const email = adminCredentials.email;

        console.log('\n🔍 Checking Admin Status...\n');
        console.log('UID:', uid);
        console.log('Email:', email);
        console.log('-------------------\n');

        // Check Firestore user document
        const userDoc = await db.collection('users').doc(uid).get();

        if (!userDoc.exists) {
            console.log('❌ User document not found in Firestore');
            console.log('\n💡 Solution: Run update-role-to-admin.cjs to create user profile\n');
            process.exit(1);
        }

        const userData = userDoc.data();
        console.log('✅ User document found in Firestore');
        console.log('   Role:', userData.role || 'NOT SET');
        console.log('   Active:', userData.isActive !== false ? 'Yes' : 'No');
        console.log('   Permissions:', JSON.stringify(userData.permissions || {}, null, 2));

        // Check if user has admin role
        if (userData.role !== 'admin' && userData.role !== 'super_admin') {
            console.log('\n❌ User does not have admin role');
            console.log('   Current role:', userData.role || 'user');
            console.log('\n💡 Solution: Run update-role-to-admin.cjs to grant admin access\n');
            process.exit(1);
        }

        // Check if user is active
        if (userData.isActive === false) {
            console.log('\n⚠️  User account is deactivated');
            console.log('\n💡 Solution: Set isActive to true in Firestore\n');
            process.exit(1);
        }

        // Check Firebase Auth custom claims
        try {
            const userRecord = await auth.getUser(uid);
            console.log('\n✅ Firebase Auth record found');
            console.log('   Email verified:', userRecord.emailVerified);
            console.log('   Custom claims:', JSON.stringify(userRecord.customClaims || {}, null, 2));

            if (!userRecord.customClaims || !userRecord.customClaims.admin) {
                console.log('\n⚠️  Custom claims not set');
                console.log('💡 Solution: Run update-role-to-admin.cjs to set custom claims\n');
            }
        } catch (authError) {
            console.log('\n⚠️  Could not fetch Firebase Auth record:', authError.message);
        }

        console.log('\n===================');
        console.log('✅ ADMIN ACCESS VERIFIED');
        console.log('===================');
        console.log('\nUser has proper admin permissions.');
        console.log('If you still experience issues:');
        console.log('1. Clear browser cache');
        console.log('2. Sign out and sign in again');
        console.log('3. Check browser console for errors');
        console.log('4. Verify Firestore security rules\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error checking admin role:', error.message);
        console.log('\nStack trace:', error.stack);
        process.exit(1);
    }
}

checkAdminRole();
