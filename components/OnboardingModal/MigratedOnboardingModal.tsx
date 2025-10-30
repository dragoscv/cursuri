'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@heroui/react';
import { useAuth } from '../contexts/modules';
import { useTranslations } from 'next-intl';

/**
 * Onboarding Modal Component - Migrated to use modular contexts
 *
 * This component is displayed for new users on their first login
 * It shows a step-by-step introduction to the platform
 */
export default function OnboardingModal() {
  const [step, setStep] = useState(0);
  const t = useTranslations('onboarding');
  // const { closeModal } = useModal();

  const steps = [
    {
      title: t('step1.title'),
      description: t('step1.description'),
    },
    {
      title: t('step2.title'),
      description: t('step2.description'),
    },
    {
      title: t('step3.title'),
      description: t('step3.description'),
    },
  ];

  const isLast = step === steps.length - 1;

  const handleComplete = async () => {
    try {
      // For now, just log completion
      // TODO: Implement proper onboarding completion tracking and modal closing
      console.log('Onboarding completed');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 min-w-[320px] max-w-[90vw]">
      <h2 className="text-2xl font-bold mb-2 text-center">{steps[step].title}</h2>
      <p className="text-[color:var(--ai-muted)] mb-6 text-center">{steps[step].description}</p>
      <div className="flex gap-2 mt-4">
        {step > 0 && (
          <Button variant="flat" onClick={() => setStep(step - 1)}>
            {t('buttons.back')}
          </Button>
        )}
        {!isLast && (
          <Button color="primary" onClick={() => setStep(step + 1)}>
            {t('buttons.next')}
          </Button>
        )}
        {isLast && (
          <Button color="primary" onClick={handleComplete}>
            {t('buttons.getStarted')}
          </Button>
        )}
      </div>
      <div className="flex gap-1 mt-6">
        {steps.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${i === step ? 'bg-[color:var(--ai-primary)]' : 'bg-[color:var(--ai-card-border)]'}`}
          ></span>
        ))}
      </div>
    </div>
  );
}

/**
 * Hook to check if onboarding should be shown and open the modal if needed
 */
export function useOnboardingCheck() {
  const { user, userProfile, userPreferences } = useAuth();
  // const { openModal } = useModal();

  useEffect(() => {
    // Show onboarding for authenticated users who haven't completed it yet
    // TODO: Implement proper onboarding completion tracking and modal opening
    // Disabled for now - re-enable when modal context is fixed
    const onboardingEnabled = false;
    if (user && userProfile && onboardingEnabled) {
      console.log('Onboarding check - would open modal here');
      // TODO: Re-enable when modal context is fixed
      // openModal({
      //     id: 'onboarding',
      //     isOpen: true,
      //     modalBody: <OnboardingModal />,
      //     modalHeader: 'Welcome to Cursuri',
      //     isDismissable: false,
      //     hideCloseIcon: true,
      //     hideCloseButton: true,
      //     footerDisabled: true,
      //     headerDisabled: false,
      //     size: 'md'
      // });
    }
  }, [user, userProfile]);
}
