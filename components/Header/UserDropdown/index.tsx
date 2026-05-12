'use client';

/**
 * UserDropdown v2 — calm editorial avatar menu. Replaces the gradient
 * dropdown base + nested HeroUI hover layers with a single rounded-md
 * panel, plain rows, and one subtle hover state. Avatar trigger uses a
 * thin neutral border (no primary-color halo).
 */

import React, { useContext } from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
} from '@heroui/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { useTranslations } from 'next-intl';

import { AppContext } from '@/components/AppContext';
import { UserIcon, LogOutIcon, ShieldIcon, FiSettings } from '@/components/icons/FeatherIcons';
import { firebaseAuth } from '@/utils/firebase/firebase.config';
import { logClientAuthEvent } from '@/utils/clientAudit';
import { logUserLogout } from '@/utils/analytics';
import DefaultAvatar from '@/components/shared/DefaultAvatar';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/Header/ThemeToggle';

export default function UserDropdown() {
  const t = useTranslations('common');
  const router = useRouter();
  const context = useContext(AppContext);

  if (!context) throw new Error('Missing context value');
  const { user, isAdmin } = context;
  if (!user) return null;

  const handleSignOut = async () => {
    await logClientAuthEvent('logout', { uid: user.uid, email: user.email });
    logUserLogout();
    await signOut(firebaseAuth);
  };

  const displayName = user?.displayName || user?.email || user?.phoneNumber || user?.uid || '';

  const itemRow =
    'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-[13px] text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-card-bg)]/80 transition-colors';

  return (
    <Dropdown
      placement="bottom-end"
      backdrop="opaque"
      classNames={{
        base: 'p-1.5 rounded-xl bg-[color:var(--ai-background)] border border-[color:var(--ai-card-border)] shadow-xl z-[9999] min-w-[260px]',
        backdrop:
          'fixed inset-0 backdrop-blur-sm bg-[color:var(--ai-background)]/40 w-screen h-screen',
        content: 'z-[9999] flex flex-col items-end',
      }}
      offset={10}
      shouldCloseOnBlur
      portalContainer={typeof document !== 'undefined' ? document.body : undefined}
    >
      <DropdownTrigger>
        <button
          type="button"
          aria-label={t('accessibility.userMenu')}
          aria-haspopup="menu"
          className="grid place-items-center w-8 h-8 rounded-full overflow-hidden border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-foreground)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ai-primary)]"
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={displayName || t('userMenu.profileDashboard')}
              className="w-full h-full object-cover"
            />
          ) : (
            <DefaultAvatar name={displayName || 'User'} size={32} />
          )}
        </button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label="User Actions"
        variant="flat"
        itemClasses={{
          base: 'p-0 data-[hover=true]:bg-transparent',
          wrapper: 'border-0',
        }}
      >
        <DropdownSection aria-label="Profile Info" showDivider {...({} as any)}>
          <DropdownItem key="profile-info" textValue="Signed in as" isReadOnly className="p-0">
            <div className="px-2 py-2">
              <p className="text-[10px] uppercase tracking-[0.08em] text-[color:var(--ai-muted)] font-semibold">
                {t('userMenu.signedInAs')}
              </p>
              <p className="mt-0.5 text-[13px] font-medium text-[color:var(--ai-foreground)] truncate">
                {displayName}
              </p>
            </div>
          </DropdownItem>
        </DropdownSection>

        <DropdownSection aria-label="Account" showDivider {...({} as any)}>
          <DropdownItem key="profile" textValue="Profile" className="p-0">
            <Link href="/profile" className={itemRow}>
              <UserIcon className="text-[color:var(--ai-muted)]" size={16} />
              <span>{t('userMenu.profileDashboard')}</span>
            </Link>
          </DropdownItem>
          <DropdownItem key="settings" textValue="Settings" className="p-0">
            <Link href="/profile/settings" className={itemRow}>
              <FiSettings className="text-[color:var(--ai-muted)]" size={16} />
              <span>{t('userMenu.settings')}</span>
            </Link>
          </DropdownItem>
        </DropdownSection>

        <DropdownSection aria-label="Navigation" showDivider {...({} as any)}>
          <DropdownItem key="courses" textValue="Courses" className="p-0">
            <Link href="/courses" className={itemRow}>
              <span>{t('nav.courses')}</span>
            </Link>
          </DropdownItem>
          <DropdownItem key="subscriptions" textValue="Subscriptions" className="p-0">
            <Link href="/subscriptions" className={itemRow}>
              <span>{t('nav.subscriptions')}</span>
            </Link>
          </DropdownItem>
          <DropdownItem key="about" textValue="About" className="p-0">
            <Link href="/about" className={itemRow}>
              <span>{t('nav.about')}</span>
            </Link>
          </DropdownItem>
          <DropdownItem key="contact" textValue="Contact" className="p-0">
            <Link href="/contact" className={itemRow}>
              <span>{t('nav.contact')}</span>
            </Link>
          </DropdownItem>
        </DropdownSection>

        {isAdmin ? (
          <DropdownSection aria-label="Admin" showDivider {...({} as any)}>
            <DropdownItem key="admin" textValue="Admin" className="p-0">
              <Link href="/admin" className={itemRow}>
                <ShieldIcon className="text-[color:var(--ai-primary)]" size={16} />
                <span>{t('userMenu.adminDashboard')}</span>
              </Link>
            </DropdownItem>
          </DropdownSection>
        ) : null}

        <DropdownSection
          aria-label="Mobile Utilities"
          showDivider
          className="md:hidden"
          {...({} as any)}
        >
          <DropdownItem key="mobile-language" textValue="Language" isReadOnly className="p-0">
            <div className="flex items-center justify-between gap-2 px-2 py-1.5">
              <span className="text-[13px] text-[color:var(--ai-muted)]">{t('language')}</span>
              <LanguageSwitcher />
            </div>
          </DropdownItem>
          <DropdownItem key="mobile-theme" textValue="Theme" isReadOnly className="p-0">
            <div className="flex items-center justify-between gap-2 px-2 py-1.5">
              <span className="text-[13px] text-[color:var(--ai-muted)]">{t('theme.toggle')}</span>
              <ThemeToggle />
            </div>
          </DropdownItem>
        </DropdownSection>

        <DropdownSection aria-label="Logout" {...({} as any)}>
          <DropdownItem key="logout" textValue="Logout" className="p-0">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-[13px] text-[color:var(--ai-error)] hover:bg-[color:var(--ai-error)]/10 transition-colors"
            >
              <LogOutIcon size={16} color="currentColor" />
              <span>{t('userMenu.logout')}</span>
            </button>
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}
