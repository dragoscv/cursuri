import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PolicyPage from '@/components/Policy/PolicyPage';
import PolicyContent from '@/components/Policy/PolicyContent';
import { legalInterpolation } from '@/config/legal';

const { Section, Paragraph, List } = PolicyContent;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal.gdpr');
  const v = legalInterpolation();
  return {
    title: `${t('title')} | ${v.brandName}`,
    description: t('sections.introduction.paragraph1', v),
  };
}

export default async function GDPRPolicy() {
  const t = await getTranslations('legal.gdpr');
  const v = legalInterpolation();
  const items = (key: string, count: number) =>
    Array.from({ length: count }, (_, i) => t(`${key}.${i}`, v));

  return (
    <PolicyPage title={t('title')} lastUpdated={t('lastUpdated', v)}>
      <Section title={t('sections.introduction.title', v)}>
        <Paragraph>{t('sections.introduction.paragraph1', v)}</Paragraph>
        <Paragraph>{t('sections.introduction.paragraph2', v)}</Paragraph>
      </Section>

      <Section title={t('sections.dataController.title', v)}>
        <Paragraph>{t('sections.dataController.intro', v)}</Paragraph>
        <List type="none" items={[t('sections.dataController.email', v)]} />
      </Section>

      <Section title={t('sections.categories.title', v)}>
        <Paragraph>{t('sections.categories.intro', v)}</Paragraph>
        <List
          items={[
            t('sections.categories.identityData', v),
            t('sections.categories.contactData', v),
            t('sections.categories.financialData', v),
            t('sections.categories.technicalData', v),
            t('sections.categories.profileData', v),
            t('sections.categories.usageData', v),
            t('sections.categories.marketingData', v),
            t('sections.categories.copilotData', v),
          ]}
        />
      </Section>

      <Section title={t('sections.collection.title', v)}>
        <Paragraph>{t('sections.collection.intro', v)}</Paragraph>
        <List
          items={[
            t('sections.collection.directInteractions', v),
            t('sections.collection.automatedTechnologies', v),
            t('sections.collection.thirdParties', v),
          ]}
        />
      </Section>

      <Section title={t('sections.legalBasis.title', v)}>
        <Paragraph>{t('sections.legalBasis.intro', v)}</Paragraph>
        <List
          items={[
            t('sections.legalBasis.consent', v),
            t('sections.legalBasis.contract', v),
            t('sections.legalBasis.legalObligation', v),
            t('sections.legalBasis.legitimateInterests', v),
          ]}
        />
      </Section>

      <Section title={t('sections.purposes.title', v)}>
        <Paragraph>{t('sections.purposes.intro', v)}</Paragraph>
        <List items={items('sections.purposes.items', 8)} />
      </Section>

      <Section title={t('sections.retention.title', v)}>
        <Paragraph>{t('sections.retention.paragraph1', v)}</Paragraph>
        <Paragraph>{t('sections.retention.paragraph2', v)}</Paragraph>
      </Section>

      <Section title={t('sections.sharing.title', v)}>
        <Paragraph>{t('sections.sharing.intro', v)}</Paragraph>
        <List
          items={[
            t('sections.sharing.serviceProviders', v),
            t('sections.sharing.businessPartners', v),
            t('sections.sharing.legalAuthorities', v),
          ]}
        />
        <Paragraph>{t('sections.sharing.requirements', v)}</Paragraph>
      </Section>

      <Section title={t('sections.internationalTransfers.title', v)}>
        <Paragraph>{t('sections.internationalTransfers.intro', v)}</Paragraph>
        <List items={items('sections.internationalTransfers.items', 4)} />
      </Section>

      <Section title={t('sections.rights.title', v)}>
        <Paragraph>{t('sections.rights.intro', v)}</Paragraph>
        <List
          items={[
            t('sections.rights.access', v),
            t('sections.rights.rectification', v),
            t('sections.rights.erasure', v),
            t('sections.rights.restrictProcessing', v),
            t('sections.rights.dataPortability', v),
            t('sections.rights.object', v),
            t('sections.rights.automatedDecisions', v),
            t('sections.rights.withdrawConsent', v),
          ]}
        />
        <Paragraph>{t('sections.rights.exercise', v)}</Paragraph>
      </Section>

      <Section title={t('sections.security.title', v)}>
        <Paragraph>{t('sections.security.paragraph1', v)}</Paragraph>
        <Paragraph>{t('sections.security.paragraph2', v)}</Paragraph>
      </Section>

      <Section title={t('sections.cookies.title', v)}>
        <Paragraph>{t('sections.cookies.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.changes.title', v)}>
        <Paragraph>{t('sections.changes.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.complaints.title', v)}>
        <Paragraph>{t('sections.complaints.content', v)}</Paragraph>
      </Section>
    </PolicyPage>
  );
}
