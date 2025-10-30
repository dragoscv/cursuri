'use client';

import React from 'react';
import { Course } from '@/types';
import { Input, Chip } from '@heroui/react';
import Button from '@/components/ui/Button';
import { FiLink } from '../../icons/FeatherIcons';

interface PrerequisitesFieldProps {
    coursePrerequisites: string[];
    setCoursePrerequisites: (prerequisites: string[]) => void;
    courses: Record<string, Course>;
    currentCourseId?: string;
    selectedPrerequisiteId: string;
    setSelectedPrerequisiteId: (id: string) => void;
}

const PrerequisitesField: React.FC<PrerequisitesFieldProps> = ({
    coursePrerequisites,
    setCoursePrerequisites,
    courses,
    currentCourseId,
    selectedPrerequisiteId,
    setSelectedPrerequisiteId
}) => {
    // Handle adding a prerequisite course
    const handleAddPrerequisite = () => {
        if (selectedPrerequisiteId && !coursePrerequisites.includes(selectedPrerequisiteId)) {
            setCoursePrerequisites([...coursePrerequisites, selectedPrerequisiteId]);
            setSelectedPrerequisiteId('');
        }
    };

    // Handle removing a prerequisite course
    const handleRemovePrerequisite = (prerequisiteId: string) => {
        setCoursePrerequisites(coursePrerequisites.filter(id => id !== prerequisiteId));
    };

    return (
        <div>
            <div className="space-y-2 mb-3 min-h-[100px]">
                {coursePrerequisites.length > 0 ? coursePrerequisites.map((prerequisiteId) => {
                    const prerequisiteCourse = courses[prerequisiteId];
                    return (
                        <div key={prerequisiteId} className="flex justify-between items-center p-3 rounded-lg bg-[color:var(--ai-card-bg)]/50 border border-[color:var(--ai-card-border)]/50 hover:border-[color:var(--ai-primary)]/20 hover:bg-[color:var(--ai-card-bg)] transition-all">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-md overflow-hidden mr-3 bg-[color:var(--ai-card-border)]/30 flex items-center justify-center">
                                    <FiLink className="text-[color:var(--ai-primary)]" size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{prerequisiteCourse ? prerequisiteCourse.name : prerequisiteId}</p>
                                    {prerequisiteCourse?.difficulty && (
                                        <span className="text-xs text-[color:var(--ai-muted)]">{prerequisiteCourse.difficulty}</span>
                                    )}
                                </div>
                            </div>
                            <Button
                                size="sm"
                                color="danger"
                                variant="light"
                                isIconOnly
                                onPress={() => handleRemovePrerequisite(prerequisiteId)}
                                className="opacity-60 hover:opacity-100"
                            >
                                ✕
                            </Button>
                        </div>
                    );
                }) : (
                    <div className="flex items-center justify-center h-[100px] border border-dashed border-[color:var(--ai-card-border)] rounded-lg">
                        <p className="text-sm text-[color:var(--ai-muted)] italic">Add prerequisite courses that students should complete first</p>
                    </div>
                )}
            </div>
            <div className="flex gap-2">                <select
                className="flex-1 px-3 py-2 rounded-lg border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/40 text-[color:var(--ai-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)]/20"
                value={selectedPrerequisiteId}
                onChange={(e) => setSelectedPrerequisiteId(e.target.value)}
                aria-label="Select prerequisite course"
                title="Select prerequisite course"
                name="prerequisiteCourse"
            >
                <option value="">Select a prerequisite course</option>
                {Object.values(courses)
                    .filter(course =>
                        // Don't show the current course
                        course.id !== currentCourseId &&
                        // Don't show courses already selected
                        !coursePrerequisites.includes(course.id) &&
                        // Only show active courses
                        course.status === 'active'
                    )
                    .map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.name}
                        </option>
                    ))
                }
            </select>
                <Button
                    color="primary"
                    onPress={handleAddPrerequisite}
                    className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                    isDisabled={!selectedPrerequisiteId}
                >
                    Add
                </Button>
            </div>
        </div>
    );
};

export default PrerequisitesField;
