import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import PolicyPage from '@/components/Policy/PolicyPage';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal.privacy');

  return {
    title: t('title'),
    description: t('sections.introduction.content.welcome'),
  };
}

export default async function PrivacyPolicy() {
  const t = await getTranslations('legal.privacy');

  return (
    <PolicyPage title={t('title')} lastUpdated={t('lastUpdated')}>
      <h2 className="text-2xl font-semibold mt-8 mb-4">{t('sections.introduction.title')}</h2>
      <p>{t('sections.introduction.content.welcome')}</p>
      <p>{t('sections.introduction.content.readCarefully')}</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        {t('sections.informationWeCollect.title')}
      </h2>
      <h3 className="text-xl font-medium mt-6 mb-2">
        {t('sections.informationWeCollect.personalInformation.title')}
      </h3>
      <p>{t('sections.informationWeCollect.personalInformation.intro')}</p>
      <ul className="list-disc pl-6 mb-4">
        <li>{t('sections.informationWeCollect.personalInformation.situations.0')}</li>
        <li>{t('sections.informationWeCollect.personalInformation.situations.1')}</li>
        <li>{t('sections.informationWeCollect.personalInformation.situations.2')}</li>
        <li>{t('sections.informationWeCollect.personalInformation.situations.3')}</li>
        <li>{t('sections.informationWeCollect.personalInformation.situations.4')}</li>
      </ul>
      <p>{t('sections.informationWeCollect.personalInformation.types.intro')}</p>
      <ul className="list-disc pl-6 mb-4">
        <li>{t('sections.informationWeCollect.personalInformation.types.items.0')}</li>
        <li>{t('sections.informationWeCollect.personalInformation.types.items.1')}</li>
        <li>{t('sections.informationWeCollect.personalInformation.types.items.2')}</li>
        <li>{t('sections.informationWeCollect.personalInformation.types.items.3')}</li>
        <li>{t('sections.informationWeCollect.personalInformation.types.items.4')}</li>
        <li>{t('sections.informationWeCollect.personalInformation.types.items.5')}</li>
      </ul>

      <h3 className="text-xl font-medium mt-6 mb-2">
        {t('sections.informationWeCollect.usageInformation.title')}
      </h3>
      <p>{t('sections.informationWeCollect.usageInformation.intro')}</p>
      <ul className="list-disc pl-6 mb-4">
        <li>{t('sections.informationWeCollect.usageInformation.items.0')}</li>
        <li>{t('sections.informationWeCollect.usageInformation.items.1')}</li>
        <li>{t('sections.informationWeCollect.usageInformation.items.2')}</li>
        <li>{t('sections.informationWeCollect.usageInformation.items.3')}</li>
        <li>{t('sections.informationWeCollect.usageInformation.items.4')}</li>
        <li>{t('sections.informationWeCollect.usageInformation.items.5')}</li>
        <li>{t('sections.informationWeCollect.usageInformation.items.6')}</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        {t('sections.howWeUseInformation.title')}
      </h2>
      <p>{t('sections.howWeUseInformation.intro')}</p>
      <ul className="list-disc pl-6 mb-4">
        <li>{t('sections.howWeUseInformation.purposes.0')}</li>
        <li>{t('sections.howWeUseInformation.purposes.1')}</li>
        <li>{t('sections.howWeUseInformation.purposes.2')}</li>
        <li>{t('sections.howWeUseInformation.purposes.3')}</li>
        <li>{t('sections.howWeUseInformation.purposes.4')}</li>
        <li>{t('sections.howWeUseInformation.purposes.5')}</li>
        <li>{t('sections.howWeUseInformation.purposes.6')}</li>
        <li>{t('sections.howWeUseInformation.purposes.7')}</li>
        <li>{t('sections.howWeUseInformation.purposes.8')}</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">{t('sections.cookiesAndTracking.title')}</h2>
      <p>{t('sections.cookiesAndTracking.intro')}</p>
      <p>{t('sections.cookiesAndTracking.typesIntro')}</p>
      <ul className="list-disc pl-6 mb-4">
        <li>
          <strong>{t('sections.cookiesAndTracking.types.essential')}</strong>
        </li>
        <li>
          <strong>{t('sections.cookiesAndTracking.types.functionality')}</strong>
        </li>
        <li>
          <strong>{t('sections.cookiesAndTracking.types.analytics')}</strong>
        </li>
        <li>
          <strong>{t('sections.cookiesAndTracking.types.marketing')}</strong>
        </li>
      </ul>
      <p>{t('sections.cookiesAndTracking.browserSettings')}</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">{t('sections.dataSharing.title')}</h2>
      <p>{t('sections.dataSharing.intro')}</p>
      <ul className="list-disc pl-6 mb-4">
        <li>
          <strong>{t('sections.dataSharing.situations.businessPartners')}</strong>
        </li>
        <li>
          <strong>{t('sections.dataSharing.situations.serviceProviders')}</strong>
        </li>
        <li>
          <strong>{t('sections.dataSharing.situations.affiliates')}</strong>
        </li>
        <li>
          <strong>{t('sections.dataSharing.situations.legalRequirements')}</strong>
        </li>
        <li>
          <strong>{t('sections.dataSharing.situations.protectionOfRights')}</strong>
        </li>
        <li>
          <strong>{t('sections.dataSharing.situations.businessTransfers')}</strong>
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">{t('sections.dataSecurity.title')}</h2>
      <p>{t('sections.dataSecurity.content')}</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">{t('sections.dataRetention.title')}</h2>
      <p>{t('sections.dataRetention.content')}</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">{t('sections.yourRights.title')}</h2>
      <p>{t('sections.yourRights.intro')}</p>
      <ul className="list-disc pl-6 mb-4">
        <li>{t('sections.yourRights.rights.0')}</li>
        <li>{t('sections.yourRights.rights.1')}</li>
        <li>{t('sections.yourRights.rights.2')}</li>
        <li>{t('sections.yourRights.rights.3')}</li>
        <li>{t('sections.yourRights.rights.4')}</li>
        <li>{t('sections.yourRights.rights.5')}</li>
        <li>{t('sections.yourRights.rights.6')}</li>
      </ul>
      <p>{t('sections.yourRights.exercise')}</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">{t('sections.childrensPrivacy.title')}</h2>
      <p>{t('sections.childrensPrivacy.content')}</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">{t('sections.changesToPolicy.title')}</h2>
      <p>{t('sections.changesToPolicy.content')}</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">{t('sections.contact.title')}</h2>
      <p>{t('sections.contact.intro')}</p>
      <ul className="list-none mb-4">
        <li>{t('sections.contact.email')}</li>
      </ul>
    </PolicyPage>
  );
}
