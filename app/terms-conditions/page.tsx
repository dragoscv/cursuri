import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import PolicyPage from '@/components/Policy/PolicyPage';
import PolicyContent from '@/components/Policy/PolicyContent';
import { legalInterpolation } from '@/config/legal';

const { Section, Subsection, Paragraph, List } = PolicyContent;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal.terms');
  const v = legalInterpolation();
  return {
    title: t('title'),
    description: t('sections.introduction.content.welcome', v),
  };
}

export default async function TermsConditions() {
  const t = await getTranslations('legal.terms');
  const v = legalInterpolation();
  const items = (key: string, count: number) =>
    Array.from({ length: count }, (_, i) => t(`${key}.${i}`, v));

  return (
    <PolicyPage title={t('title')} lastUpdated={t('lastUpdated', v)}>
      <Section title={t('sections.operator.title', v)}>
        <Paragraph>{t('sections.operator.intro', v)}</Paragraph>
        <List
          items={[
            t('sections.operator.items.name', v),
            t('sections.operator.items.contact', v),
          ]}
        />
        <Paragraph>{t('sections.operator.businessInvoices', v)}</Paragraph>
      </Section>

      <Section title={t('sections.introduction.title', v)}>
        <Paragraph>{t('sections.introduction.content.welcome', v)}</Paragraph>
        <Paragraph>{t('sections.introduction.content.readCarefully', v)}</Paragraph>
      </Section>

      <Section title={t('sections.definitions.title', v)}>
        <List
          items={[
            t('sections.definitions.items.platform', v),
            t('sections.definitions.items.user', v),
            t('sections.definitions.items.we', v),
            t('sections.definitions.items.content', v),
            t('sections.definitions.items.subscription', v),
            t('sections.definitions.items.coursesPlan', v),
            t('sections.definitions.items.copilotPlan', v),
            t('sections.definitions.items.copilotBonus', v),
            t('sections.definitions.items.introOffer', v),
          ]}
        />
      </Section>

      <Section title={t('sections.eligibility.title', v)}>
        <Paragraph>{t('sections.eligibility.content.age', v)}</Paragraph>
        <Paragraph>{t('sections.eligibility.content.registration', v)}</Paragraph>
        <Paragraph>{t('sections.eligibility.content.responsibility', v)}</Paragraph>
        <Paragraph>{t('sections.eligibility.content.suspension', v)}</Paragraph>
      </Section>

      <Section title={t('sections.userConduct.title', v)}>
        <Paragraph>{t('sections.userConduct.intro', v)}</Paragraph>
        <List items={items('sections.userConduct.prohibitedActions', 9)} />
      </Section>

      <Section title={t('sections.intellectualProperty.title', v)}>
        <Paragraph>{t('sections.intellectualProperty.content.ownership', v)}</Paragraph>
        <Paragraph>{t('sections.intellectualProperty.content.license', v)}</Paragraph>
        <Paragraph>{t('sections.intellectualProperty.content.feedback', v)}</Paragraph>
      </Section>

      <Section title={t('sections.courseAccess.title', v)}>
        <Paragraph>{t('sections.courseAccess.content.individualPurchases', v)}</Paragraph>
        <Paragraph>{t('sections.courseAccess.content.subscriptionAccess', v)}</Paragraph>
        <Paragraph>{t('sections.courseAccess.content.billingCycle', v)}</Paragraph>
        <Paragraph>{t('sections.courseAccess.content.pricesAndTaxes', v)}</Paragraph>
        <Paragraph>{t('sections.courseAccess.content.paymentProcessor', v)}</Paragraph>
        <Paragraph>{t('sections.courseAccess.content.noFiscalInvoiceByDefault', v)}</Paragraph>
      </Section>

      <Section title={t('sections.introOffers.title', v)}>
        <Paragraph>{t('sections.introOffers.content.introOffer', v)}</Paragraph>
        <Paragraph>{t('sections.introOffers.content.noStacking', v)}</Paragraph>
        <Paragraph>{t('sections.introOffers.content.priceChangesNew', v)}</Paragraph>
        <Paragraph>{t('sections.introOffers.content.priceChangesExisting', v)}</Paragraph>
      </Section>

      <Section title={t('sections.githubCopilot.title', v)}>
        <Paragraph>{t('sections.githubCopilot.content.natureOfBonus', v)}</Paragraph>
        <Paragraph>{t('sections.githubCopilot.content.thirdParty', v)}</Paragraph>
        <Paragraph>{t('sections.githubCopilot.content.personalUseOnly', v)}</Paragraph>
        <Paragraph>{t('sections.githubCopilot.content.noWarranty', v)}</Paragraph>

        <Subsection title={t('sections.githubCopilot.discretionaryChanges.title', v)}>
          <Paragraph>{t('sections.githubCopilot.discretionaryChanges.content', v)}</Paragraph>
        </Subsection>

        <Subsection title={t('sections.githubCopilot.autoDowngrade.title', v)}>
          <Paragraph>{t('sections.githubCopilot.autoDowngrade.content', v)}</Paragraph>
        </Subsection>

        <Subsection title={t('sections.githubCopilot.noLiability.title', v)}>
          <Paragraph>{t('sections.githubCopilot.noLiability.content', v)}</Paragraph>
        </Subsection>

        <Subsection title={t('sections.githubCopilot.termination.title', v)}>
          <Paragraph>{t('sections.githubCopilot.termination.content', v)}</Paragraph>
        </Subsection>
      </Section>

      <Section title={t('sections.userContent.title', v)}>
        <Paragraph>{t('sections.userContent.content.grant', v)}</Paragraph>
        <Paragraph>{t('sections.userContent.content.warranty', v)}</Paragraph>
        <Paragraph>{t('sections.userContent.content.moderation', v)}</Paragraph>
      </Section>

      <Section title={t('sections.withdrawal.title', v)}>
        <Paragraph>{t('sections.withdrawal.content.intro', v)}</Paragraph>
        <Paragraph>{t('sections.withdrawal.content.digitalContentWaiver', v)}</Paragraph>
        <Paragraph>{t('sections.withdrawal.content.checkout', v)}</Paragraph>
        <Paragraph>{t('sections.withdrawal.content.outsideEU', v)}</Paragraph>
      </Section>

      <Section title={t('sections.refunds.title', v)}>
        <Paragraph>{t('sections.refunds.content.summary', v)}</Paragraph>
        <Paragraph>{t('sections.refunds.content.subscriptions', v)}</Paragraph>
        <Paragraph>{t('sections.refunds.content.introOfferRefunds', v)}</Paragraph>
      </Section>

      <Section title={t('sections.thirdParty.title', v)}>
        <Paragraph>{t('sections.thirdParty.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.availability.title', v)}>
        <Paragraph>{t('sections.availability.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.disclaimers.title', v)}>
        <Paragraph>{t('sections.disclaimers.content.asIs', v)}</Paragraph>
        <Paragraph>{t('sections.disclaimers.content.noResults', v)}</Paragraph>
        <Paragraph>{t('sections.disclaimers.content.noProfessionalAdvice', v)}</Paragraph>
      </Section>

      <Section title={t('sections.liability.title', v)}>
        <Paragraph>{t('sections.liability.content.general', v)}</Paragraph>
        <Paragraph>{t('sections.liability.content.cap', v)}</Paragraph>
        <Paragraph>{t('sections.liability.content.consumerCarveOut', v)}</Paragraph>
      </Section>

      <Section title={t('sections.indemnification.title', v)}>
        <Paragraph>{t('sections.indemnification.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.termination.title', v)}>
        <Paragraph>{t('sections.termination.content.byYou', v)}</Paragraph>
        <Paragraph>{t('sections.termination.content.byUs', v)}</Paragraph>
        <Paragraph>{t('sections.termination.content.survival', v)}</Paragraph>
      </Section>

      <Section title={t('sections.forceMajeure.title', v)}>
        <Paragraph>{t('sections.forceMajeure.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.changes.title', v)}>
        <Paragraph>{t('sections.changes.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.law.title', v)}>
        <Paragraph>{t('sections.law.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.anpc.title', v)}>
        <Paragraph>{t('sections.anpc.content.anpc', v)}</Paragraph>
        <Paragraph>{t('sections.anpc.content.sal', v)}</Paragraph>
        <Paragraph>{t('sections.anpc.content.odr', v)}</Paragraph>
      </Section>

      <Section title={t('sections.general.title', v)}>
        <Paragraph>{t('sections.general.content.severability', v)}</Paragraph>
        <Paragraph>{t('sections.general.content.noWaiver', v)}</Paragraph>
        <Paragraph>{t('sections.general.content.assignment', v)}</Paragraph>
        <Paragraph>{t('sections.general.content.entireAgreement', v)}</Paragraph>
        <Paragraph>{t('sections.general.content.language', v)}</Paragraph>
      </Section>

      <Section title={t('sections.contact.title', v)}>
        <Paragraph>{t('sections.contact.intro', v)}</Paragraph>
        <List
          type="none"
          items={[
            t('sections.contact.items.general', v),
            t('sections.contact.items.legal', v),
            t('sections.contact.items.privacy', v),
          ]}
        />
      </Section>
    </PolicyPage>
  );
}
