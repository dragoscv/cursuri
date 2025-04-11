import React from 'react';
import Courses from './Courses';

export default function AvailableCoursesSection() {
    return (<section id="courses-section" className="relative w-full py-16 bg-[color:var(--ai-background)]">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[color:var(--ai-foreground)] mb-8 text-center">
                Available Courses
            </h2>
            <Courses />
        </div>
    </section>
    );
}