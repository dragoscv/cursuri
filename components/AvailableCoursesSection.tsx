'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import CoursesFilter from './Courses/CoursesFilter';
import CoursesList from './Courses/CoursesList';
import { SectionShell } from '@/components/user-shell';

const AvailableCoursesSection = React.memo(function AvailableCoursesSection() {
  const t = useTranslations('home.availableCourses');
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState('all');

  return (
    <SectionShell
      id="courses-section"
      eyebrow={t('eyebrow')}
      title={t('title')}
      description={t('description')}
      spacing="lg"
      tone="subtle"
      centered
    >
      <CoursesFilter
        onFilterChange={setFilter}
        onCategoryChange={setCategory}
        currentFilter={filter}
        currentCategory={category}
      />
      <CoursesList filter={filter} category={category} />
    </SectionShell>
  );
});

export default AvailableCoursesSection;
