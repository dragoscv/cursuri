'use client'

import React from 'react'
import PolicyPage from '@/components/Policy/PolicyPage'
import PolicyContent from '@/components/Policy/PolicyContent'

const { Section, Subsection, Paragraph, List } = PolicyContent;

export default function TermsConditions() {
    return (
        <PolicyPage title="Terms and Conditions" lastUpdated="April 4, 2025">
            <Section title="1. Introduction">
                <Paragraph>
                    Welcome to Cursuri. These Terms and Conditions govern your use of our website, courses, and services. By accessing or using our platform, you agree to be bound by these Terms.
                </Paragraph>
                <Paragraph>
                    Please read these Terms carefully before using our services. If you do not agree with any part of these Terms, you must not use our platform.
                </Paragraph>
            </Section>

            <Section title="2. Definitions">                <List items={[
                <><strong>&quot;Platform&quot;</strong> refers to the Cursuri website and all its contents, features, and services.</>,
                <><strong>&quot;User,&quot; &quot;You,&quot; and &quot;Your&quot;</strong> refer to the individual or entity accessing or using the Platform.</>,
                <><strong>&quot;We,&quot; &quot;Us,&quot; and &quot;Our&quot;</strong> refer to Cursuri.</>,
                <><strong>&quot;Content&quot;</strong> refers to course materials, videos, text, graphics, images, and other materials available on the Platform.</>,
                <><strong>&quot;Subscription&quot;</strong> refers to the paid access to courses or services offered on the Platform.</>
            ]} />
            </Section>

            <Section title="3. Account Registration">
                <Paragraph>
                    To access certain features of the Platform, you must register for an account. When you register, you agree to provide accurate, current, and complete information and to update this information to maintain its accuracy.
                </Paragraph>
                <Paragraph>
                    You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
                </Paragraph>
            </Section>

            <Section title="4. User Conduct">
                <Paragraph>
                    By using our Platform, you agree not to:
                </Paragraph>
                <List items={[
                    "Violate any applicable laws or regulations",
                    "Infringe upon the rights of others",
                    "Share your account or course access with others",
                    "Attempt to access restricted areas of the Platform",
                    "Use the Platform for any illegal or unauthorized purpose",
                    "Transmit viruses, malware, or other harmful code",
                    "Interfere with the proper working of the Platform",
                    "Collect or track personal information of other users",
                    "Engage in any activity that could damage, disable, or impair the Platform"
                ]} />
            </Section>

            <Section title="5. Intellectual Property">
                <Paragraph>
                    All content on the Platform, including courses, videos, text, graphics, logos, and software, is the property of Cursuri or its content providers and is protected by copyright, trademark, and other intellectual property laws.
                </Paragraph>
                <Paragraph>
                    You are granted a limited, non-exclusive, non-transferable license to access and use the content for personal, non-commercial purposes. You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any content without our express written permission.
                </Paragraph>
            </Section>

            <Section title="6. Courses and Subscriptions">
                <Subsection title="Course Access">
                    <Paragraph>
                        Upon purchasing a course or subscription, you will be granted access to the course materials for the specified period. Access may vary depending on the type of course or subscription purchased.
                    </Paragraph>
                </Subsection>

                <Subsection title="Payments and Refunds">
                    <Paragraph>
                        All payments are processed securely through our payment processors. Prices for courses and subscriptions are subject to change without notice. We may offer refunds at our discretion according to our refund policy.
                    </Paragraph>
                </Subsection>

                <Subsection title="Course Updates">
                    <Paragraph>
                        We strive to keep our course content up-to-date. We reserve the right to modify, update, or remove course content at any time without notice.
                    </Paragraph>
                </Subsection>
            </Section>

            <Section title="7. User-Generated Content">
                <Paragraph>
                    Certain parts of our Platform may allow users to post content, such as reviews, comments, or forum posts. By posting content, you grant us a non-exclusive, royalty-free, perpetual, irrevocable, and fully sublicensable right to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such content worldwide.
                </Paragraph>
                <Paragraph>
                    You represent and warrant that you own or have the necessary rights to the content you post and that such content does not violate the rights of any third party.
                </Paragraph>
            </Section>

            <Section title="8. Third-Party Links and Services">
                <Paragraph>
                    Our Platform may contain links to third-party websites or services that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
                </Paragraph>
            </Section>

            <Section title="9. Disclaimer of Warranties">                <Paragraph>
                The Platform and its content are provided on an &quot;as is&quot; and &quot;as available&quot; basis without any warranties of any kind. We disclaim all warranties, express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
            </Paragraph>
                <Paragraph>
                    We do not guarantee that the Platform will be error-free, uninterrupted, secure, or that any defects will be corrected.
                </Paragraph>
            </Section>

            <Section title="10. Limitation of Liability">
                <Paragraph>
                    In no event shall Cursuri be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Platform.
                </Paragraph>
            </Section>

            <Section title="11. Indemnification">
                <Paragraph>
                    You agree to indemnify, defend, and hold harmless Cursuri and its officers, directors, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys&apos; fees) arising from your use of the Platform, your violation of these Terms, or your violation of any rights of another.
                </Paragraph>
            </Section>

            <Section title="12. Termination">
                <Paragraph>
                    We may terminate or suspend your account and access to the Platform immediately, without prior notice or liability, for any reason, including but not limited to a breach of these Terms.
                </Paragraph>
                <Paragraph>
                    Upon termination, your right to use the Platform will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive termination.
                </Paragraph>
            </Section>

            <Section title="13. Changes to Terms">
                <Paragraph>
                    We reserve the right to modify or replace these Terms at any time. We will provide notice of any material changes by posting the updated Terms on the Platform and updating the &quot;Last Updated&quot; date. Your continued use of the Platform after any such changes constitutes your acceptance of the new Terms.
                </Paragraph>
            </Section>

            <Section title="14. Governing Law">
                <Paragraph>
                    These Terms shall be governed by and construed in accordance with the laws of Romania, without regard to its conflict of law provisions.
                </Paragraph>
            </Section>

            <Section title="15. Contact Us">
                <Paragraph>
                    If you have any questions about these Terms, please contact us at:
                </Paragraph>
                <List type="none" items={["Email: contact@cursuri.dev"]} />
            </Section>
        </PolicyPage>
    )
}