import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import PolicyPage from '@/components/Policy/PolicyPage';
import PolicyContent from '@/components/Policy/PolicyContent';
import { legalInterpolation } from '@/config/legal';

const { Section, Subsection, Paragraph, List } = PolicyContent;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal.privacy');
  const v = legalInterpolation();
  return {
    title: t('title'),
    description: t('sections.introduction.content.welcome', v),
  };
}

export default async function PrivacyPolicy() {
  const t = await getTranslations('legal.privacy');
  const v = legalInterpolation();
  const items = (key: string, count: number) =>
    Array.from({ length: count }, (_, i) => t(`${key}.${i}`, v));

  return (
    <PolicyPage title={t('title')} lastUpdated={t('lastUpdated', v)}>
      <Section title={t('sections.introduction.title', v)}>
        <Paragraph>{t('sections.introduction.content.welcome', v)}</Paragraph>
        <Paragraph>{t('sections.introduction.content.readCarefully', v)}</Paragraph>
      </Section>

      <Section title={t('sections.controller.title', v)}>
        <Paragraph>{t('sections.controller.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.informationWeCollect.title', v)}>
        <Subsection title={t('sections.informationWeCollect.personalInformation.title', v)}>
          <Paragraph>{t('sections.informationWeCollect.personalInformation.intro', v)}</Paragraph>
          <List items={items('sections.informationWeCollect.personalInformation.situations', 5)} />
          <Paragraph>
            {t('sections.informationWeCollect.personalInformation.types.intro', v)}
          </Paragraph>
          <List
            items={items('sections.informationWeCollect.personalInformation.types.items', 6)}
          />
        </Subsection>

        <Subsection title={t('sections.informationWeCollect.usageInformation.title', v)}>
          <Paragraph>{t('sections.informationWeCollect.usageInformation.intro', v)}</Paragraph>
          <List items={items('sections.informationWeCollect.usageInformation.items', 7)} />
        </Subsection>
      </Section>

      <Section title={t('sections.howWeUseInformation.title', v)}>
        <Paragraph>{t('sections.howWeUseInformation.intro', v)}</Paragraph>
        <List items={items('sections.howWeUseInformation.purposes', 9)} />
      </Section>

      <Section title={t('sections.cookiesAndTracking.title', v)}>
        <Paragraph>{t('sections.cookiesAndTracking.intro', v)}</Paragraph>
        <Paragraph>{t('sections.cookiesAndTracking.typesIntro', v)}</Paragraph>
        <List
          items={[
            t('sections.cookiesAndTracking.types.essential', v),
            t('sections.cookiesAndTracking.types.functionality', v),
            t('sections.cookiesAndTracking.types.analytics', v),
            t('sections.cookiesAndTracking.types.marketing', v),
          ]}
        />
        <Paragraph>{t('sections.cookiesAndTracking.browserSettings', v)}</Paragraph>
      </Section>

      <Section title={t('sections.dataSharing.title', v)}>
        <Paragraph>{t('sections.dataSharing.intro', v)}</Paragraph>
        <List
          items={[
            t('sections.dataSharing.situations.businessPartners', v),
            t('sections.dataSharing.situations.serviceProviders', v),
            t('sections.dataSharing.situations.affiliates', v),
            t('sections.dataSharing.situations.legalRequirements', v),
            t('sections.dataSharing.situations.protectionOfRights', v),
            t('sections.dataSharing.situations.businessTransfers', v),
          ]}
        />
      </Section>

      <Section title={t('sections.dataSecurity.title', v)}>
        <Paragraph>{t('sections.dataSecurity.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.dataRetention.title', v)}>
        <Paragraph>{t('sections.dataRetention.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.yourRights.title', v)}>
        <Paragraph>{t('sections.yourRights.intro', v)}</Paragraph>
        <List items={items('sections.yourRights.rights', 7)} />
        <Paragraph>{t('sections.yourRights.exercise', v)}</Paragraph>
      </Section>

      <Section title={t('sections.childrensPrivacy.title', v)}>
        <Paragraph>{t('sections.childrensPrivacy.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.changesToPolicy.title', v)}>
        <Paragraph>{t('sections.changesToPolicy.content', v)}</Paragraph>
      </Section>

      <Section title={t('sections.contact.title', v)}>
        <Paragraph>{t('sections.contact.intro', v)}</Paragraph>
        <List type="none" items={[t('sections.contact.email', v)]} />
      </Section>
    </PolicyPage>
  );
}
