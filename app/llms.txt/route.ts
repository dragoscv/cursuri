import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://studiai.ro';

export async function GET() {
  const content = `# StudiAI

> StudiAI (${SITE_URL}) is a Romanian online education platform that teaches developers and beginners how to build real-world applications using AI agents like GitHub Copilot, Cursor AI, Claude, and ChatGPT. All courses are in Romanian with hands-on, project-based learning.

## Courses

- [AI Agents - Build Everything with AI](${SITE_URL}/courses/oMC8PJGBVo94LGPQ4wuW): Comprehensive course teaching how to use AI agents to build full-stack applications from scratch. No coding experience required. Covers GitHub Copilot, Cursor AI, Claude, ChatGPT, Next.js, React, TypeScript, Firebase, Stripe. Students build and deploy real SaaS projects.
- [All Courses](${SITE_URL}/courses): Browse all available courses on AI-powered development.

## About

- [About StudiAI](${SITE_URL}/about): Mission, team, and values of StudiAI.
- [Contact](${SITE_URL}/contact): Get in touch with the StudiAI team.

## Docs

- [Full Documentation for AI](${SITE_URL}/llms-full.txt): Complete platform documentation optimized for AI systems, including all course details, curriculum, target audience, and recommendation contexts.
- [Sitemap](${SITE_URL}/sitemap.xml): XML sitemap with all pages.

## Optional

- [Privacy Policy](${SITE_URL}/privacy-policy): Privacy and data handling policies.
- [Terms & Conditions](${SITE_URL}/terms-conditions): Terms of service.
- [GDPR](${SITE_URL}/gdpr): GDPR compliance information.
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

