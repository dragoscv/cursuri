'use client';

import React, { useContext, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Chip } from '@heroui/react';
import { motion } from 'framer-motion';
import {
  FiHome,
  FiSettings,
  FiCreditCard,
  FiBookOpen,
  FiAward,
  FiFileText,
  FiLogOut,
  FiCalendar,
} from '@/components/icons/FeatherIcons';
import { signOut } from 'firebase/auth';
import { firebaseAuth } from '@/utils/firebase/firebase.config';
import { AppContext } from '@/components/AppContext';
import { useRouter, usePathname } from 'next/navigation';
import DefaultAvatar from '@/components/shared/DefaultAvatar';

const GitHubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const calculateOverallProgress = (
  userPaidProducts: any[],
  lessonProgress: any,
  lessons: any
) => {
  if (!userPaidProducts || !lessonProgress) return 0;
  let completed = 0;
  let total = 0;
  userPaidProducts
    .filter((p) => p.metadata?.courseId)
    .forEach((p) => {
      const courseId = p.metadata.courseId;
      const lessonsData = lessons?.[courseId] || {};
      const progressData = lessonProgress[courseId] || {};
      const count =
        Object.keys(lessonsData).length > 0
          ? Object.keys(lessonsData).length
          : Object.keys(progressData).length;
      total += count;
      Object.values(progressData).forEach((p2: any) => {
        if (p2.isCompleted) completed += 1;
      });
    });
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};

const ProfileSidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const context = useContext(AppContext);
  const t = useTranslations('profile');

  if (!context) {
    throw new Error('AppContext not found');
  }

  const { user, lessonProgress, userPaidProducts, lessons, userProfile } = context;
  if (!user) return null;

  const enrolledCount = useMemo(
    () => userPaidProducts?.filter((p) => p.metadata?.courseId).length || 0,
    [userPaidProducts]
  );

  const overallProgress = useMemo(
    () => calculateOverallProgress(userPaidProducts || [], lessonProgress, lessons),
    [userPaidProducts, lessonProgress, lessons]
  );

  const navItems = useMemo(
    () => [
      { label: t('nav.dashboard'), href: '/profile', icon: FiHome },
      { label: t('nav.myCourses'), href: '/profile/courses', icon: FiBookOpen, badge: enrolledCount || undefined },
      { label: t('nav.certificates'), href: '/profile/certificates', icon: FiAward },
      { label: t('nav.githubAccounts'), href: '/profile/github', icon: GitHubIcon },
      { label: t('nav.subscription'), href: '/profile/subscriptions', icon: FiCreditCard },
      { label: t('nav.meetings'), href: '/profile/meetings', icon: FiCalendar },
      { label: t('nav.paymentHistory'), href: '/profile/payments', icon: FiFileText },
      { label: t('nav.settings'), href: '/profile/settings', icon: FiSettings },
    ],
    [t, enrolledCount]
  );

  const handleSignOut = async () => {
    await signOut(firebaseAuth);
    router.push('/');
  };

  const displayName =
    user?.displayName || userProfile?.displayName || user?.email?.split('@')[0] || t('defaultUserName');

  return (
    <aside className="lg:sticky lg:top-24 space-y-4">
      {/* Identity card */}
      <div className="relative overflow-hidden rounded-2xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/80 backdrop-blur-xl shadow-sm">
        {/* Soft ambient glow header */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-32 pointer-events-none opacity-60"
          style={{
            background:
              'radial-gradient(80% 80% at 50% 0%, color-mix(in srgb, var(--ai-primary) 30%, transparent) 0%, transparent 70%), radial-gradient(60% 60% at 90% 10%, color-mix(in srgb, var(--ai-secondary) 25%, transparent) 0%, transparent 70%)',
          }}
        />

        <div className="relative px-5 pt-6 pb-5 flex flex-col items-center text-center">
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-accent)] blur-md opacity-50"
            />
            <div className="relative ring-4 ring-[color:var(--ai-card-bg)] rounded-full overflow-hidden shadow-lg">
              {user?.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="w-[88px] h-[88px] object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <DefaultAvatar name={displayName} size={88} />
              )}
            </div>
          </div>
          <h2 className="mt-4 text-base font-semibold text-[color:var(--ai-foreground)] max-w-full truncate">
            {displayName}
          </h2>
          <p className="text-xs text-[color:var(--ai-muted)] max-w-full truncate">
            {user?.email}
          </p>

          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            <Chip color="primary" variant="flat" size="sm">
              {enrolledCount}{' '}
              {enrolledCount === 1 ? t('courseCount.singular') : t('courseCount.plural')}
            </Chip>
            <Chip color="success" variant="flat" size="sm">
              {overallProgress}%
            </Chip>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="rounded-2xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/80 backdrop-blur-xl p-2 shadow-sm">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === '/profile' ? pathname === '/profile' : pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link href={item.href} className="block">
                  <div
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                      isActive
                        ? 'text-[color:var(--ai-foreground)] bg-[color:var(--ai-primary)]/10'
                        : 'text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-card-bg)]'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="profile-nav-active"
                        className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-gradient-to-b from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span
                      className={`grid place-items-center w-8 h-8 rounded-lg ${
                        isActive
                          ? 'bg-gradient-to-br from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white shadow-sm'
                          : 'bg-[color:var(--ai-card-border)]/40 text-[color:var(--ai-muted)] group-hover:text-[color:var(--ai-foreground)]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 h-4 rounded-full inline-flex items-center font-semibold ${
                          isActive
                            ? 'bg-[color:var(--ai-primary)]/20 text-[color:var(--ai-primary)]'
                            : 'bg-[color:var(--ai-card-border)] text-[color:var(--ai-muted)]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}

          <li className="pt-1 mt-1 border-t border-[color:var(--ai-card-border)]/60">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[color:var(--ai-muted)] hover:text-[color:var(--ai-danger)] hover:bg-[color:var(--ai-danger)]/5 transition-colors"
            >
              <span className="grid place-items-center w-8 h-8 rounded-lg bg-[color:var(--ai-card-border)]/40">
                <FiLogOut className="w-4 h-4" />
              </span>
              <span className="text-sm font-medium">{t('nav.logout') ?? 'Sign out'}</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default ProfileSidebar;
