import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PolicyPage from '@/components/Policy/PolicyPage';
import PolicyContent from '@/components/Policy/PolicyContent';
import { legalInterpolation } from '@/config/legal';

const { Section, Paragraph, List } = PolicyContent;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal.legalNotice');
  return { title: t('title') };
}

export default async function LegalNotice() {
  const t = await getTranslations('legal.legalNotice');
  const v = legalInterpolation();

  return (
    <PolicyPage title={t('title')} lastUpdated={t('lastUpdated', v)}>
      <Section title={t('sections.operator.title', v)}>
        <List
          items={[
            t('sections.operator.items.brand', v),
            t('sections.operator.items.name', v),
            t('sections.operator.items.site', v),
          ]}
        />
      </Section>

      <Section title={t('sections.contact.title', v)}>
        <List
          type="none"
          items={[
            t('sections.contact.items.general', v),
            t('sections.contact.items.support', v),
            t('sections.contact.items.legal', v),
            t('sections.contact.items.privacy', v),
            t('sections.contact.items.phone', v),
          ]}
        />
      </Section>

      <Section title={t('sections.consumerAuthorities.title', v)}>
        <List
          items={[
            t('sections.consumerAuthorities.items.anpc', v),
            t('sections.consumerAuthorities.items.sal', v),
            t('sections.consumerAuthorities.items.odr', v),
            t('sections.consumerAuthorities.items.dpa', v),
          ]}
        />
      </Section>

      <Section title={t('sections.hosting.title', v)}>
        <Paragraph>{t('sections.hosting.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.ip.title', v)}>
        <Paragraph>{t('sections.ip.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.responsibility.title', v)}>
        <Paragraph>{t('sections.responsibility.content', v)}</Paragraph>
      </Section>
    </PolicyPage>
  );
}
