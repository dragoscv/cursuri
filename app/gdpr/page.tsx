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
            <>
              <strong>Identity Data:</strong> {sections.categories.identityData.split(': ')[1]}
            </>,
            <>
              <strong>Contact Data:</strong> {sections.categories.contactData.split(': ')[1]}
            </>,
            <>
              <strong>Financial Data:</strong> {sections.categories.financialData.split(': ')[1]}
            </>,
            <>
              <strong>Technical Data:</strong> {sections.categories.technicalData.split(': ')[1]}
            </>,
            <>
              <strong>Profile Data:</strong> {sections.categories.profileData.split(': ')[1]}
            </>,
            <>
              <strong>Usage Data:</strong> {sections.categories.usageData.split(': ')[1]}
            </>,
            <>
              <strong>Marketing Data:</strong> {sections.categories.marketingData.split(': ')[1]}
            </>,
          ]}
        />
      </Section>

      <Section title={sections.collection.title}>
        <Paragraph>{sections.collection.intro}</Paragraph>
        <List
          items={[
            <>
              <strong>Direct interactions:</strong>{' '}
              {sections.collection.directInteractions.split(': ')[1]}
            </>,
            <>
              <strong>Automated technologies:</strong>{' '}
              {sections.collection.automatedTechnologies.split(': ')[1]}
            </>,
            <>
              <strong>Third parties:</strong> {sections.collection.thirdParties.split(': ')[1]}
            </>,
          ]}
        />
      </Section>

      <Section title={sections.legalBasis.title}>
        <Paragraph>{sections.legalBasis.intro}</Paragraph>
        <List
          items={[
            <>
              <strong>Consent:</strong> {sections.legalBasis.consent.split(': ')[1]}
            </>,
            <>
              <strong>Contract:</strong> {sections.legalBasis.contract.split(': ')[1]}
            </>,
            <>
              <strong>Legal obligation:</strong>{' '}
              {sections.legalBasis.legalObligation.split(': ')[1]}
            </>,
            <>
              <strong>Legitimate interests:</strong>{' '}
              {sections.legalBasis.legitimateInterests.split(': ')[1]}
            </>,
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
            <>
              <strong>Service providers:</strong> {sections.sharing.serviceProviders.split(': ')[1]}
            </>,
            <>
              <strong>Business partners:</strong> {sections.sharing.businessPartners.split(': ')[1]}
            </>,
            <>
              <strong>Legal authorities:</strong> {sections.sharing.legalAuthorities.split(': ')[1]}
            </>,
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
            <>
              <strong>Right to access:</strong> {sections.rights.access.split(': ')[1]}
            </>,
            <>
              <strong>Right to rectification:</strong>{' '}
              {sections.rights.rectification.split(': ')[1]}
            </>,
            <>
              <strong>Right to erasure:</strong> {sections.rights.erasure.split(': ')[1]}
            </>,
            <>
              <strong>Right to restrict processing:</strong>{' '}
              {sections.rights.restrictProcessing.split(': ')[1]}
            </>,
            <>
              <strong>Right to data portability:</strong>{' '}
              {sections.rights.dataPortability.split(': ')[1]}
            </>,
            <>
              <strong>Right to object:</strong> {sections.rights.object.split(': ')[1]}
            </>,
            <>
              <strong>Rights related to automated decision-making:</strong>{' '}
              {sections.rights.automatedDecisions.split(': ')[1]}
            </>,
            <>
              <strong>Right to withdraw consent:</strong>{' '}
              {sections.rights.withdrawConsent.split(': ')[1]}
            </>,
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
