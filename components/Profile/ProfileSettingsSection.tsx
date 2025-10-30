import React from 'react';
import { Card, CardBody, Switch } from '@heroui/react';
import { FiSettings } from '@/components/icons/FeatherIcons';
import { useTranslations } from 'next-intl';

interface ProfileSettingsSectionProps {
  isDark?: boolean;
  emailNotifications?: boolean;
  courseUpdates?: boolean;
  onToggleDark?: (value: boolean) => void;
  onToggleEmailNotifications?: (value: boolean) => void;
  onToggleCourseUpdates?: (value: boolean) => void;
}

export default function ProfileSettingsSection({
  isDark = false,
  emailNotifications = true,
  courseUpdates = true,
  onToggleDark,
  onToggleEmailNotifications,
  onToggleCourseUpdates,
}: ProfileSettingsSectionProps) {
  const t = useTranslations('profile.settings');

  return (
    <div className="mb-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
      <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
        <div className="p-5">
          <div className="bg-gradient-to-r from-[color:var(--ai-secondary)]/10 via-[color:var(--ai-secondary)]/5 to-transparent py-3 px-4 -m-5 mb-4 border-b border-[color:var(--ai-card-border)]">
            <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
              <FiSettings className="mr-2 text-[color:var(--ai-secondary)]" />
              <span>{t('title')}</span>
            </h3>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[color:var(--ai-foreground)]">{t('darkMode')}</span>
              <Switch isSelected={isDark} onValueChange={onToggleDark} color="primary" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[color:var(--ai-foreground)]">
                {t('emailNotifications')}
              </span>
              <Switch
                isSelected={emailNotifications}
                onValueChange={onToggleEmailNotifications}
                color="primary"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[color:var(--ai-foreground)]">{t('courseUpdates')}</span>
              <Switch
                isSelected={courseUpdates}
                onValueChange={onToggleCourseUpdates}
                color="primary"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
