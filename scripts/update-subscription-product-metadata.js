/**
 * Script to update Stripe subscription product metadata
 * This adds the app: 'cursuri' metadata so the product gets synced to Firestore
 * 
 * Usage: node scripts/update-subscription-product-metadata.js
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SUBSCRIPTION_PRODUCT_ID = 'prod_TKfSfcqwRsxWGe';

async function updateProductMetadata() {
    try {
        console.log('Updating subscription product metadata...');

        // Update product metadata
        const product = await stripe.products.update(SUBSCRIPTION_PRODUCT_ID, {
            metadata: {
                app: 'cursuri',
                type: 'subscription'
            }
        });

        console.log('✅ Product metadata updated successfully!');
        console.log('Product ID:', product.id);
        console.log('Product Name:', product.name);
        console.log('Metadata:', product.metadata);

        // Also update price metadata for both monthly and yearly
        const monthlyPriceId = 'price_1SO07cLG0nGypmDBXjef95ut';
        const yearlyPriceId = 'price_1SO07cLG0nGypmDBTeHZEoRE';

        console.log('\nUpdating price metadata...');

        const monthlyPrice = await stripe.prices.update(monthlyPriceId, {
            metadata: {
                app: 'cursuri',
                type: 'subscription',
                interval: 'month'
            }
        });

        console.log('✅ Monthly price metadata updated!');
        console.log('Price ID:', monthlyPrice.id);
        console.log('Amount:', monthlyPrice.unit_amount, monthlyPrice.currency.toUpperCase());

        const yearlyPrice = await stripe.prices.update(yearlyPriceId, {
            metadata: {
                app: 'cursuri',
                type: 'subscription',
                interval: 'year'
            }
        });

        console.log('✅ Yearly price metadata updated!');
        console.log('Price ID:', yearlyPrice.id);
        console.log('Amount:', yearlyPrice.unit_amount, yearlyPrice.currency.toUpperCase());

        console.log('\n✨ All metadata updated! The subscription product should now sync to Firestore.');
        console.log('⏳ Please wait a few moments for Firestore sync, then refresh your app.');

    } catch (error) {
        console.error('❌ Error updating metadata:', error.message);
        process.exit(1);
    }
}

updateProductMetadata();
