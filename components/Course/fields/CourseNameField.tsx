'use client';

import Input from '@/components/ui/Input';
import { FiBook } from '../../icons/FeatherIcons';
import { CourseNameFieldProps } from '@/types';
import { useTranslations } from 'next-intl';

export default function CourseNameField({ value, onChange }: CourseNameFieldProps) {
    const t = useTranslations('courses.fields');
    return (
        <Input
            label={t('name.label')}
            variant="bordered"
            placeholder={t('name.placeholder')}
            value={value}
            onChange={onChange}
            isRequired
            startContent={<FiBook className="text-[color:var(--ai-muted)]" />}
            className="bg-[color:var(--ai-card-bg)]/40"
            classNames={{ label: "text-[color:var(--ai-foreground)] font-medium" }}
        />
    );
}
