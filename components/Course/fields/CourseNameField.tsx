'use client';

import Input from '@/components/ui/Input';
import { FiBook } from '../../icons/FeatherIcons';
import { CourseNameFieldProps } from '@/types';

export default function CourseNameField({ value, onChange }: CourseNameFieldProps) {
    return (
        <Input
            label="Course Name"
            variant="bordered"
            placeholder="Enter course name"
            value={value}
            onChange={onChange}
            isRequired
            startContent={<FiBook className="text-[color:var(--ai-muted)]" />}
            className="bg-[color:var(--ai-card-bg)]/40"
            classNames={{ label: "text-[color:var(--ai-foreground)] font-medium" }}
        />
    );
}
