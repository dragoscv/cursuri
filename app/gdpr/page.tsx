import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PolicyPage from '@/components/Policy/PolicyPage';
import PolicyContent from '@/components/Policy/PolicyContent';

const { Section, Paragraph, List } = PolicyContent;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal.gdpr');
  return {
    title: `${t('title')} | Cursuri`,
    description: t('sections.introduction.paragraph1'),
  };
}

export default async function GDPRPolicy() {
  const t = await getTranslations('legal.gdpr');
  const sections = t.raw('sections');

  return (
    <PolicyPage title={t('title')} lastUpdated={t('lastUpdated')}>
      <Section title={sections.introduction.title}>
        <Paragraph>{sections.introduction.paragraph1}</Paragraph>
        <Paragraph>{sections.introduction.paragraph2}</Paragraph>
      </Section>

      <Section title={sections.dataController.title}>
        <Paragraph>{sections.dataController.intro}</Paragraph>
        <List type="none" items={[sections.dataController.email]} />
      </Section>

      <Section title={sections.categories.title}>
        <Paragraph>{sections.categories.intro}</Paragraph>
        <List
          items={[
            sections.categories.identityData,
            sections.categories.contactData,
            sections.categories.financialData,
            sections.categories.technicalData,
            sections.categories.profileData,
            sections.categories.usageData,
            sections.categories.marketingData,
          ]}
        />
      </Section>

      <Section title={sections.collection.title}>
        <Paragraph>{sections.collection.intro}</Paragraph>
        <List
          items={[
            sections.collection.directInteractions,
            sections.collection.automatedTechnologies,
            sections.collection.thirdParties,
          ]}
        />
      </Section>

      <Section title={sections.legalBasis.title}>
        <Paragraph>{sections.legalBasis.intro}</Paragraph>
        <List
          items={[
            sections.legalBasis.consent,
            sections.legalBasis.contract,
            sections.legalBasis.legalObligation,
            sections.legalBasis.legitimateInterests,
          ]}
        />
      </Section>

      <Section title={sections.purposes.title}>
        <Paragraph>{sections.purposes.intro}</Paragraph>
        <List items={sections.purposes.items} />
      </Section>

      <Section title={sections.retention.title}>
        <Paragraph>{sections.retention.paragraph1}</Paragraph>
        <Paragraph>{sections.retention.paragraph2}</Paragraph>
      </Section>

      <Section title={sections.sharing.title}>
        <Paragraph>{sections.sharing.intro}</Paragraph>
        <List
          items={[
            sections.sharing.serviceProviders,
            sections.sharing.businessPartners,
            sections.sharing.legalAuthorities,
          ]}
        />
        <Paragraph>{sections.sharing.requirements}</Paragraph>
      </Section>

      <Section title={sections.internationalTransfers.title}>
        <Paragraph>{sections.internationalTransfers.intro}</Paragraph>
        <List items={sections.internationalTransfers.items} />
      </Section>

      <Section title={sections.rights.title}>
        <Paragraph>{sections.rights.intro}</Paragraph>
        <List
          items={[
            sections.rights.access,
            sections.rights.rectification,
            sections.rights.erasure,
            sections.rights.restrictProcessing,
            sections.rights.dataPortability,
            sections.rights.object,
            sections.rights.automatedDecisions,
            sections.rights.withdrawConsent,
          ]}
        />
        <Paragraph>{sections.rights.exercise}</Paragraph>
      </Section>

      <Section title={sections.security.title}>
        <Paragraph>{sections.security.paragraph1}</Paragraph>
        <Paragraph>{sections.security.paragraph2}</Paragraph>
      </Section>

      <Section title={sections.cookies.title}>
        <Paragraph>{sections.cookies.content}</Paragraph>
      </Section>

      <Section title={sections.changes.title}>
        <Paragraph>{sections.changes.content}</Paragraph>
      </Section>

      <Section title={sections.complaints.title}>
        <Paragraph>{sections.complaints.content}</Paragraph>
      </Section>
    </PolicyPage>
  );
}
