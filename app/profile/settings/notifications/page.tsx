'use client';

import React, { useContext, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AppContext } from '@/components/AppContext';
import { Card, CardBody, Tabs, Tab } from '@heroui/react';
import { motion } from 'framer-motion';
import AppSettings from '@/components/Profile/AppSettings';

export default function ProfileSettings() {
  const t = useTranslations('profile.settingsPage');
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('AppContext not found');
  }

  const { user } = context;
  const [selectedTab, setSelectedTab] = useState<string>('account');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="w-full"
    >
      <Card className="border border-[color:var(--ai-card-border)]">
        <CardBody className="p-0">
          <Tabs
            aria-label="Settings options"
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as string)}
            variant="underlined"
            classNames={{
              tabList: 'px-6 pt-4',
              cursor: 'bg-[color:var(--ai-primary)]',
              tab: 'text-[color:var(--ai-foreground)] data-[selected=true]:text-[color:var(--ai-primary)] py-4 px-4',
            }}
          >
            <Tab key="account" title={t('accountSettingsTab')} />
            <Tab key="notifications" title={t('notificationsPrivacyTab')} />
          </Tabs>

          <div className="px-6 py-6">
            {selectedTab === 'account' && (
              <div className="animate-fade-in-up">
                <h1 className="text-2xl font-bold mb-6">{t('accountSettingsTitle')}</h1>
                <p className="text-[color:var(--ai-muted)] mb-6">{t('accountSettingsDesc')}</p>
                <div className="text-center py-8">
                  <p>{t('placeholder')}</p>
                </div>
              </div>
            )}

            {selectedTab === 'notifications' && <AppSettings userId={user?.uid} />}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
