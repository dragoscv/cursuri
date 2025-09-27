import React, { ReactNode } from 'react';
import { Card, CardBody } from '@heroui/react';
import Link from 'next/link';

interface PolicyPageProps {
    title: string;
    lastUpdated?: string;
    children: ReactNode;
}

export default function PolicyPage({ title, lastUpdated, children }: PolicyPageProps) {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Card className="p-6 border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] shadow-xl">
                <CardBody>
                    <h1 className="text-3xl font-bold mb-8 text-center text-[color:var(--ai-foreground)] bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">{title}</h1>

                    <div className="prose dark:prose-invert max-w-none">
                        {lastUpdated && (
                            <p className="text-sm text-[color:var(--ai-muted)] mb-6">Last updated: {lastUpdated}</p>
                        )}

                        {children}

                        <div className="mt-12 flex space-x-4 justify-center">
                            <Link
                                href="/privacy-policy"
                                className="text-[color:var(--ai-primary)] hover:underline"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="/terms-conditions"
                                className="text-[color:var(--ai-primary)] hover:underline"
                            >
                                Terms & Conditions
                            </Link>
                            <Link
                                href="/gdpr"
                                className="text-[color:var(--ai-primary)] hover:underline"
                            >
                                GDPR Policy
                            </Link>
                            <Link
                                href="/"
                                className="text-[color:var(--ai-primary)] hover:underline"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}