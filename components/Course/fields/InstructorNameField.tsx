'use client';

import Input from '@/components/ui/Input';
import { FiUser } from '../../icons/FeatherIcons';
import { InstructorNameFieldProps } from '@/types';

export default function InstructorNameField({ value, onChange }: InstructorNameFieldProps) {
    return (
        <Input
            label="Instructor Name"
            variant="bordered"
            placeholder="Instructor name"
            value={value}
            onChange={onChange}
            startContent={<FiUser className="text-[color:var(--ai-muted)]" />}
            className="bg-[color:var(--ai-card-bg)]/40"
            classNames={{ label: "text-[color:var(--ai-foreground)] font-medium" }}
        />
    );
}
