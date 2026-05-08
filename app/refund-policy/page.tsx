import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PolicyPage from '@/components/Policy/PolicyPage';
import PolicyContent from '@/components/Policy/PolicyContent';
import { legalInterpolation } from '@/config/legal';

const { Section, Paragraph, List } = PolicyContent;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal.refund');
  return { title: t('title') };
}

export default async function RefundPolicy() {
  const t = await getTranslations('legal.refund');
  const v = legalInterpolation();
  const items = (key: string, count: number) =>
    Array.from({ length: count }, (_, i) => t(`${key}.${i}`, v));

  return (
    <PolicyPage title={t('title')} lastUpdated={t('lastUpdated', v)}>
      <Section title={t('sections.intro.title', v)}>
        <Paragraph>{t('sections.intro.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.digitalContent.title', v)}>
        <Paragraph>{t('sections.digitalContent.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.discretionaryRefunds.title', v)}>
        <Paragraph>{t('sections.discretionaryRefunds.intro', v)}</Paragraph>
        <List items={items('sections.discretionaryRefunds.items', 4)} />
      </Section>

      <Section title={t('sections.subscriptions.title', v)}>
        <Paragraph>{t('sections.subscriptions.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.introOffers.title', v)}>
        <Paragraph>{t('sections.introOffers.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.copilotBonus.title', v)}>
        <Paragraph>{t('sections.copilotBonus.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.howToRequest.title', v)}>
        <Paragraph>{t('sections.howToRequest.intro', v)}</Paragraph>
        <List items={items('sections.howToRequest.items', 4)} />
        <Paragraph>{t('sections.howToRequest.timing', v)}</Paragraph>
      </Section>

      <Section title={t('sections.chargebacks.title', v)}>
        <Paragraph>{t('sections.chargebacks.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.contact.title', v)}>
        <Paragraph>{t('sections.contact.content', v)}</Paragraph>
      </Section>
    </PolicyPage>
  );
}
