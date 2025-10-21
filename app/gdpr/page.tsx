import React from 'react'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import PolicyPage from '@/components/Policy/PolicyPage'
import PolicyContent from '@/components/Policy/PolicyContent'

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
                <List items={[
                    <><strong>Identity Data:</strong> {sections.categories.identityData.split(': ')[1]}</>,
                    <><strong>Contact Data:</strong> {sections.categories.contactData.split(': ')[1]}</>,
                    <><strong>Financial Data:</strong> {sections.categories.financialData.split(': ')[1]}</>,
                    <><strong>Technical Data:</strong> {sections.categories.technicalData.split(': ')[1]}</>,
                    <><strong>Profile Data:</strong> {sections.categories.profileData.split(': ')[1]}</>,
                    <><strong>Usage Data:</strong> {sections.categories.usageData.split(': ')[1]}</>,
                    <><strong>Marketing Data:</strong> {sections.categories.marketingData.split(': ')[1]}</>
                ]} />
            </Section>

            <Section title={sections.collection.title}>
                <Paragraph>{sections.collection.intro}</Paragraph>
                <List items={[
                    <><strong>Direct interactions:</strong> {sections.collection.directInteractions.split(': ')[1]}</>,
                    <><strong>Automated technologies:</strong> {sections.collection.automatedTechnologies.split(': ')[1]}</>,
                    <><strong>Third parties:</strong> {sections.collection.thirdParties.split(': ')[1]}</>
                ]} />
            </Section>

            <Section title={sections.legalBasis.title}>
                <Paragraph>{sections.legalBasis.intro}</Paragraph>
                <List items={[
                    <><strong>Consent:</strong> {sections.legalBasis.consent.split(': ')[1]}</>,
                    <><strong>Contract:</strong> {sections.legalBasis.contract.split(': ')[1]}</>,
                    <><strong>Legal obligation:</strong> {sections.legalBasis.legalObligation.split(': ')[1]}</>,
                    <><strong>Legitimate interests:</strong> {sections.legalBasis.legitimateInterests.split(': ')[1]}</>
                ]} />
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
                <List items={[
                    <><strong>Service providers:</strong> {sections.sharing.serviceProviders.split(': ')[1]}</>,
                    <><strong>Business partners:</strong> {sections.sharing.businessPartners.split(': ')[1]}</>,
                    <><strong>Legal authorities:</strong> {sections.sharing.legalAuthorities.split(': ')[1]}</>
                ]} />
                <Paragraph>{sections.sharing.requirements}</Paragraph>
            </Section>

            <Section title={sections.internationalTransfers.title}>
                <Paragraph>{sections.internationalTransfers.intro}</Paragraph>
                <List items={sections.internationalTransfers.items} />
            </Section>

            <Section title={sections.rights.title}>
                <Paragraph>{sections.rights.intro}</Paragraph>
                <List items={[
                    <><strong>Right to access:</strong> {sections.rights.access.split(': ')[1]}</>,
                    <><strong>Right to rectification:</strong> {sections.rights.rectification.split(': ')[1]}</>,
                    <><strong>Right to erasure:</strong> {sections.rights.erasure.split(': ')[1]}</>,
                    <><strong>Right to restrict processing:</strong> {sections.rights.restrictProcessing.split(': ')[1]}</>,
                    <><strong>Right to data portability:</strong> {sections.rights.dataPortability.split(': ')[1]}</>,
                    <><strong>Right to object:</strong> {sections.rights.object.split(': ')[1]}</>,
                    <><strong>Rights related to automated decision-making:</strong> {sections.rights.automatedDecisions.split(': ')[1]}</>,
                    <><strong>Right to withdraw consent:</strong> {sections.rights.withdrawConsent.split(': ')[1]}</>
                ]} />
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
    )
}
            <Section title="1. Introduction">                <Paragraph>
                This GDPR Policy explains how Cursuri (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) processes personal data in accordance with the General Data Protection Regulation (GDPR) and outlines your rights as a data subject.
            </Paragraph>
                <Paragraph>
                    We are committed to protecting your privacy and handling your data in an open and transparent manner. This policy applies where we are acting as a data controller with respect to your personal data.
                </Paragraph>
            </Section>

            <Section title="2. Data Controller">
                <Paragraph>
                    Cursuri is the data controller responsible for your personal data. If you have any questions about this GDPR Policy or our data practices, please contact our Data Protection Officer at:
                </Paragraph>
                <List type="none" items={["Email: dpo@cursuri.dev"]} />
            </Section>

            <Section title="3. Categories of Personal Data We Process">
                <Paragraph>
                    We may process the following categories of personal data about you:
                </Paragraph>
                <List items={[
                    <><strong>Identity Data:</strong> Name, username, date of birth</>,
                    <><strong>Contact Data:</strong> Email address, phone number, address</>,
                    <><strong>Financial Data:</strong> Payment information, purchase history</>,
                    <><strong>Technical Data:</strong> IP address, browser type and version, time zone setting, device information</>,
                    <><strong>Profile Data:</strong> Username, password, purchases, interests, preferences</>,
                    <><strong>Usage Data:</strong> Information about how you use our platform, courses viewed, completion rates</>,
                    <><strong>Marketing Data:</strong> Preferences in receiving marketing from us</>
                ]} />
            </Section>

            <Section title="4. How We Collect Your Personal Data">
                <Paragraph>
                    We collect personal data through various methods:
                </Paragraph>
                <List items={[
                    <><strong>Direct interactions:</strong> When you create an account, purchase courses, or contact us</>,
                    <><strong>Automated technologies:</strong> As you interact with our platform, we may automatically collect Technical Data</>,
                    <><strong>Third parties:</strong> We may receive data from analytics providers, payment providers, and social media platforms</>
                ]} />
            </Section>

            <Section title="5. Legal Basis for Processing">
                <Paragraph>
                    We will only process your personal data when we have a legal basis to do so. The legal bases we rely on include:
                </Paragraph>
                <List items={[
                    <><strong>Consent:</strong> When you have explicitly agreed to the processing of your personal data</>,
                    <><strong>Contract:</strong> When processing is necessary for the performance of a contract with you</>,
                    <><strong>Legal obligation:</strong> When processing is necessary for compliance with a legal obligation</>,
                    <><strong>Legitimate interests:</strong> When processing is necessary for our legitimate interests, provided they are not overridden by your rights</>
                ]} />
            </Section>

            <Section title="6. Purposes of Processing">
                <Paragraph>
                    We process your personal data for the following purposes:
                </Paragraph>
                <List items={t.raw('gdpr.sections.purposes.items')} />
            </Section>

            <Section title="7. Data Retention">
                <Paragraph>
                    We will retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including legal, accounting, or reporting requirements.
                </Paragraph>
                <Paragraph>
                    Different retention periods apply to different types of data. To determine the appropriate retention period for personal data, we consider the amount, nature, and sensitivity of the personal data, the potential risk of harm from unauthorized use or disclosure, the purposes for which we process it, and whether we can achieve those purposes through other means.
                </Paragraph>
            </Section>

            <Section title="8. Data Sharing">
                <Paragraph>
                    We may share your personal data with:
                </Paragraph>
                <List items={[
                    <><strong>Service providers:</strong> Companies that provide services to us, such as payment processing, analytics, marketing</>,
                    <><strong>Business partners:</strong> Trusted third parties who help us deliver our services</>,
                    <><strong>Legal authorities:</strong> When required by law or to protect our rights</>
                ]} />
                <Paragraph>
                    We require all third parties to respect the security of your personal data and to treat it in accordance with the law. We only permit our third-party service providers to process your personal data for specified purposes and in accordance with our instructions.
                </Paragraph>
            </Section>

            <Section title="9. International Transfers">
                <Paragraph>
                    We may transfer your personal data to countries outside the European Economic Area (EEA). Whenever we transfer your personal data outside the EEA, we ensure a similar degree of protection is afforded to it by implementing appropriate safeguards:
                </Paragraph>
                <List items={t.raw('gdpr.sections.internationalTransfers.items')} />
            </Section>

            <Section title="10. Your Rights as a Data Subject">
                <Paragraph>
                    Under the GDPR, you have the following rights:
                </Paragraph>
                <List items={[
                    <><strong>Right to access:</strong> You can request a copy of your personal data</>,
                    <><strong>Right to rectification:</strong> You can request correction of inaccurate or incomplete data</>,
                    <><strong>Right to erasure:</strong> You can request deletion of your personal data in certain circumstances</>,
                    <><strong>Right to restrict processing:</strong> You can request restriction of processing in certain circumstances</>,
                    <><strong>Right to data portability:</strong> You can request transfer of your data to another organization</>,
                    <><strong>Right to object:</strong> You can object to processing based on legitimate interests or direct marketing</>,
                    <><strong>Rights related to automated decision-making:</strong> You can request human intervention for decisions based solely on automated processing</>,
                    <><strong>Right to withdraw consent:</strong> You can withdraw consent at any time where we rely on consent to process your data</>
                ]} />
                <Paragraph>
                    To exercise any of these rights, please contact us at dpo@cursuri.dev.
                </Paragraph>
            </Section>

            <Section title="11. Data Security">
                <Paragraph>
                    We have implemented appropriate technical and organizational measures to protect your personal data against unauthorized access, accidental loss, alteration, or disclosure. These measures include encryption, access controls, regular security assessments, and staff training.
                </Paragraph>
                <Paragraph>
                    We regularly review our security practices to ensure ongoing protection of your data.
                </Paragraph>
            </Section>

            <Section title="12. Cookies and Similar Technologies">
                <Paragraph>
                    We use cookies and similar technologies to enhance your experience on our platform. For detailed information about how we use cookies, please see our Cookie Policy available on our platform.
                </Paragraph>
            </Section>

            <Section title="13. Changes to This GDPR Policy">                <Paragraph>
                We may update this GDPR Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on our platform and updating the &quot;Last Updated&quot; date.
            </Paragraph>
            </Section>

            <Section title="14. Complaints">
                <Paragraph>
                    If you have concerns about our data processing practices, please contact us first. You also have the right to lodge a complaint with your local data protection authority if you believe we have not complied with applicable data protection laws.
                </Paragraph>
            </Section>
        </PolicyPage>
    )
}