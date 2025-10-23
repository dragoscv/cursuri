import React, { useContext, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppContext } from '@/components/AppContext';
import { AppContextProps } from '@/types';
import { Tooltip } from '@heroui/react';

const Breadcrumbs = React.memo(function Breadcrumbs() {
  const pathname = usePathname();
  const context = useContext(AppContext) as AppContextProps;
  const { courses, lessons } = context;

  const breadcrumbItems = useMemo(() => {
    // Skip breadcrumbs on the home page
    if (pathname === '/') {
      return null;
    }

    const pathSegments = pathname.split('/').filter(Boolean);

    // Skip breadcrumbs on the main courses page
    if (pathSegments.length === 1 && pathSegments[0] === 'courses') {
      return [{ label: 'Courses', path: '/courses', isActive: true }];
    }

    const items = [];

    // Add "Courses" as the first breadcrumb
    items.push({
      label: 'Courses',
      path: '/courses',
      isActive: false,
    });

    // For course pages: /courses/[courseId]
    if (pathSegments.length >= 2 && pathSegments[0] === 'courses') {
      const courseId = pathSegments[1];
      const courseName = courses[courseId]?.name || 'Course';

      items.push({
        label: courseName,
        path: `/courses/${courseId}`,
        isActive: pathSegments.length === 2,
      });
    }

    // For lesson pages: /courses/[courseId]/lessons/[lessonId]
    if (
      pathSegments.length === 4 &&
      pathSegments[0] === 'courses' &&
      pathSegments[2] === 'lessons'
    ) {
      const courseId = pathSegments[1];
      const lessonId = pathSegments[3];
      const lessonName = lessons[courseId]?.[lessonId]?.name || 'Lesson';

      items.push({
        label: lessonName,
        path: `/courses/${courseId}/lessons/${lessonId}`,
        isActive: true,
      });
    }

    return items;
  }, [pathname, courses, lessons]);

  if (!breadcrumbItems || breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex items-center space-x-2 max-w-full overflow-hidden">
        {breadcrumbItems.map((item, index) => (
          <li key={item.path} className="flex items-center min-w-0">
            {index > 0 && (
              <span className="mx-2 flex-shrink-0 text-[color:var(--ai-muted)]">/</span>
            )}
            {item.isActive ? (
              <Tooltip content={item.label} delay={500} closeDelay={0}>
                <span
                  className="font-medium text-[color:var(--ai-foreground)] truncate max-w-[200px]"
                  aria-current="page"
                >
                  {item.label}
                </span>
              </Tooltip>
            ) : (
              <Tooltip content={item.label} delay={500} closeDelay={0}>
                <Link
                  href={item.path}
                  className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] truncate max-w-[120px]"
                >
                  {item.label}
                </Link>
              </Tooltip>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
});

export default Breadcrumbs;
