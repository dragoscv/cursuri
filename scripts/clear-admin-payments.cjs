const admin = require('firebase-admin');
const fs = require('fs');
const readline = require('readline');

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

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function clearAdminPayments() {
    try {
        // Read admin credentials
        const adminData = JSON.parse(fs.readFileSync('./credentials/admin.json', 'utf8'));
        const adminUid = adminData.uid;

        console.log(`\n⚠️  WARNING: This will delete ALL payment records for admin user: ${adminData.email}`);
        console.log(`UID: ${adminUid}\n`);

        // Get all payment documents for this user
        const paymentsRef = db.collection(`customers/${adminUid}/payments`);
        const paymentsSnapshot = await paymentsRef.get();

        if (paymentsSnapshot.empty) {
            console.log('✅ No payment records found for admin user.\n');
            rl.close();
            return;
        }

        console.log(`Found ${paymentsSnapshot.size} payment record(s):\n`);

        paymentsSnapshot.forEach(doc => {
            const data = doc.data();
            console.log(`  - ${doc.id} (Status: ${data.status}, Course: ${data.metadata?.courseId || 'N/A'})`);
        });

        console.log('');
        const answer = await askQuestion('Are you sure you want to delete these records? (yes/no): ');

        if (answer.toLowerCase() !== 'yes') {
            console.log('\n❌ Operation cancelled.\n');
            rl.close();
            return;
        }

        // Delete all payment records
        const batch = db.batch();
        paymentsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        console.log(`\n✅ Successfully deleted ${paymentsSnapshot.size} payment record(s).`);
        console.log('The admin user can now test the purchase flow without seeing "Enrolled" badges.\n');

        rl.close();

    } catch (error) {
        console.error('Error clearing admin payments:', error);
        rl.close();
        process.exit(1);
    }
}

clearAdminPayments()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Script error:', error);
        process.exit(1);
    });
