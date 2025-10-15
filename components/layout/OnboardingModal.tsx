import React from 'react';
import { Button } from '@heroui/react';

interface OnboardingModalProps {
    onClose: () => void;
}

const steps = [
    {
        title: 'Welcome to Cursuri!',
        description: 'Get started by exploring our course catalog and customizing your profile.'
    },
    {
        title: 'Track Your Progress',
        description: 'Mark lessons as complete and see your learning journey unfold.'
    },
    {
        title: 'Join the Community',
        description: 'Leave reviews, ask questions, and connect with other learners.'
    }
];

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
    const [step, setStep] = React.useState(0);
    const isLast = step === steps.length - 1;

    return (
        <div className="flex flex-col items-center p-6 min-w-[320px] max-w-[90vw]">
            <h2 className="text-2xl font-bold mb-2 text-center">{steps[step].title}</h2>
            <p className="text-[color:var(--ai-muted)] mb-6 text-center">{steps[step].description}</p>
            <div className="flex gap-2 mt-4">
                {step > 0 && (
                    <Button variant="flat" onClick={() => setStep(step - 1)}>
                        Back
                    </Button>
                )}
                {!isLast && (
                    <Button color="primary" onClick={() => setStep(step + 1)}>
                        Next
                    </Button>
                )}
                {isLast && (
                    <Button color="primary" onClick={onClose}>
                        Get Started
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
