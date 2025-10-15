'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { useRouter } from 'next/navigation';

interface ErrorPageProps {
    title?: string;
    message?: string;
    status?: 404 | 500 | 403 | number;
    imageSrc?: string;
    showHomeButton?: boolean;
    showBackButton?: boolean;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
    title = 'Page Not Found',
    message = 'The page you are looking for doesn\'t exist or has been moved.',
    status = 404,
    imageSrc,
    showHomeButton = true,
    showBackButton = true,
}) => {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12">
            {/* Status code */}
            <h1 className="text-7xl font-bold mb-2 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-transparent bg-clip-text">
                {status}
            </h1>

            {/* Custom image if provided */}
            {imageSrc && (
                <div className="mb-6">
                    <img src={imageSrc} alt="Error illustration" className="max-w-xs mx-auto" />
                </div>
            )}

            {/* Error title */}
            <h2 className="text-2xl font-bold mb-2 text-[color:var(--ai-foreground)]">{title}</h2>

            {/* Error message */}
            <p className="text-center max-w-md mb-8 text-[color:var(--ai-muted)]">{message}</p>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
                {showHomeButton && (
                    <Link href="/" passHref>
                        <Button color="primary" variant="solid">
                            Go to Homepage
                        </Button>
                    </Link>
                )}
                {showBackButton && (
                    <Button
                        color="default"
                        variant="light"
                        onPress={() => router.back()}
                    >
                        Go Back
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ErrorPage;