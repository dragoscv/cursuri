'use client'

import React, { useState } from 'react';
import { Card, Textarea, Button, Avatar } from '@heroui/react';
import { FiMessageSquare, FiSend, FiBookOpen } from '@/components/icons/FeatherIcons';

interface QAProps {
    lessonId: string;
}

// We'll create a placeholder for the actual QA functionality
// In a real implementation, this would fetch questions from the database
const QASection: React.FC<QAProps> = ({ lessonId }) => {
    const [question, setQuestion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Placeholder sample questions
    const sampleQuestions = [
        {
            id: '1',
            question: 'How can I implement the code shown at 5:24 in the video?',
            answer: 'You can implement this by following the steps outlined in the documentation. Make sure to import the necessary libraries first, then follow the pattern shown in the video.',
            user: {
                name: 'Alex Johnson',
                avatar: 'https://i.pravatar.cc/150?img=1'
            },
            timestamp: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
        },
        {
            id: '2',
            question: 'Are there any prerequisites for this lesson that weren\'t mentioned?',
            answer: 'This lesson assumes you have completed the previous sections on state management. If you haven\'t gone through those yet, I recommend checking them out first.',
            user: {
                name: 'Sarah Miller',
                avatar: 'https://i.pravatar.cc/150?img=5'
            },
            timestamp: new Date(Date.now() - 3600000 * 72).toISOString() // 3 days ago
        }
    ];

    const handleSubmitQuestion = async () => {
        if (!question.trim()) return;
        
        setIsSubmitting(true);
        
        // This would be where you'd submit to a database in a real implementation
        setTimeout(() => {
            setQuestion('');
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
            <div className="p-5">
                <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-transparent py-3 px-4 -m-5 mb-4 border-b border-[color:var(--ai-card-border)]">
                    <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                        <FiMessageSquare className="mr-2 text-[color:var(--ai-primary)]" />
                        <span>Questions & Answers</span>
                    </h3>
                </div>

                {/* Question Input */}
                <div className="mb-6">
                    <div className="mb-2 text-sm text-[color:var(--ai-muted)]">
                        Ask a question about this lesson
                    </div>
                    <div className="flex gap-2">
                        <Textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Type your question here..."
                            className="flex-1 border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/80 text-[color:var(--ai-foreground)] placeholder:text-[color:var(--ai-muted)]/70"
                        />
                        <Button
                            onClick={handleSubmitQuestion}
                            color="primary"
                            isLoading={isSubmitting}
                            isDisabled={!question.trim() || isSubmitting}
                            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white border-none self-end transition-transform hover:scale-[1.02]"
                            startContent={<FiSend size={16} />}
                        >
                            Submit
                        </Button>
                    </div>
                </div>

                {/* Previous Questions */}
                <div className="space-y-4">
                    <div className="text-sm font-medium text-[color:var(--ai-foreground)]">
                        Previous Questions
                    </div>
                    
                    {sampleQuestions.length > 0 ? (
                        sampleQuestions.map(qa => (
                            <div 
                                key={qa.id} 
                                className="p-4 rounded-lg border border-[color:var(--ai-card-border)]/50 bg-[color:var(--ai-card-bg)]/80"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <Avatar src={qa.user.avatar} alt={qa.user.name} className="w-8 h-8" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div className="font-medium text-[color:var(--ai-foreground)]">
                                                {qa.user.name}
                                            </div>
                                            <div className="text-xs text-[color:var(--ai-muted)]">
                                                {new Date(qa.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <p className="mt-1 text-[color:var(--ai-foreground)]">
                                            <FiBookOpen className="inline-block mr-1 text-[color:var(--ai-primary)]" size={14} />
                                            {qa.question}
                                        </p>
                                    </div>
                                </div>
                                
                                {qa.answer && (
                                    <div className="ml-11 p-3 bg-[color:var(--ai-primary)]/5 rounded-lg">
                                        <div className="text-xs text-[color:var(--ai-muted)] mb-1">
                                            Instructor Response
                                        </div>
                                        <div className="text-sm text-[color:var(--ai-foreground)]">
                                            {qa.answer}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-6 text-[color:var(--ai-muted)]">
                            <FiMessageSquare className="mx-auto mb-2 text-[color:var(--ai-muted)]" size={24} />
                            <p>No questions yet. Be the first to ask!</p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default QASection;