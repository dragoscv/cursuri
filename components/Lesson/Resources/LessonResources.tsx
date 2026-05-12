import React from 'react';
import { Card } from '@heroui/react';
import Button from '@/components/ui/Button';
import { FiDownload } from '@/components/icons/FeatherIcons';
import { FiFileText } from '@/components/icons/FeatherIcons/FiFileText';
import { FiLink } from '@/components/icons/FeatherIcons/FiLink';
import { FiExternalLink } from '@/components/icons/FeatherIcons/FiExternalLink';
import { LessonResource } from '@/types';
import { useTranslations } from 'next-intl';

interface LessonResourcesProps {
  resources: LessonResource[];
}

const LessonResources: React.FC<LessonResourcesProps> = ({ resources }) => {
  const t = useTranslations('courses.lessonResources');

  const getResourceIcon = (type?: string) => {
    switch (type) {
      case 'pdf':
        return <FiFileText className="text-amber-500" />;
      case 'link':
      case 'video':
        return <FiExternalLink className="text-amber-500" />;
      case 'code':
        return <FiFileText className="text-amber-500" />;
      default:
        return <FiLink className="text-amber-500" />;
    }
  };

  return (
    <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] shadow-none rounded-2xl overflow-hidden">
      <div className="p-5">
        <div className="py-3 px-4 -m-5 mb-4 border-b border-[color:var(--ai-card-border)]">
          <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
            <FiFileText className="mr-2 text-amber-500" />
            <span>{t('title')}</span>
          </h3>
        </div>{' '}
        <div className="space-y-3">
          {resources.map((resource, index) => (
            <div
              key={index}
              className="flex items-start p-3 rounded-lg border border-[color:var(--ai-card-border)]/50 hover:bg-amber-500/[0.06] hover:border-amber-500/40 transition-colors"
            >
              <div className="flex-shrink-0 mr-3 mt-1">{getResourceIcon(resource.type)}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-[color:var(--ai-foreground)] truncate">
                  {resource.name}
                </h4>
                {resource.description && (
                  <p className="text-sm text-[color:var(--ai-muted)] mt-1">
                    {resource.description}
                  </p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0">
                <Button
                  as="a"
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  variant="flat"
                  className="bg-amber-500/[0.08] hover:bg-amber-500/15 text-amber-500 transition-colors"
                  endContent={
                    resource.type === 'pdf' ? (
                      <FiDownload size={14} />
                    ) : (
                      <FiExternalLink size={14} />
                    )
                  }
                >
                  {resource.type === 'pdf' ? t('download') : t('view')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default LessonResources;
