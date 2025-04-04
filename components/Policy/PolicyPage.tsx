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
            <Card className="p-6">
                <CardBody>
                    <h1 className="text-3xl font-bold mb-8 text-center">{title}</h1>

                    <div className="prose dark:prose-invert max-w-none">
                        {lastUpdated && (
                            <p className="text-sm text-gray-500 mb-6">Last updated: {lastUpdated}</p>
                        )}

                        {children}

                        <div className="mt-12 flex space-x-4 justify-center">
                            <Link
                                href="/privacy-policy"
                                className="text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="/terms-conditions"
                                className="text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                Terms & Conditions
                            </Link>
                            <Link
                                href="/gdpr"
                                className="text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                GDPR Policy
                            </Link>
                            <Link
                                href="/"
                                className="text-indigo-600 dark:text-indigo-400 hover:underline"
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