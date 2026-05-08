import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PolicyPage from '@/components/Policy/PolicyPage';
import PolicyContent from '@/components/Policy/PolicyContent';
import { legalInterpolation } from '@/config/legal';

const { Section, Paragraph, List } = PolicyContent;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal.cookies');
  return { title: t('title') };
}

export default async function CookiePolicy() {
  const t = await getTranslations('legal.cookies');
  const v = legalInterpolation();

  return (
    <PolicyPage title={t('title')} lastUpdated={t('lastUpdated', v)}>
      <Section title={t('sections.intro.title', v)}>
        <Paragraph>{t('sections.intro.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.operator.title', v)}>
        <Paragraph>{t('sections.operator.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.categories.title', v)}>
        <Paragraph>{t('sections.categories.intro', v)}</Paragraph>
        <List
          items={[
            t('sections.categories.items.essential', v),
            t('sections.categories.items.functionality', v),
            t('sections.categories.items.analytics', v),
            t('sections.categories.items.marketing', v),
          ]}
        />
      </Section>

      <Section title={t('sections.manage.title', v)}>
        <Paragraph>{t('sections.manage.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.doNotTrack.title', v)}>
        <Paragraph>{t('sections.doNotTrack.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.changes.title', v)}>
        <Paragraph>{t('sections.changes.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.contact.title', v)}>
        <Paragraph>{t('sections.contact.content', v)}</Paragraph>
      </Section>
    </PolicyPage>
  );
}
