'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface ErrorPageProps {
  title?: string;
  message?: string;
  status?: 404 | 500 | 403 | number;
  imageSrc?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  title,
  message,
  status = 404,
  imageSrc,
  showHomeButton = true,
  showBackButton = true,
}) => {
  const router = useRouter();
  const t = useTranslations('common.errorPage');

  // Use translations as defaults if props not provided
  const displayTitle = title || t('pageNotFound');
  const displayMessage = message || t('pageNotFoundMessage');

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12">
      {/* Status code */}
      <h1 className="text-7xl font-bold mb-2 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-transparent bg-clip-text">
        {status}
      </h1>

      {/* Custom image if provided */}
      {imageSrc && (
        <div className="mb-6">
          <Image
            src={imageSrc}
            alt={t('errorIllustration')}
            width={384}
            height={384}
            className="max-w-xs mx-auto"
          />
        </div>
      )}

      {/* Error title */}
      <h2 className="text-2xl font-bold mb-2 text-[color:var(--ai-foreground)]">{displayTitle}</h2>

      {/* Error message */}
      <p className="text-center max-w-md mb-8 text-[color:var(--ai-muted)]">{displayMessage}</p>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        {showHomeButton && (
          <Link href="/" passHref>
            <Button color="primary" variant="solid">
              {t('goToHomepage')}
            </Button>
          </Link>
        )}
        {showBackButton && (
          <Button color="default" variant="light" onPress={() => router.back()}>
            {t('goBack')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorPage;
