import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import PolicyPage from '@/components/Policy/PolicyPage';
import PolicyContent from '@/components/Policy/PolicyContent';

const { Section, Subsection, Paragraph, List } = PolicyContent;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal.terms');

  return {
    title: t('title'),
    description: t('sections.introduction.content.welcome'),
  };
}

export default async function TermsConditions() {
  const t = await getTranslations('legal.terms');

  return (
    <PolicyPage title={t('title')} lastUpdated={t('lastUpdated')}>
      <Section title={t('sections.introduction.title')}>
        <Paragraph>{t('sections.introduction.content.welcome')}</Paragraph>
        <Paragraph>{t('sections.introduction.content.readCarefully')}</Paragraph>
      </Section>

      <Section title={t('sections.definitions.title')}>
        <List
          items={[
            t('sections.definitions.items.platform'),
            t('sections.definitions.items.user'),
            t('sections.definitions.items.we'),
            t('sections.definitions.items.content'),
            t('sections.definitions.items.subscription'),
          ]}
        />
      </Section>

      <Section title={t('sections.accountRegistration.title')}>
        <Paragraph>{t('sections.accountRegistration.content.registration')}</Paragraph>
        <Paragraph>{t('sections.accountRegistration.content.responsibility')}</Paragraph>
      </Section>

      <Section title={t('sections.userConduct.title')}>
        <Paragraph>{t('sections.userConduct.intro')}</Paragraph>
        <List
          items={[
            t('sections.userConduct.prohibitedActions.0'),
            t('sections.userConduct.prohibitedActions.1'),
            t('sections.userConduct.prohibitedActions.2'),
            t('sections.userConduct.prohibitedActions.3'),
            t('sections.userConduct.prohibitedActions.4'),
            t('sections.userConduct.prohibitedActions.5'),
            t('sections.userConduct.prohibitedActions.6'),
            t('sections.userConduct.prohibitedActions.7'),
            t('sections.userConduct.prohibitedActions.8'),
          ]}
        />
      </Section>

      <Section title={t('sections.intellectualProperty.title')}>
        <Paragraph>{t('sections.intellectualProperty.content.ownership')}</Paragraph>
        <Paragraph>{t('sections.intellectualProperty.content.license')}</Paragraph>
      </Section>

      <Section title={t('sections.coursesAndSubscriptions.title')}>
        <Subsection title={t('sections.coursesAndSubscriptions.courseAccess.title')}>
          <Paragraph>{t('sections.coursesAndSubscriptions.courseAccess.content')}</Paragraph>
        </Subsection>

        <Subsection title={t('sections.coursesAndSubscriptions.paymentsAndRefunds.title')}>
          <Paragraph>{t('sections.coursesAndSubscriptions.paymentsAndRefunds.content')}</Paragraph>
        </Subsection>

        <Subsection title={t('sections.coursesAndSubscriptions.courseUpdates.title')}>
          <Paragraph>{t('sections.coursesAndSubscriptions.courseUpdates.content')}</Paragraph>
        </Subsection>
      </Section>

      <Section title={t('sections.userGeneratedContent.title')}>
        <Paragraph>{t('sections.userGeneratedContent.content.grant')}</Paragraph>
        <Paragraph>{t('sections.userGeneratedContent.content.warranty')}</Paragraph>
      </Section>

      <Section title={t('sections.thirdParty.title')}>
        <Paragraph>{t('sections.thirdParty.content')}</Paragraph>
      </Section>

      <Section title={t('sections.disclaimerOfWarranties.title')}>
        <Paragraph>{t('sections.disclaimerOfWarranties.content.asIs')}</Paragraph>
        <Paragraph>{t('sections.disclaimerOfWarranties.content.noGuarantee')}</Paragraph>
      </Section>

      <Section title={t('sections.limitationOfLiability.title')}>
        <Paragraph>{t('sections.limitationOfLiability.content')}</Paragraph>
      </Section>

      <Section title={t('sections.indemnification.title')}>
        <Paragraph>{t('sections.indemnification.content')}</Paragraph>
      </Section>

      <Section title={t('sections.termination.title')}>
        <Paragraph>{t('sections.termination.content.right')}</Paragraph>
        <Paragraph>{t('sections.termination.content.effect')}</Paragraph>
      </Section>

      <Section title={t('sections.changesToTerms.title')}>
        <Paragraph>{t('sections.changesToTerms.content')}</Paragraph>
      </Section>

      <Section title={t('sections.governingLaw.title')}>
        <Paragraph>{t('sections.governingLaw.content')}</Paragraph>
      </Section>

      <Section title={t('sections.contact.title')}>
        <Paragraph>{t('sections.contact.intro')}</Paragraph>
        <List type="none" items={[t('sections.contact.email')]} />
      </Section>
    </PolicyPage>
  );
}
