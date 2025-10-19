// Update Stripe products with app metadata
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config({ path: '.env.local' });

const products = [
  { id: 'prod_TEtmaMCdwwMjKn', courseId: 'eVpevoMNR2H46wliWRwH' },
  { id: 'prod_TEtocSae8ncFH3', courseId: 'a1TxL4lHZ8hjhMS1vHZW' }
];

async function updateProductMetadata() {
  try {
    console.log('Updating Stripe product metadata...\n');

    for (const product of products) {
      await stripe.products.update(product.id, {
        metadata: {
          app: 'cursuri',
          courseId: product.courseId
        }
      });

      console.log(`✓ Updated product ${product.id} with app metadata`);
    }

    console.log('\n✓ All product metadata updated!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating product metadata:', error);
    process.exit(1);
  }
}

updateProductMetadata();
