'use client';

import Input from '@/components/ui/Input';
import { FiUser } from '../../icons/FeatherIcons';
import { InstructorNameFieldProps } from '@/types';
import { useTranslations } from 'next-intl';

export default function InstructorNameField({ value, onChange }: InstructorNameFieldProps) {
    const t = useTranslations('courses.fields');
    return (
        <Input
            label={t('instructor.label')}
            variant="bordered"
            placeholder={t('instructor.placeholder')}
            value={value}
            onChange={onChange}
            startContent={<FiUser className="text-[color:var(--ai-muted)]" />}
            className="bg-[color:var(--ai-card-bg)]/40"
            classNames={{ label: "text-[color:var(--ai-foreground)] font-medium" }}
        />
    );
}
