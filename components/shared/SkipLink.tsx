/**
 * SkipLink Component
 * Provides keyboard users with a quick way to skip navigation and jump to main content
 * WCAG 2.1 Level A requirement for accessibility
 */

import React from 'react';
import { useTranslations } from 'next-intl';

const SkipLink: React.FC = () => {
  const t = useTranslations('accessibility');

  const handleSkip = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleSkip}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-6 focus:py-3 focus:bg-ai-primary focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ai-primary"
      style={{
        transition: 'all 0.2s ease',
      }}
    >
      {t('skipToMainContent')}
    </a>
  );
};

export default SkipLink;
