import { NextRequest, NextResponse } from 'next/server';

const INDEXNOW_KEY = process.env.INDEXNOW_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://studiai.ro';

/**
 * IndexNow API endpoint for instant Bing/Yandex re-indexing.
 * ChatGPT Search uses Bing's index — submitting URLs here triggers
 * faster crawling and citation by ChatGPT.
 * 
 * POST /api/indexnow { urls: string[] }
 * GET  /api/indexnow?url=https://studiai.ro/courses/...
 */
export async function POST(request: NextRequest) {
  if (!INDEXNOW_KEY) {
    return NextResponse.json({ error: 'IndexNow key not configured' }, { status: 500 });
  }

  const body = await request.json();
  const urls: string[] = body.urls || [];

  if (urls.length === 0) {
    return NextResponse.json({ error: 'No URLs provided' }, { status: 400 });
  }

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: new URL(SITE_URL).hostname,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      submitted: urls.length,
    });
  } catch (error) {
    console.error('IndexNow submission failed:', error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!INDEXNOW_KEY) {
    return NextResponse.json({ error: 'IndexNow key not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${INDEXNOW_KEY}`,
    );

    return NextResponse.json({
      success: response.ok,
      status: response.status,
    });
  } catch (error) {
    console.error('IndexNow submission failed:', error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
