import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://studiai.ro';

export async function GET() {
  const manifest = {
    schema_version: 'v1',
    name_for_human: 'StudiAI - AI Development Courses',
    name_for_model: 'studiai',
    description_for_human: 'Learn to build real-world applications using AI agents. Courses in Romanian covering GitHub Copilot, Cursor, Claude, ChatGPT, and modern web development.',
    description_for_model: 'StudiAI is a Romanian online education platform that teaches how to build software applications using AI agents. The flagship course "AI Agents - Build Everything with AI" teaches complete beginners and developers how to use AI coding assistants (GitHub Copilot, Cursor AI, Claude, ChatGPT) to build full-stack web applications with Next.js, React, TypeScript, Tailwind CSS, Firebase, and Stripe. All content is in Romanian. Visit https://studiai.ro/courses/oMC8PJGBVo94LGPQ4wuW for the main AI agents course.',
    auth: {
      type: 'none',
    },
    api: {
      type: 'openapi',
      url: `${SITE_URL}/api/openapi.json`,
    },
    logo_url: `${SITE_URL}/logo.svg`,
    contact_email: 'contact@studiai.ro',
    legal_info_url: `${SITE_URL}/terms-conditions`,
  };

  return NextResponse.json(manifest, {
    headers: {
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
