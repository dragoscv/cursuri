import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PolicyPage from '@/components/Policy/PolicyPage';
import PolicyContent from '@/components/Policy/PolicyContent';
import { legalInterpolation } from '@/config/legal';

const { Section, Paragraph, List } = PolicyContent;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal.dsa');
  return { title: t('title') };
}

export default async function DsaNotice() {
  const t = await getTranslations('legal.dsa');
  const v = legalInterpolation();
  const items = (key: string, count: number) =>
    Array.from({ length: count }, (_, i) => t(`${key}.${i}`, v));

  return (
    <PolicyPage title={t('title')} lastUpdated={t('lastUpdated', v)}>
      <Section title={t('sections.scope.title', v)}>
        <Paragraph>{t('sections.scope.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.singleContact.title', v)}>
        <Paragraph>{t('sections.singleContact.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.legalRepresentative.title', v)}>
        <Paragraph>{t('sections.legalRepresentative.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.illegalContent.title', v)}>
        <Paragraph>{t('sections.illegalContent.intro', v)}</Paragraph>
        <List items={items('sections.illegalContent.items', 4)} />
        <Paragraph>{t('sections.illegalContent.outro', v)}</Paragraph>
      </Section>

      <Section title={t('sections.decisions.title', v)}>
        <Paragraph>{t('sections.decisions.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.internalComplaints.title', v)}>
        <Paragraph>{t('sections.internalComplaints.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.outOfCourt.title', v)}>
        <Paragraph>{t('sections.outOfCourt.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.trustedFlaggers.title', v)}>
        <Paragraph>{t('sections.trustedFlaggers.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.transparency.title', v)}>
        <Paragraph>{t('sections.transparency.content', v)}</Paragraph>
      </Section>
    </PolicyPage>
  );
}
