'use client';

import Textarea from '@/components/ui/Textarea';
import { CourseDescriptionFieldProps } from '@/types';

export default function CourseDescriptionField({ value, onChange }: CourseDescriptionFieldProps) {
    return (
        <Textarea
            label="Course Description"
            variant="bordered"
            placeholder="Provide a detailed description of the course"
            value={value}
            onChange={onChange}
            className="mb-6 bg-[color:var(--ai-card-bg)]/40"
            isRequired
            minRows={5}
            classNames={{ label: "text-[color:var(--ai-foreground)] font-medium" }}
        />
    );
}
