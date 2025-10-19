// Script to link courses to Stripe products
const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin (reuse existing app if already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

// Course to Product mapping
const courseProductMap = [
  {
    courseId: 'eVpevoMNR2H46wliWRwH',
    courseName: 'Curs Creare Aplicatie Web',
    productId: 'prod_TEtmaMCdwwMjKn',
    priceId: 'price_1SIQ0IKGMYD6o544bQH9bcTI',
    price: 100
  },
  {
    courseId: 'a1TxL4lHZ8hjhMS1vHZW',
    courseName: 'Creează reclame și texte care vând – cu ajutorul ChatGPT',
    productId: 'prod_TEtocSae8ncFH3',
    priceId: 'price_1SIQ0rKGMYD6o544QxdsR4yD',
    price: 250
  }
];

async function linkCourses() {
  try {
    console.log('Starting course to Stripe product linking...\n');

    for (const mapping of courseProductMap) {
      const courseRef = db.collection('courses').doc(mapping.courseId);
      const courseDoc = await courseRef.get();

      if (!courseDoc.exists) {
        console.log(`⚠ Course ${mapping.courseName} not found, skipping...`);
        continue;
      }

      // Update course with Stripe product/price info
      await courseRef.update({
        priceProduct: {
          id: mapping.productId
        },
        price: mapping.priceId, // This should be the Stripe price ID
        updatedAt: new Date()
      });

      console.log(`✓ Course "${mapping.courseName}" linked to Stripe`);
      console.log(`  Product ID: ${mapping.productId}`);
      console.log(`  Price ID: ${mapping.priceId}`);
      console.log(`  Price: ${mapping.price} RON\n`);
    }

    console.log('✓ All courses linked successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error linking courses:', error);
    process.exit(1);
  }
}

linkCourses();
