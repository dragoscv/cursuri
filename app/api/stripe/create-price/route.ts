import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, checkRateLimit } from '@/utils/api/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-09-30.clover',
});

/**
 * Create Stripe Price - ADMIN ONLY
 * 
 * Security:
 * - Requires admin authentication
 * - Rate limited to 20 requests per minute per admin
 * - Validates all input parameters
 */
export async function POST(request: NextRequest) {
    try {
        // Require admin authentication
        const authResult = await requireAdmin(request);
        if (authResult instanceof NextResponse) return authResult;

        const user = authResult.user!;

        // Rate limiting: 20 requests per minute for admin operations
        if (!checkRateLimit(`stripe-create-price:${user.uid}`, 20, 60000)) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again later.' },
                { status: 429 }
            );
        }

        const { productName, productDescription, amount, currency, metadata } = await request.json();

        // Validate required fields
        if (!productName || !amount || !currency) {
            return NextResponse.json(
                { error: 'Missing required fields: productName, amount, currency' },
                { status: 400 }
            );
        }

        // Validate amount is a positive number
        if (typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json(
                { error: 'Amount must be a positive number' },
                { status: 400 }
            );
        }

        // Create or find product
        let product;

        // Search for existing product with the same name
        const existingProducts = await stripe.products.list({
            limit: 100,
            active: true
        });

        product = existingProducts.data.find(
            (p: any) => p.name.toLowerCase() === productName.toLowerCase()
        );

        if (!product) {
            // Create new product
            product = await stripe.products.create({
                name: productName,
                description: productDescription || productName,
                active: true,
                metadata: {
                    ...metadata,
                    app: metadata?.app || 'cursuri'
                }
            });
        } else {
            // Update existing product metadata if needed
            if (metadata) {
                await stripe.products.update(product.id, {
                    metadata: {
                        ...product.metadata,
                        ...metadata,
                        app: metadata?.app || product.metadata?.app || 'cursuri'
                    }
                });
            }
        }

        // Create price
        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: amount,
            currency: currency.toLowerCase(),
            metadata: {
                ...metadata,
                app: metadata?.app || 'cursuri'
            }
        });

        return NextResponse.json({
            success: true,
            productId: product.id,
            productName: product.name,
            priceId: price.id,
            amount: price.unit_amount,
            currency: price.currency,
            message: 'Price created successfully',
            createdBy: user.uid
        });

    } catch (error: any) {
        console.error('Error creating price:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create price' },
            { status: 500 }
        );
    }
}
