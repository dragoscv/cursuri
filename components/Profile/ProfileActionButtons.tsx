import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { FiBook } from '@/components/icons/FeatherIcons';

interface ProfileActionButtonsProps {
    hasPaidCourses: boolean;
}

export default function ProfileActionButtons({ hasPaidCourses }: ProfileActionButtonsProps) {
    return (
        <div className="mt-6 text-center">
            {hasPaidCourses ? (
                <Link href="/profile/courses">
                    <Button
                        color="primary"
                        className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium px-8"
                        startContent={<FiBook />}
                        size="lg"
                    >
                        Continue Learning
                    </Button>
                </Link>
            ) : (
                <Link href="/courses">
                    <Button
                        color="primary"
                        className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium px-8"
                        startContent={<FiBook />}
                        size="lg"
                    >
                        Browse Courses
                    </Button>
                </Link>
            )}
        </div>
    );
}