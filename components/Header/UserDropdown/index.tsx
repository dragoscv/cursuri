'use client';

import React, { useContext } from 'react';
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
} from '@heroui/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AppContext } from '@/components/AppContext';
import {
  UserIcon,
  LogOutIcon,
  ShieldIcon,
  PlusIcon,
  MessageSquareIcon,
  FiSettings,
} from '@/components/icons/FeatherIcons';
import { firebaseApp, firebaseAuth } from '@/utils/firebase/firebase.config';
import { signOut } from 'firebase/auth';
import Login from '@/components/Login';
import AddCourse from '@/components/Course/AddCourse';
import SocialIcons from '@/components/Header/SocialIcons';
import { useTranslations } from 'next-intl';
import DefaultAvatar from '@/components/shared/DefaultAvatar';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/Header/ThemeToggle';

/**
 * UserDropdown component that handles the user menu functionality
 */
export default function UserDropdown() {
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('Missing context value');
  }

  const { user, openModal, closeModal, isAdmin } = context;

  // Don't render the dropdown if no user is authenticated
  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut(firebaseAuth);
  };

  // Navigation links section - always show
  const renderNavigationSection = () => {
    return (
      <DropdownSection aria-label="Navigation" showDivider {...({} as any)}>
        <DropdownItem key="courses" textValue="Courses" className="p-0">
          <Link href="/courses" className="block w-full">
            <div className="cursor-pointer hover:bg-[color:var(--ai-primary)]/10 hover:text-[color:var(--ai-primary)] rounded-lg p-2 transition-colors">
              {t('nav.courses')}
            </div>
          </Link>
        </DropdownItem>
        <DropdownItem key="about" textValue="About" className="p-0">
          <Link href="/about" className="block w-full">
            <div className="cursor-pointer hover:bg-[color:var(--ai-primary)]/10 hover:text-[color:var(--ai-primary)] rounded-lg p-2 transition-colors">
              {t('nav.about')}
            </div>
          </Link>
        </DropdownItem>
        <DropdownItem key="contact" textValue="Contact" className="p-0">
          <Link href="/contact" className="block w-full">
            <div className="cursor-pointer hover:bg-[color:var(--ai-primary)]/10 hover:text-[color:var(--ai-primary)] rounded-lg p-2 transition-colors">
              {t('nav.contact')}
            </div>
          </Link>
        </DropdownItem>
      </DropdownSection>
    );
  };

  // Mobile utilities section (language, theme) - only on mobile
  const renderMobileUtilitiesSection = () => {
    return (
      <DropdownSection
        aria-label="Mobile Utilities"
        showDivider
        className="md:hidden"
        {...({} as any)}
      >
        <DropdownItem key="mobile-language" textValue="Language" className="p-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('language')}</span>
            <LanguageSwitcher />
          </div>
        </DropdownItem>
        <DropdownItem key="mobile-theme" textValue="Theme" className="p-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('theme.toggle')}</span>
            <ThemeToggle />
          </div>
        </DropdownItem>
      </DropdownSection>
    );
  };

  // Mobile admin actions - only on mobile for admins
  const renderMobileAdminSection = () => {
    if (!isAdmin) return null;

    return (
      <DropdownSection
        aria-label="Mobile Admin Actions"
        showDivider
        className="md:hidden"
        {...({} as any)}
      >
        <DropdownItem key="mobile-add-course" textValue="Add Course" className="p-0">
          <div
            className="cursor-pointer hover:bg-[color:var(--ai-primary)]/10 hover:text-[color:var(--ai-primary)] rounded-lg p-2 transition-colors flex items-center gap-2"
            onClick={() =>
              openModal({
                id: 'add-course',
                isOpen: true,
                hideCloseButton: false,
                backdrop: 'blur',
                size: 'full',
                scrollBehavior: 'inside',
                isDismissable: true,
                modalHeader: 'Add Course',
                modalBody: <AddCourse onClose={() => closeModal('add-course')} />,
                headerDisabled: true,
                footerDisabled: true,
                noReplaceURL: true,
                onClose: () => closeModal('add-course'),
              })
            }
          >
            <PlusIcon className="text-[color:var(--ai-primary)]" size={18} />
            Add Course
          </div>
        </DropdownItem>
        <DropdownItem key="mobile-admin-panel" textValue="Admin Panel" className="p-0">
          <Link href="/admin" className="block w-full">
            <div className="cursor-pointer hover:bg-[color:var(--ai-primary)]/10 hover:text-[color:var(--ai-primary)] rounded-lg p-2 transition-colors flex items-center gap-2">
              <ShieldIcon className="text-[color:var(--ai-primary)]" size={18} />
              Admin Panel
            </div>
          </Link>
        </DropdownItem>
      </DropdownSection>
    );
  };

  // Profile info section
  const renderProfileSection = () => {
    return (
      <DropdownSection aria-label="Profile Info" showDivider {...({} as any)}>
        <DropdownItem
          key="profile-info"
          className="h-14 gap-2 border-0 text-[color:var(--ai-foreground)]/80 opacity-100"
          textValue="Profile Details"
          isReadOnly
        >
          <div className="p-2 border-0">
            <p className="font-semibold text-[color:var(--ai-foreground)]">
              {t('userMenu.signedInAs')}
            </p>
            <p className="font-semibold text-[color:var(--ai-foreground)]">
              {user?.displayName
                ? user?.displayName
                : user?.email
                  ? user?.email
                  : user?.phoneNumber
                    ? user?.phoneNumber
                    : user?.uid}
            </p>
          </div>
        </DropdownItem>
      </DropdownSection>
    );
  };

  // Actions section (Profile Dashboard, Settings)
  const renderActionsSection = () => {
    return (
      <DropdownSection aria-label="User Actions" showDivider {...({} as any)}>
        <DropdownItem key="profile" textValue="Profile Dashboard" className="p-0">
          <Link href="/profile" className="block w-full">
            <div className="cursor-pointer hover:bg-[color:var(--ai-primary)]/10 hover:text-[color:var(--ai-primary)] rounded-lg p-2 transition-colors flex items-center gap-2">
              <UserIcon className="text-[color:var(--ai-primary)]" size={18} />
              {t('userMenu.profileDashboard')}
            </div>
          </Link>
        </DropdownItem>
        <DropdownItem key="settings" textValue="Settings" className="p-0">
          <Link href="/profile/settings" className="block w-full">
            <div className="cursor-pointer hover:bg-[color:var(--ai-primary)]/10 hover:text-[color:var(--ai-primary)] rounded-lg p-2 transition-colors flex items-center gap-2">
              <FiSettings className="text-[color:var(--ai-primary)]" size={18} />
              {t('userMenu.settings')}
            </div>
          </Link>
        </DropdownItem>
      </DropdownSection>
    );
  };

  // Admin section
  const renderAdminSection = () => {
    if (!isAdmin) return null;

    return (
      <DropdownSection aria-label="Admin Actions" showDivider {...({} as any)}>
        <DropdownItem key="adminDashboard" textValue="Admin Dashboard" className="p-0">
          <Link href="/admin" className="block w-full">
            <div className="cursor-pointer hover:bg-[color:var(--ai-primary)]/10 hover:text-[color:var(--ai-primary)] rounded-lg p-2 transition-colors flex items-center gap-2">
              <ShieldIcon className="text-[color:var(--ai-primary)]" size={18} />
              {t('userMenu.adminDashboard')}
            </div>
          </Link>
        </DropdownItem>
      </DropdownSection>
    );
  };

  // Suggestions section
  const renderSuggestionsSection = () => {
    return (
      <DropdownSection aria-label="Suggestions" showDivider {...({} as any)}>
        <DropdownItem key="suggestions" textValue="Suggestions" className="p-0">
          <div className="cursor-pointer hover:bg-[color:var(--ai-primary)]/10 hover:text-[color:var(--ai-primary)] rounded-lg p-2 transition-colors flex items-center gap-2">
            <MessageSquareIcon className="text-[color:var(--ai-primary)]" size={18} />
            {t('userMenu.suggestions')}
          </div>
        </DropdownItem>
      </DropdownSection>
    );
  };

  // Logout section
  const renderLogoutSection = () => {
    return (
      <DropdownSection aria-label="Logout" showDivider {...({} as any)}>
        <DropdownItem key="logout" textValue="Logout" className="p-0">
          <div
            className="cursor-pointer hover:bg-[color:var(--ai-error)]/10 text-[color:var(--ai-error)] rounded-lg p-2 transition-colors flex items-center gap-2"
            onClick={handleSignOut}
          >
            <LogOutIcon
              className="text-[color:var(--ai-error)]"
              size={18}
              color="var(--ai-error)"
            />
            {t('userMenu.logout')}
          </div>
        </DropdownItem>
      </DropdownSection>
    );
  };

  // Social Icons Section
  const renderSocialSection = () => {
    return (
      <DropdownSection aria-label="Social Links" {...({} as any)}>
        <DropdownItem key="social" textValue="Social" className="p-0">
          <div className="w-full">
            <SocialIcons />
          </div>
        </DropdownItem>
      </DropdownSection>
    );
  };
  return (
    <Dropdown
      placement="bottom-end"
      backdrop="blur"
      classNames={{
        base: 'py-1 px-1 rounded-lg bg-gradient-to-br from-[color:var(--ai-card-bg)] to-[color:var(--ai-card-bg)]/80 dark:from-[color:var(--ai-card-bg)]/90 dark:to-[color:var(--ai-background)]/70 z-[9999]',
        arrow: 'bg-default-200',
        backdrop:
          'fixed backdrop-blur-md backdrop-saturate-150 bg-[color:var(--ai-card-bg)]/70 dark:bg-[color:var(--ai-background)]/60 w-screen h-screen inset-0',
        content: 'z-[9999] flex flex-col justify-start items-end shadow-xl',
      }}
      className="z-[9999] relative"
      offset={12}
      showArrow={true}
      shouldCloseOnBlur={false}
      isOpen={undefined}
      onOpenChange={undefined}
      portalContainer={typeof document !== 'undefined' ? document.body : undefined}
    >
      <DropdownTrigger>
        <Button
          isIconOnly
          variant="flat"
          className="rounded-full"
          aria-label={t('accessibility.userMenu')}
          aria-haspopup="menu"
          aria-expanded={undefined}
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user?.displayName || user?.email || t('userMenu.profileDashboard')}
              className="w-8 h-8 rounded-full object-cover border-2 border-[color:var(--ai-primary)]/40"
            />
          ) : (
            <DefaultAvatar name={user?.displayName || user?.email || 'User'} size={32} />
          )}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="User Actions"
        variant="faded"
        itemClasses={{
          base: [
            'rounded-md',
            'text-sm',
            'transition-opacity',
            'data-[hover=true]:text-foreground',
            'data-[hover=true]:bg-default-100',
            'dark:data-[hover=true]:bg-default-50',
            'data-[selectable=true]:focus:bg-default-50',
            'data-[pressed=true]:opacity-70',
            'data-[focus-visible=true]:ring-default-500',
            'text-[color:var(--ai-foreground)]',
            'border-0',
            'outline-none',
          ],
          wrapper: 'border-0',
        }}
        className="z-[9999]"
      >
        {renderProfileSection()}
        {renderNavigationSection()}
        {renderActionsSection()}
        {renderAdminSection()}
        {renderMobileUtilitiesSection()}
        {renderMobileAdminSection()}
        {/* {renderSuggestionsSection()} */}
        {renderLogoutSection()}
        {renderSocialSection()}
      </DropdownMenu>
    </Dropdown>
  );
}
