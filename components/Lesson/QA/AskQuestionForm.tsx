// filepath: e:\GitHub\cursuri\components\Lesson\QA\AskQuestionForm.tsx
'use client'

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { Textarea, Input } from '@heroui/react';

interface AskQuestionFormProps {
    onSubmit: (title: string, content: string) => void;
    onCancel: () => void;
}

const AskQuestionForm: React.FC<AskQuestionFormProps> = ({ onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ title?: string, content?: string }>({});

    const validateForm = () => {
        const newErrors: { title?: string, content?: string } = {};

        if (!title.trim()) {
            newErrors.title = 'Question title is required';
        } else if (title.trim().length < 5) {
            newErrors.title = 'Title must be at least 5 characters';
        } else if (title.trim().length > 150) {
            newErrors.title = 'Title must be less than 150 characters';
        }

        if (!content.trim()) {
            newErrors.content = 'Question details are required';
        } else if (content.trim().length < 10) {
            newErrors.content = 'Details must be at least 10 characters';
        } else if (content.trim().length > 2000) {
            newErrors.content = 'Details must be less than 2000 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            await onSubmit(title, content);
            setTitle('');
            setContent('');
            setErrors({});
        } catch (error) {
            console.error("Error submitting question:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
                <Input
                    type="text"
                    label="Question Title"
                    placeholder="What's your question about this lesson?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full"
                    isInvalid={!!errors.title}
                    errorMessage={errors.title}
                    description="Be specific and imagine you're asking another student"
                />
            </div>

            <div>
                <Textarea
                    label="Question Details"
                    placeholder="Provide as much detail as possible about your question... What have you tried? What exactly is confusing you?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={5}
                    className="w-full resize-y"
                    isInvalid={!!errors.content}
                    errorMessage={errors.content}
                    description="Include all relevant information for others to understand your question"
                />
            </div>

            <div className="flex justify-end gap-2">
                <Button
                    variant="flat"
                    color="default"
                    onClick={onCancel}
                    type="button"
                    className="bg-[color:var(--ai-card-border)]/20 hover:bg-[color:var(--ai-card-border)]/30"
                >
                    Cancel
                </Button>
                <Button
                    color="primary"
                    type="submit"
                    isLoading={isSubmitting}
                    className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Question'}
                </Button>
            </div>
        </form>
    );
};

export default AskQuestionForm;