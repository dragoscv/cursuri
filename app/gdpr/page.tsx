'use client'

import React from 'react'
import PolicyPage from '@/components/Policy/PolicyPage'
import PolicyContent from '@/components/Policy/PolicyContent'

const { Section, Paragraph, List } = PolicyContent;

export default function GDPRPolicy() {
    return (
        <PolicyPage title="GDPR Policy" lastUpdated="April 4, 2025">
            <Section title="1. Introduction">
                <Paragraph>
                    This GDPR Policy explains how Cursuri ("we," "our," or "us") processes personal data in accordance with the General Data Protection Regulation (GDPR) and outlines your rights as a data subject.
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
                <List items={[
                    "To create and manage your account",
                    "To provide and manage our courses and services",
                    "To process payments and maintain financial records",
                    "To personalize your experience on our platform",
                    "To communicate with you regarding your account, purchases, or inquiries",
                    "To send you marketing communications (where you have opted in)",
                    "To improve our platform, products, and services",
                    "To ensure platform security and prevent fraud",
                    "To comply with legal obligations"
                ]} />
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
                <List items={[
                    "Using Standard Contractual Clauses approved by the European Commission",
                    "Transferring to countries that have been deemed to provide an adequate level of protection",
                    "Implementing binding corporate rules where applicable"
                ]} />
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

            <Section title="13. Changes to This GDPR Policy">
                <Paragraph>
                    We may update this GDPR Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on our platform and updating the "Last Updated" date.
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