import React from 'react';
import Button from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

interface OnboardingModalProps {
    onClose: () => void;
}

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
    const t = useTranslations('common.onboarding');
    const [step, setStep] = React.useState(0);

    const steps = [
        {
            title: t('welcome.title'),
            description: t('welcome.description')
        },
        {
            title: t('personalized.title'),
            description: t('personalized.description')
        },
        {
            title: t('community.title'),
            description: t('community.description')
        }
    ];

    const isLast = step === steps.length - 1;

    return (
        <div className="flex flex-col items-center p-6 min-w-[320px] max-w-[90vw]">
            <h2 className="text-2xl font-bold mb-2 text-center">{steps[step].title}</h2>
            <p className="text-[color:var(--ai-muted)] mb-6 text-center">{steps[step].description}</p>
            <div className="flex gap-2 mt-4">
                {step > 0 && (
                    <Button variant="flat" onClick={() => setStep(step - 1)}>
                        {t('back')}
                    </Button>
                )}
                {!isLast && (
                    <Button color="primary" onClick={() => setStep(step + 1)}>
                        {t('next')}
                    </Button>
                )}
                {isLast && (
                    <Button color="primary" onClick={onClose}>
                        {t('getStarted')}
                    </Button>
                )}
            </div>
            <div className="flex gap-1 mt-6">
                {steps.map((_, i) => (
                    <span key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-[color:var(--ai-primary)]' : 'bg-[color:var(--ai-card-border)]'}`}></span>
                ))}
            </div>
        </div>
    );
}
