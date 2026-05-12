import React, { useContext } from 'react';
import { Course } from '@/types';
import { useTranslations } from 'next-intl';
import { FiCheckCircle, FiTarget, FiCalendar, FiFileText, FiLink } from '../icons/FeatherIcons';
import { AppContext } from '../AppContext';

// ...existing code...
import { CourseOverviewProps } from '@/types';
// ...existing code...

const CourseOverview: React.FC<CourseOverviewProps> = ({ course }) => {
  const context = useContext(AppContext);
  const t = useTranslations('courses.overview');

  // Sample benefits if not provided or empty
  const benefits =
    course.benefits && course.benefits.length > 0
      ? course.benefits
      : [
          t('sampleBenefits.keyConceptsAndBestPractices'),
          t('sampleBenefits.buildRealWorldProjects'),
          t('sampleBenefits.modernDevelopmentTechniques'),
          t('sampleBenefits.practicalSkills'),
        ];

  // Sample requirements if not provided or empty
  const requirements =
    course.requirements && course.requirements.length > 0
      ? course.requirements
      : [
          t('sampleRequirements.basicProgramming'),
          t('sampleRequirements.computerAndInternet'),
          t('sampleRequirements.willingnessToLearn'),
        ];

  return (
    <div className="space-y-6">
      {/* What You'll Learn */}
      <div>
        <div className="border border-[color:var(--ai-card-border)] rounded-2xl overflow-hidden bg-[color:var(--ai-card-bg)]">
          <div className="py-3 px-4 border-b border-[color:var(--ai-card-border)] border-l-[3px] border-l-amber-500">
            <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
              <FiTarget className="mr-2 text-amber-500" />
              <span>{t('whatYouWillLearn')}</span>
            </h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-amber-500/5 transition-colors"
                >
                  <FiCheckCircle className="text-amber-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-[color:var(--ai-muted)]">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div>
        <div className="border border-[color:var(--ai-card-border)] rounded-2xl overflow-hidden bg-[color:var(--ai-card-bg)]">
          <div className="py-3 px-4 border-b border-[color:var(--ai-card-border)] border-l-[3px] border-l-amber-500">
            <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
              <FiCalendar className="mr-2 text-amber-500" />
              <span>{t('requirements')}</span>
            </h3>
          </div>
          <div className="p-4">
            <ul className="space-y-3">
              {requirements.map((requirement, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-sm text-[color:var(--ai-muted)]"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></div>
                  {requirement}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Prerequisites */}
      {course.prerequisites && course.prerequisites.length > 0 && (
        <div>
          <div className="border border-[color:var(--ai-card-border)] rounded-2xl overflow-hidden bg-[color:var(--ai-card-bg)]">
            <div className="py-3 px-4 border-b border-[color:var(--ai-card-border)] border-l-[3px] border-l-amber-500">
              <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                <FiLink className="mr-2 text-amber-500" />
                <span>{t('prerequisites')}</span>
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {' '}
                {course.prerequisites.map((prerequisiteId, index) => {
                  // Look up the prerequisite course from context
                  const prerequisiteCourse = context?.courses?.[prerequisiteId];

                  return (
                    <div key={prerequisiteId} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md border border-amber-500/40 bg-amber-500/[0.06] flex items-center justify-center flex-shrink-0">
                        <FiLink className="text-amber-500" size={16} />
                      </div>
                      <div className="flex-1">
                        <a
                          href={`/courses/${prerequisiteId}`}
                          className="text-sm font-medium text-[color:var(--ai-foreground)] hover:text-amber-500 transition-colors"
                        >
                          {prerequisiteCourse
                            ? prerequisiteCourse.name
                            : `Course ${prerequisiteId}`}
                        </a>
                      </div>
                      <a
                        href={`/courses/${prerequisiteId}`}
                        className="text-xs px-3 py-1 rounded-full border border-amber-500/40 text-amber-500 hover:bg-amber-500/10 transition-colors"
                      >
                        {t('viewCourse')}
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Course Info if available */}
      {course.additionalInfo && (
        <div>
          <div className="border border-[color:var(--ai-card-border)] rounded-2xl overflow-hidden bg-[color:var(--ai-card-bg)]">
            <div className="py-3 px-4 border-b border-[color:var(--ai-card-border)] border-l-[3px] border-l-amber-500">
              <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                <FiFileText className="mr-2 text-amber-500" />
                <span>{t('additionalInformation')}</span>
              </h3>
            </div>
            <div className="p-4">
              <p className="text-[color:var(--ai-muted)] leading-relaxed">
                {course.additionalInfo}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseOverview;
