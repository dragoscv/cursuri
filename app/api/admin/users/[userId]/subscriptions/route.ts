import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { requireAdmin } from '@/utils/api/auth';

function initFirebaseAdmin() {
  if (!getApps().length) {
    const hasCredentials = !!(
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    );
    if (hasCredentials) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        }),
      });
    }
  }
}

/**
 * GET /api/admin/users/[userId]/subscriptions
 * Returns Stripe subscriptions for the given user (admin only).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = await params;
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    initFirebaseAdmin();
    const db = getFirestore();

    const subsSnapshot = await db
      .collection('customers')
      .doc(userId)
      .collection('subscriptions')
      .orderBy('created', 'desc')
      .get();

    const subscriptions = subsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        status: data.status,
        priceId: data.price?.id || data.items?.[0]?.price?.id,
        productId: data.product?.id || data.items?.[0]?.price?.product,
        productName: data.product?.name || data.items?.[0]?.price?.product?.name || null,
        currentPeriodEnd: data.current_period_end?.seconds
          ? new Date(data.current_period_end.seconds * 1000).toISOString()
          : null,
        currentPeriodStart: data.current_period_start?.seconds
          ? new Date(data.current_period_start.seconds * 1000).toISOString()
          : null,
        cancelAtPeriodEnd: data.cancel_at_period_end || false,
        created: data.created?.seconds
          ? new Date(data.created.seconds * 1000).toISOString()
          : null,
      };
    });

    return NextResponse.json({ success: true, subscriptions });
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}
