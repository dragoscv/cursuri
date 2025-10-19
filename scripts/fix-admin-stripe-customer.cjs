/**
 * Fix Admin Stripe Customer Issue
 * 
 * This script removes invalid Stripe customer data from the admin user's Firestore document
 * to allow checkout sessions to create a new valid customer.
 */

const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
    });
}

const db = admin.firestore();

async function fixAdminStripeCustomer() {
    try {
        console.log('🔍 Starting admin Stripe customer fix...\n');

        // Read admin credentials from file
        const adminData = JSON.parse(fs.readFileSync('./.credentials/admin.json', 'utf8'));
        const adminUID = adminData.uid;
        const adminEmail = adminData.email;

        console.log(`👤 Admin UID: ${adminUID}`);
        console.log(`📧 Admin Email: ${adminEmail}\n`);

        // Check if customer document exists
        const customerDocRef = db.collection('customers').doc(adminUID);
        const customerDoc = await customerDocRef.get();

        if (!customerDoc.exists) {
            console.log('⚠️  No customer document found. Creating new empty document...');
            await customerDocRef.set({
                email: adminEmail,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Created new customer document');
        } else {
            const customerData = customerDoc.data();
            console.log('📄 Current customer document:', JSON.stringify(customerData, null, 2));

            // Remove the invalid stripeId/stripeCustomerId if it exists
            const updates = {};
            let needsUpdate = false;

            if (customerData.stripeId) {
                console.log(`\n🗑️  Removing invalid stripeId: ${customerData.stripeId}`);
                updates.stripeId = admin.firestore.FieldValue.delete();
                needsUpdate = true;
            }

            if (customerData.stripeCustomerId) {
                console.log(`🗑️  Removing invalid stripeCustomerId: ${customerData.stripeCustomerId}`);
                updates.stripeCustomerId = admin.firestore.FieldValue.delete();
                needsUpdate = true;
            }

            if (needsUpdate) {
                await customerDocRef.update(updates);
                console.log('✅ Removed invalid Stripe customer IDs');
            } else {
                console.log('ℹ️  No invalid Stripe customer IDs found');
            }
        }

        // Check for any checkout_sessions subcollection documents
        const checkoutSessionsRef = customerDocRef.collection('checkout_sessions');
        const checkoutSessions = await checkoutSessionsRef.get();

        if (!checkoutSessions.empty) {
            console.log(`\n📋 Found ${checkoutSessions.size} checkout session(s)`);

            for (const doc of checkoutSessions.docs) {
                const sessionData = doc.data();
                console.log(`\n  Session ${doc.id}:`);
                console.log(`    Status: ${sessionData.status || 'N/A'}`);
                console.log(`    Created: ${sessionData.created ? new Date(sessionData.created._seconds * 1000).toISOString() : 'N/A'}`);

                // Optionally delete old failed sessions
                if (sessionData.error) {
                    console.log(`    ❌ Error: ${sessionData.error.message || 'Unknown error'}`);
                    console.log(`    🗑️  Deleting failed session...`);
                    await doc.ref.delete();
                    console.log(`    ✅ Deleted`);
                }
            }
        } else {
            console.log('\nℹ️  No checkout sessions found');
        }

        console.log('\n✅ Admin Stripe customer fix completed successfully!');
        console.log('\n💡 The next time the admin tries to purchase a course, Stripe will create a new valid customer ID.');

    } catch (error) {
        console.error('\n❌ Error fixing admin Stripe customer:', error);
        throw error;
    }
}

// Run the fix
fixAdminStripeCustomer()
    .then(() => {
        console.log('\n🎉 Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Failed:', error);
        process.exit(1);
    });
