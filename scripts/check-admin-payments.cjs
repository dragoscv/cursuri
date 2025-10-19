const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
    });
}

const db = admin.firestore();

async function checkAdminPayments() {
    try {
        // Read admin credentials
        const adminData = JSON.parse(fs.readFileSync('./credentials/admin.json', 'utf8'));
        const adminUid = adminData.uid;

        console.log(`\nChecking payments for admin user: ${adminData.email}`);
        console.log(`UID: ${adminUid}\n`);

        // Get all payment documents for this user
        const paymentsRef = db.collection(`customers/${adminUid}/payments`);
        const paymentsSnapshot = await paymentsRef.get();

        if (paymentsSnapshot.empty) {
            console.log('✅ No payment records found for admin user.');
            console.log('The admin user can test the purchase flow normally.\n');
            return;
        }

        console.log(`⚠️  Found ${paymentsSnapshot.size} payment record(s) for admin user:\n`);

        const payments = [];
        paymentsSnapshot.forEach(doc => {
            const data = doc.data();
            payments.push({
                id: doc.id,
                status: data.status,
                courseId: data.metadata?.courseId,
                amount: data.amount,
                created: data.created?.toDate?.() || data.created
            });

            console.log(`Payment ID: ${doc.id}`);
            console.log(`  Status: ${data.status}`);
            console.log(`  Course ID: ${data.metadata?.courseId || 'N/A'}`);
            console.log(`  Amount: ${data.amount || 'N/A'}`);
            console.log(`  Created: ${data.created?.toDate?.() || data.created || 'N/A'}`);
            console.log('');
        });

        console.log('\n🔧 To remove these test payment records, run: node clear-admin-payments.cjs\n');

    } catch (error) {
        console.error('Error checking admin payments:', error);
        process.exit(1);
    }
}

checkAdminPayments()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Script error:', error);
        process.exit(1);
    });
