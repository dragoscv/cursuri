import React from 'react';
import { Button } from '@heroui/react';

interface OnboardingModalProps {
    onClose: () => void;
}

const steps = [
    {
        title: 'Welcome to Cursuri Platform',
        description: 'Your comprehensive learning journey starts here. Explore our extensive catalog of professionally curated courses designed to elevate your skills and advance your career. Customize your profile, set learning goals, and track your progress as you master new technologies and concepts.'
    },
    {
        title: 'Personalized Learning Experience',
        description: 'Take control of your educational journey with our advanced progress tracking system. Mark lessons as complete, monitor your achievements, and receive personalized recommendations based on your learning patterns. Your dashboard provides real-time insights into your skill development and completion milestones.'
    },
    {
        title: 'Engage with Our Community',
        description: 'Join thousands of learners in our vibrant community. Share your experiences through course reviews, participate in discussions, ask questions, and collaborate with peers. Our community-driven approach ensures you have the support and resources needed to succeed in your learning objectives.'
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
