'use client'

import React from 'react'
import PolicyPage from '@/components/Policy/PolicyPage'

export default function GDPRPolicy() {
    return (
        <PolicyPage title="GDPR Policy" lastUpdated="April 4, 2025">
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
            <p>
                This GDPR Policy explains how Cursuri ("we," "our," or "us") processes personal data in accordance with the General Data Protection Regulation (GDPR) and outlines your rights as a data subject.
            </p>
            <p>
                We are committed to protecting your privacy and handling your data in an open and transparent manner. This policy applies where we are acting as a data controller with respect to your personal data.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Data Controller</h2>
            <p>
                Cursuri is the data controller responsible for your personal data. If you have any questions about this GDPR Policy or our data practices, please contact our Data Protection Officer at:
            </p>
            <ul className="list-none mb-4">
                <li>Email: dpo@cursuri.dev</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Categories of Personal Data We Process</h2>
            <p>
                We may process the following categories of personal data about you:
            </p>
            <ul className="list-disc pl-6 mb-4">
                <li><strong>Identity Data:</strong> Name, username, date of birth</li>
                <li><strong>Contact Data:</strong> Email address, phone number, address</li>
                <li><strong>Financial Data:</strong> Payment information, purchase history</li>
                <li><strong>Technical Data:</strong> IP address, browser type and version, time zone setting, device information</li>
                <li><strong>Profile Data:</strong> Username, password, purchases, interests, preferences</li>
                <li><strong>Usage Data:</strong> Information about how you use our platform, courses viewed, completion rates</li>
                <li><strong>Marketing Data:</strong> Preferences in receiving marketing from us</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. How We Collect Your Personal Data</h2>
            <p>
                We collect personal data through various methods:
            </p>
            <ul className="list-disc pl-6 mb-4">
                <li><strong>Direct interactions:</strong> When you create an account, purchase courses, or contact us</li>
                <li><strong>Automated technologies:</strong> As you interact with our platform, we may automatically collect Technical Data</li>
                <li><strong>Third parties:</strong> We may receive data from analytics providers, payment providers, and social media platforms</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Legal Basis for Processing</h2>
            <p>
                We will only process your personal data when we have a legal basis to do so. The legal bases we rely on include:
            </p>
            <ul className="list-disc pl-6 mb-4">
                <li><strong>Consent:</strong> When you have explicitly agreed to the processing of your personal data</li>
                <li><strong>Contract:</strong> When processing is necessary for the performance of a contract with you</li>
                <li><strong>Legal obligation:</strong> When processing is necessary for compliance with a legal obligation</li>
                <li><strong>Legitimate interests:</strong> When processing is necessary for our legitimate interests, provided they are not overridden by your rights</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Purposes of Processing</h2>
            <p>
                We process your personal data for the following purposes:
            </p>
            <ul className="list-disc pl-6 mb-4">
                <li>To create and manage your account</li>
                <li>To provide and manage our courses and services</li>
                <li>To process payments and maintain financial records</li>
                <li>To personalize your experience on our platform</li>
                <li>To communicate with you regarding your account, purchases, or inquiries</li>
                <li>To send you marketing communications (where you have opted in)</li>
                <li>To improve our platform, products, and services</li>
                <li>To ensure platform security and prevent fraud</li>
                <li>To comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Data Retention</h2>
            <p>
                We will retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including legal, accounting, or reporting requirements.
            </p>
            <p>
                Different retention periods apply to different types of data. To determine the appropriate retention period for personal data, we consider the amount, nature, and sensitivity of the personal data, the potential risk of harm from unauthorized use or disclosure, the purposes for which we process it, and whether we can achieve those purposes through other means.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Data Sharing</h2>
            <p>
                We may share your personal data with:
            </p>
            <ul className="list-disc pl-6 mb-4">
                <li><strong>Service providers:</strong> Companies that provide services to us, such as payment processing, analytics, marketing</li>
                <li><strong>Business partners:</strong> Trusted third parties who help us deliver our services</li>
                <li><strong>Legal authorities:</strong> When required by law or to protect our rights</li>
            </ul>
            <p>
                We require all third parties to respect the security of your personal data and to treat it in accordance with the law. We only permit our third-party service providers to process your personal data for specified purposes and in accordance with our instructions.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">9. International Transfers</h2>
            <p>
                We may transfer your personal data to countries outside the European Economic Area (EEA). Whenever we transfer your personal data outside the EEA, we ensure a similar degree of protection is afforded to it by implementing appropriate safeguards:
            </p>
            <ul className="list-disc pl-6 mb-4">
                <li>Using Standard Contractual Clauses approved by the European Commission</li>
                <li>Transferring to countries that have been deemed to provide an adequate level of protection</li>
                <li>Implementing binding corporate rules where applicable</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Your Rights as a Data Subject</h2>
            <p>
                Under the GDPR, you have the following rights:
            </p>
            <ul className="list-disc pl-6 mb-4">
                <li><strong>Right to access:</strong> You can request a copy of your personal data</li>
                <li><strong>Right to rectification:</strong> You can request correction of inaccurate or incomplete data</li>
                <li><strong>Right to erasure:</strong> You can request deletion of your personal data in certain circumstances</li>
                <li><strong>Right to restrict processing:</strong> You can request restriction of processing in certain circumstances</li>
                <li><strong>Right to data portability:</strong> You can request transfer of your data to another organization</li>
                <li><strong>Right to object:</strong> You can object to processing based on legitimate interests or direct marketing</li>
                <li><strong>Rights related to automated decision-making:</strong> You can request human intervention for decisions based solely on automated processing</li>
                <li><strong>Right to withdraw consent:</strong> You can withdraw consent at any time where we rely on consent to process your data</li>
            </ul>
            <p>
                To exercise any of these rights, please contact us at dpo@cursuri.dev.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">11. Data Security</h2>
            <p>
                We have implemented appropriate technical and organizational measures to protect your personal data against unauthorized access, accidental loss, alteration, or disclosure. These measures include encryption, access controls, regular security assessments, and staff training.
            </p>
            <p>
                We regularly review our security practices to ensure ongoing protection of your data.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">12. Cookies and Similar Technologies</h2>
            <p>
                We use cookies and similar technologies to enhance your experience on our platform. For detailed information about how we use cookies, please see our Cookie Policy available on our platform.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">13. Changes to This GDPR Policy</h2>
            <p>
                We may update this GDPR Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on our platform and updating the "Last Updated" date.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">14. Complaints</h2>
            <p>
                If you have concerns about our data processing practices, please contact us first. You also have the right to lodge a complaint with your local data protection authority if you believe we have not complied with applicable data protection laws.
            </p>
        </PolicyPage>
    )
}