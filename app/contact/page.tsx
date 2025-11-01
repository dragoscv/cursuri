'use client';

import React, { useContext, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestoreDB } from '@/utils/firebase/firebase.config';
import { AppContext } from '@/components/AppContext';
import { useToast } from '@/components/Toast/ToastContext';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import GithubIcon from '@/components/icons/GithubIcon';
import TikTokIcon from '@/components/icons/TikTokIcon';
import WebsiteIcon from '@/components/icons/WebsiteIcon';
import { DiscordIcon } from '@/components/icons/DiscordIcon';

function ContactForm() {
  const t = useTranslations('contact');
  const context = useContext(AppContext);
  const { showToast } = useToast();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isUserAuthenticated = !!context?.user;
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;  // Prefill user data if authenticated
  useEffect(() => {
    if (context?.user) {
      setFormData(prev => ({
        ...prev,
        name: context.user?.displayName || prev.name,
        email: context.user?.email || prev.email,
      }));
    }
  }, [context?.user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Validate fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      showToast({
        type: 'error',
        message: t('form.errors.requiredFields'),
        duration: 5000,
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast({
        type: 'error',
        message: t('form.errors.invalidEmail'),
        duration: 5000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get reCAPTCHA token for anonymous users (v3 is invisible)
      let recaptchaToken = '';
      if (!isUserAuthenticated && executeRecaptcha) {
        recaptchaToken = await executeRecaptcha('contact_form');
      }

      const contactMessageData: any = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        status: 'new',
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      // Add userId if user is authenticated
      if (context?.user) {
        contactMessageData.userId = context.user.uid;
      }

      // Store in Firestore
      const contactMessagesRef = collection(firestoreDB, 'contactMessages');
      await addDoc(contactMessagesRef, contactMessageData);

      // Show success toast
      showToast({
        type: 'success',
        message: t('form.success'),
        duration: 5000,
      });

      // Reset form (keep name and email if user is authenticated)
      setFormData({
        name: context?.user?.displayName || '',
        email: context?.user?.email || '',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting contact message:', error);
      showToast({
        type: 'error',
        message: t('form.errors.submitFailed'),
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--ai-background)] pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[color:var(--ai-foreground)] mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-[color:var(--ai-muted)] max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-xl p-8">
            <h2 className="text-2xl font-bold text-[color:var(--ai-foreground)] mb-6">
              {t('form.title')}
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2"
                >
                  {t('form.labels.name')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[color:var(--ai-background)] border border-[color:var(--ai-card-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)] focus:border-transparent text-[color:var(--ai-foreground)] disabled:opacity-60"
                  placeholder={t('form.placeholders.name')}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2"
                >
                  {t('form.labels.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[color:var(--ai-background)] border border-[color:var(--ai-card-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)] focus:border-transparent text-[color:var(--ai-foreground)] disabled:opacity-60"
                  placeholder={t('form.placeholders.email')}
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2"
                >
                  {t('form.labels.subject')}
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[color:var(--ai-background)] border border-[color:var(--ai-card-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)] focus:border-transparent text-[color:var(--ai-foreground)]"
                >
                  <option value="">{t('form.subjects.placeholder')}</option>
                  <option value="course-inquiry">{t('form.subjects.courseInquiry')}</option>
                  <option value="technical-support">{t('form.subjects.technicalSupport')}</option>
                  <option value="billing">{t('form.subjects.billing')}</option>
                  <option value="partnership">{t('form.subjects.partnership')}</option>
                  <option value="feedback">{t('form.subjects.feedback')}</option>
                  <option value="other">{t('form.subjects.other')}</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2"
                >
                  {t('form.labels.message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[color:var(--ai-background)] border border-[color:var(--ai-card-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)] focus:border-transparent text-[color:var(--ai-foreground)] resize-vertical"
                  placeholder={t('form.placeholders.message')}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    {t('form.submitting')}
                  </>
                ) : (
                  t('form.submitButton')
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Info */}
            <div className="bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-xl p-8">
              <h2 className="text-2xl font-bold text-[color:var(--ai-foreground)] mb-6">
                {t('info.title')}
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">📧</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-1">
                      {t('info.email.title')}
                    </h3>
                    <a
                      href="mailto:contact@studiai.ro"
                      className="text-[color:var(--ai-primary)] hover:underline"
                    >
                      {t('info.email.value')}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">🕒</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-1">
                      {t('info.responseTime.title')}
                    </h3>
                    <p className="text-[color:var(--ai-muted)]">
                      {t('info.responseTime.description')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">🌍</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-1">
                      {t('info.globalSupport.title')}
                    </h3>
                    <p className="text-[color:var(--ai-muted)]">
                      {t('info.globalSupport.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-xl p-8">
              <h2 className="text-2xl font-bold text-[color:var(--ai-foreground)] mb-6">
                {t('faq.title')}
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-2">
                    {t('faq.refunds.question')}
                  </h3>
                  <p className="text-[color:var(--ai-muted)]">{t('faq.refunds.answer')}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-2">
                    {t('faq.mobile.question')}
                  </h3>
                  <p className="text-[color:var(--ai-muted)]">{t('faq.mobile.answer')}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-2">
                    {t('faq.certificates.question')}
                  </h3>
                  <p className="text-[color:var(--ai-muted)]">{t('faq.certificates.answer')}</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-xl p-8">
              <h2 className="text-2xl font-bold text-[color:var(--ai-foreground)] mb-6">
                {t('social.title')}
              </h2>

              <div className="flex gap-4">
                <a
                  href="https://github.com/dragoscv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[color:var(--ai-primary)]/10 border border-[color:var(--ai-primary)]/20 rounded-lg flex items-center justify-center hover:bg-[color:var(--ai-primary)]/20 transition-colors"
                  aria-label="GitHub"
                >
                  <GithubIcon className="text-[color:var(--ai-primary)]" size={24} />
                </a>
                <a
                  href="https://discord.gg/SbqrU73MjB"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[color:var(--ai-primary)]/10 border border-[color:var(--ai-primary)]/20 rounded-lg flex items-center justify-center hover:bg-[color:var(--ai-primary)]/20 transition-colors"
                  aria-label="Discord"
                >
                  <DiscordIcon className="text-[color:var(--ai-primary)]" size={24} />
                </a>
                <a
                  href="https://www.tiktok.com/@mantreb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[color:var(--ai-primary)]/10 border border-[color:var(--ai-primary)]/20 rounded-lg flex items-center justify-center hover:bg-[color:var(--ai-primary)]/20 transition-colors"
                  aria-label="TikTok"
                >
                  <TikTokIcon className="text-[color:var(--ai-primary)]" size={24} />
                </a>
                <a
                  href="https://dragoscatalin.ro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[color:var(--ai-primary)]/10 border border-[color:var(--ai-primary)]/20 rounded-lg flex items-center justify-center hover:bg-[color:var(--ai-primary)]/20 transition-colors"
                  aria-label="Website"
                >
                  <WebsiteIcon className="text-[color:var(--ai-primary)]" size={24} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!recaptchaSiteKey) {
    // If no reCAPTCHA key, render without provider
    return <ContactForm />;
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
      <ContactForm />
    </GoogleReCaptchaProvider>
  );
}
