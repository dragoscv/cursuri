'use client';

import RichTextEditor from '@/components/Lesson/QA/RichTextEditor';
import { CourseDescriptionFieldProps } from '@/types';
import { useTranslations } from 'next-intl';

export default function CourseDescriptionField({ value, onChange }: CourseDescriptionFieldProps) {
    const t = useTranslations('courses.fields');
    return (
        <div className="mb-6">
            <label className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2">
                {t('description.label')} <span className="text-[color:var(--ai-danger,#f43f5e)]">*</span>
            </label>
            <RichTextEditor
                value={value}
                onChange={(_text, html) => onChange(html)}
                placeholder={t('description.placeholder')}
                minHeight={200}
            />
        </div>
    );
}
