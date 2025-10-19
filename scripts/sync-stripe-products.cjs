// Script to manually sync Stripe products to Firestore
// This is needed because the Stripe extension might not have auto-synced yet

const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
});

const db = admin.firestore();

// Products from Stripe
const products = [
  {
    id: 'prod_TFcr6FQLtuZGoI',
    name: 'Curs Creare Aplicatie Web',
    description: 'Curs in care arat cum sa dezvolti o aplicatie web folosind Next.js',
    active: true,
    metadata: {
      app: 'cursuri',
      courseId: 'eVpevoMNR2H46wliWRwH'
    },
    prices: [
      {
        id: 'price_1SJ7c7KGMYD6o5449J1R2lA4',
        currency: 'ron',
        unit_amount: 10000,
        type: 'one_time',
        active: true,
        metadata: {
          app: 'cursuri'
        }
      }
    ]
  },
  {
    id: 'prod_TFcrvq143Atyoi',
    name: 'Creează reclame și texte care vând – cu ajutorul ChatGPT',
    description: 'Cursul „ChatGPT pentru Marketing și Reclame" te învață pas cu pas cum să folosești AI-ul pentru a crea texte, campanii și idei de promovare în câteva minute',
    active: true,
    metadata: {
      app: 'cursuri',
      courseId: 'a1TxL4lHZ8hjhMS1vHZW'
    },
    prices: [
      {
        id: 'price_1SJ7c7KGMYD6o544yfhOOV9Z',
        currency: 'ron',
        unit_amount: 25000,
        type: 'one_time',
        active: true,
        metadata: {
          app: 'cursuri'
        }
      }
    ]
  }
];

async function syncProducts() {
  try {
    console.log('Starting Stripe products sync to Firestore...');

    for (const product of products) {
      // Prepare product data with prices array embedded (required by app)
      const productData = {
        id: product.id,
        name: product.name,
        description: product.description,
        active: product.active,
        metadata: {
          ...product.metadata,
          app: 'cursuri' // Required for filtering in AppContext
        },
        prices: product.prices.map(price => ({
          id: price.id,
          currency: price.currency,
          unit_amount: price.unit_amount,
          type: price.type,
          active: price.active,
          product: product.id
        })),
        created: new Date()
      };

      // Add product to Firestore with embedded prices
      const productRef = db.collection('products').doc(product.id);
      await productRef.set(productData);

      console.log(`✓ Product ${product.name} synced with ${product.prices.length} price(s)`);

      // Also add prices as subcollection (for Firebase Stripe Extension compatibility)
      for (const price of product.prices) {
        const priceRef = productRef.collection('prices').doc(price.id);
        await priceRef.set({
          id: price.id,
          currency: price.currency,
          unit_amount: price.unit_amount,
          type: price.type,
          active: price.active,
          product: product.id,
          metadata: price.metadata || {},
          created: new Date()
        });

        console.log(`  ✓ Price ${price.id} synced (${price.unit_amount / 100} ${price.currency.toUpperCase()})`);
      }
    }

    console.log('\n✓ All products synced successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing products:', error);
    process.exit(1);
  }
}

syncProducts();
