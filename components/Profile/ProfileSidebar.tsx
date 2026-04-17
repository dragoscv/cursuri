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
} from '@/components/icons/FeatherIcons';
import { signOut } from 'firebase/auth';
import { firebaseAuth } from '@/utils/firebase/firebase.config';
import { AppContext } from '@/components/AppContext';
import { useRouter, usePathname } from 'next/navigation';
import DefaultAvatar from '@/components/shared/DefaultAvatar';

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
      { label: t('nav.subscription'), href: '/profile/subscriptions', icon: FiCreditCard },
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
        {/* Banner */}
        <div className="relative h-20 bg-gradient-to-br from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-accent)]">
          <div
            aria-hidden
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0px, transparent 8px), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.3) 0px, transparent 6px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="px-4 pb-4 -mt-10">
          <div className="flex items-end gap-3">
            <div className="ring-4 ring-[color:var(--ai-card-bg)] rounded-full overflow-hidden shadow-md shrink-0">
              {user?.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="w-16 h-16 object-cover"
                />
              ) : (
                <DefaultAvatar name={displayName} size={64} />
              )}
            </div>
            <div className="min-w-0 pb-1">
              <h2 className="text-sm font-semibold text-[color:var(--ai-foreground)] truncate">
                {displayName}
              </h2>
              <p className="text-xs text-[color:var(--ai-muted)] truncate">{user?.email}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <Chip color="primary" variant="flat" size="sm">
              {enrolledCount}{' '}
              {enrolledCount === 1 ? t('courseCount.singular') : t('courseCount.plural')}
            </Chip>
            <Chip color="success" variant="flat" size="sm">
              {overallProgress}% complete
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
