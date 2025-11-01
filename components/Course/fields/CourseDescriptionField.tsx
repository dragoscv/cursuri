'use client';

import Textarea from '@/components/ui/Textarea';
import { CourseDescriptionFieldProps } from '@/types';
import { useTranslations } from 'next-intl';

export default function CourseDescriptionField({ value, onChange }: CourseDescriptionFieldProps) {
    const t = useTranslations('courses.fields');
    return (
        <Textarea
            label={t('description.label')}
            variant="bordered"
            placeholder={t('description.placeholder')}
            value={value}
            onChange={onChange}
            className="mb-6 bg-[color:var(--ai-card-bg)]/40"
            isRequired
            minRows={5}
            classNames={{ label: "text-[color:var(--ai-foreground)] font-medium" }}
        />
    );
}
