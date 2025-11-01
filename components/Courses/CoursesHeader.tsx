import React from 'react';
import { useTranslations } from 'next-intl';

export default function CoursesHeader() {
  const t = useTranslations('courses.header');
  return (
    <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-[color:var(--ai-accent)]/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-[color:var(--ai-card-border)]/50 shadow-xl">
      <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent mb-2">
        {t('exploreTitle')}
      </h1>
      <p className="text-[color:var(--ai-muted)]">
        {t('description')}
      </p>
    </div>
  );
}
