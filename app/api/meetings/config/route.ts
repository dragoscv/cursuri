/**
 * GET /api/meetings/config
 * Public-safe meetings config used by the booking page.
 */
import { NextResponse } from 'next/server';
import { getMeetingsConfig } from '@/utils/meetings/firestore';
import { toPublicConfig } from '@/utils/meetings/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await getMeetingsConfig();
    return NextResponse.json({ success: true, config: toPublicConfig(config) });
  } catch (err: any) {
    console.error('GET /api/meetings/config failed:', err);
    return NextResponse.json({ success: false, error: 'Failed to load config' }, { status: 500 });
  }
}
