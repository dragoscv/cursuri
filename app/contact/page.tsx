import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('contact.metadata');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ContactPage() {
  const t = await getTranslations('contact');

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

            <form className="space-y-6">
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
                  className="w-full px-4 py-3 bg-[color:var(--ai-background)] border border-[color:var(--ai-card-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)] focus:border-transparent text-[color:var(--ai-foreground)]"
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
                  className="w-full px-4 py-3 bg-[color:var(--ai-background)] border border-[color:var(--ai-card-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)] focus:border-transparent text-[color:var(--ai-foreground)]"
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
                  className="w-full px-4 py-3 bg-[color:var(--ai-background)] border border-[color:var(--ai-card-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)] focus:border-transparent text-[color:var(--ai-foreground)] resize-vertical"
                  placeholder={t('form.placeholders.message')}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)] focus:ring-offset-2"
              >
                {t('form.submitButton')}
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
                      href="mailto:contact@cursuri.dev"
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
                  className="w-12 h-12 bg-[color:var(--ai-primary)]/10 border border-[color:var(--ai-primary)]/20 rounded-lg flex items-center justify-center hover:bg-[color:var(--ai-primary)]/20 transition-colors"
                >
                  <span className="text-[color:var(--ai-primary)] text-lg">🐙</span>
                </a>
                <a
                  href="https://tiktok.com/@dragoscatalin.ro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-[color:var(--ai-primary)]/10 border border-[color:var(--ai-primary)]/20 rounded-lg flex items-center justify-center hover:bg-[color:var(--ai-primary)]/20 transition-colors"
                >
                  <span className="text-[color:var(--ai-primary)] text-lg">🎵</span>
                </a>
                <a
                  href="https://dragoscatalin.ro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-[color:var(--ai-primary)]/10 border border-[color:var(--ai-primary)]/20 rounded-lg flex items-center justify-center hover:bg-[color:var(--ai-primary)]/20 transition-colors"
                >
                  <span className="text-[color:var(--ai-primary)] text-lg">🌐</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
