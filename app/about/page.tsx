import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('about.metadata');
    return {
        title: t('title'),
        description: t('description'),
    };
}

export default async function AboutPage() {
    const t = await getTranslations('about');
    
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

                {/* Mission Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-[color:var(--ai-foreground)] mb-6">{t('mission.title')}</h2>
                    <div className="bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-xl p-8">
                        <p className="text-lg text-[color:var(--ai-foreground)] leading-relaxed mb-4">
                            {t('mission.paragraph1')}
                        </p>
                        <p className="text-lg text-[color:var(--ai-foreground)] leading-relaxed">
                            {t('mission.paragraph2')}
                        </p>
                    </div>
                </div>

                {/* What We Offer */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-[color:var(--ai-foreground)] mb-8">{t('whatWeOffer.title')}</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-xl p-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-lg flex items-center justify-center mb-4">
                                <span className="text-white text-xl">🎯</span>
                            </div>
                            <h3 className="text-xl font-semibold text-[color:var(--ai-foreground)] mb-3">{t('whatWeOffer.projectBased.title')}</h3>
                            <p className="text-[color:var(--ai-muted)]">
                                {t('whatWeOffer.projectBased.description')}
                            </p>
                        </div>

                        <div className="bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-xl p-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-lg flex items-center justify-center mb-4">
                                <span className="text-white text-xl">👨‍💻</span>
                            </div>
                            <h3 className="text-xl font-semibold text-[color:var(--ai-foreground)] mb-3">{t('whatWeOffer.expertInstructors.title')}</h3>
                            <p className="text-[color:var(--ai-muted)]">
                                {t('whatWeOffer.expertInstructors.description')}
                            </p>
                        </div>

                        <div className="bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-xl p-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-lg flex items-center justify-center mb-4">
                                <span className="text-white text-xl">🔄</span>
                            </div>
                            <h3 className="text-xl font-semibold text-[color:var(--ai-foreground)] mb-3">{t('whatWeOffer.upToDate.title')}</h3>
                            <p className="text-[color:var(--ai-muted)]">
                                {t('whatWeOffer.upToDate.description')}
                            </p>
                        </div>

                        <div className="bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-xl p-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-lg flex items-center justify-center mb-4">
                                <span className="text-white text-xl">🤝</span>
                            </div>
                            <h3 className="text-xl font-semibold text-[color:var(--ai-foreground)] mb-3">{t('whatWeOffer.community.title')}</h3>
                            <p className="text-[color:var(--ai-muted)]">
                                {t('whatWeOffer.community.description')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Values */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-[color:var(--ai-foreground)] mb-8">{t('values.title')}</h2>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-[color:var(--ai-primary)] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <span className="text-white text-sm">✓</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-2">{t('values.quality.title')}</h3>
                                <p className="text-[color:var(--ai-muted)]">{t('values.quality.description')}</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-[color:var(--ai-primary)] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <span className="text-white text-sm">✓</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-2">{t('values.accessibility.title')}</h3>
                                <p className="text-[color:var(--ai-muted)]">{t('values.accessibility.description')}</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-[color:var(--ai-primary)] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <span className="text-white text-sm">✓</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-2">{t('values.improvement.title')}</h3>
                                <p className="text-[color:var(--ai-muted)]">{t('values.improvement.description')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center bg-gradient-to-r from-[color:var(--ai-primary)]/10 to-[color:var(--ai-secondary)]/10 rounded-xl p-8">
                    <h2 className="text-2xl font-bold text-[color:var(--ai-foreground)] mb-4">{t('cta.title')}</h2>
                    <p className="text-[color:var(--ai-muted)] mb-6">
                        {t('cta.description')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/courses"
                            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                            {t('cta.browseCourses')}
                        </a>
                        <a
                            href="/contact"
                            className="border border-[color:var(--ai-primary)] text-[color:var(--ai-primary)] px-8 py-3 rounded-lg font-medium hover:bg-[color:var(--ai-primary)]/10 transition-colors"
                        >
                            {t('cta.contactUs')}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}