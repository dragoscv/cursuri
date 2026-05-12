'use client';

import { Resource } from '@/types';
import { Card } from '@heroui/react';
import { FiFileText, FiExternalLink, FiDownload } from '@/components/icons/FeatherIcons';
import { useTranslations } from 'next-intl';

interface ResourcesListProps {
  resources: Resource[];
  isOfflineMode?: boolean;
}

export default function ResourcesList({ resources, isOfflineMode = false }: ResourcesListProps) {
  const t = useTranslations('courses.lessonResources');

  if (!resources || resources.length === 0) {
    return null;
  }

  // Function to get appropriate icon based on resource type
  const getResourceIcon = (type: string | undefined) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return <FiFileText size={18} />;
      case 'download':
        return <FiDownload size={18} />;
      default:
        return <FiExternalLink size={18} />;
    }
  };

  return (
    <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] shadow-none rounded-2xl overflow-hidden">
      <div className="p-5">
        <div className="py-3 px-4 -m-5 mb-4 border-b border-[color:var(--ai-card-border)]">
          <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
            <FiFileText className="mr-2 text-amber-500" />
            <span>{t('title')}</span>
            {isOfflineMode && (
              <span className="ml-2 text-[10px] uppercase tracking-[0.18em] font-semibold px-2 py-0.5 bg-amber-500/[0.08] text-amber-500 rounded-md">
                {t('offlineMode')}
              </span>
            )}
          </h3>
        </div>

        <ul className="space-y-3">
          {resources.map((resource: Resource, index: number) => (
            <li key={index} className="group">
              <a
                href={resource.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                download={isOfflineMode ? true : undefined}
                className="flex items-center p-3 rounded-lg border border-[color:var(--ai-card-border)]/50 hover:border-amber-500/40 bg-[color:var(--ai-card-bg)] hover:bg-amber-500/[0.06] transition-colors group"
              >
                <div className="mr-3 p-2 rounded-full bg-amber-500/[0.08] text-amber-500 group-hover:bg-amber-500/15 transition-colors">
                  {getResourceIcon(resource.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[color:var(--ai-foreground)] font-medium group-hover:text-amber-500 transition-colors block truncate">
                    {resource.name}
                  </span>
                  {resource.description && (
                    <span className="text-xs text-[color:var(--ai-muted)] block truncate">
                      {resource.description}
                    </span>
                  )}
                </div>
                <FiExternalLink className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
