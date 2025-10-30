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
import { AppContext } from '@/components/AppContext';
import { useTranslations } from 'next-intl';
import Login from '@/components/Login';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/Header/ThemeToggle';

/**
 * MobileMenu component for non-authenticated users
 * Consolidates navigation links and actions into a hamburger menu
 */
export default function MobileMenu() {
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('Missing context value');
  }

  const { user, openModal, closeModal } = context;

  // Only show for non-authenticated users on mobile
  if (user) {
    return null;
  }

  const isCourseOrLessonPage = pathname.includes('/courses/');

  const handleOpenLoginModal = () => {
    openModal({
      id: 'login',
      isOpen: true,
      hideCloseButton: false,
      backdrop: 'blur',
      size: 'md',
      scrollBehavior: 'inside',
      isDismissable: true,
      modalHeader: t('buttons.login'),
      modalBody: <Login onClose={() => closeModal('login')} />,
      headerDisabled: true,
      footerDisabled: true,
      noReplaceURL: true,
      onClose: () => closeModal('login'),
      classNames: {
        backdrop:
          'z-50 backdrop-blur-md backdrop-saturate-150 bg-black/60 w-screen min-h-[100dvh] fixed inset-0',
        base: 'z-50 mx-auto my-auto rounded-xl shadow-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] overflow-hidden h-auto min-h-0',
        wrapper:
          'z-50 w-full flex flex-col justify-center items-center overflow-hidden min-h-[100dvh]',
        content: 'h-auto min-h-0',
      },
    });
  };

  return (
    <div className="md:hidden">
      <Dropdown
        placement="bottom-end"
        backdrop="blur"
        classNames={{
          base: 'py-1 px-1 rounded-lg bg-gradient-to-br from-[color:var(--ai-card-bg)] to-[color:var(--ai-card-bg)]/80 dark:from-[color:var(--ai-card-bg)]/90 dark:to-[color:var(--ai-background)]/70 z-[9999]',
          arrow: 'bg-default-200',
          backdrop:
            'fixed backdrop-blur-md backdrop-saturate-150 bg-[color:var(--ai-card-bg)]/70 dark:bg-[color:var(--ai-background)]/60 w-screen h-screen inset-0',
          content: 'z-[9999] flex flex-col justify-start items-end shadow-xl min-w-[280px]',
        }}
        className="z-[9999] relative"
        offset={12}
        showArrow={true}
        shouldCloseOnBlur={false}
        portalContainer={typeof document !== 'undefined' ? document.body : undefined}
      >
        <DropdownTrigger>
          <Button
            isIconOnly
            variant="flat"
            className="rounded-lg"
            aria-label={t('accessibility.mainNavigation')}
            aria-haspopup="menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Mobile Menu"
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
          {/* Navigation Links - only show if not on course/lesson page */}
          {!isCourseOrLessonPage ? (
            <DropdownSection aria-label="Navigation" showDivider {...({} as any)}>
              <DropdownItem
                key="courses"
                textValue="Courses"
                className="p-0"
                onClick={() => router.push('/courses')}
              >
                <div className="cursor-pointer hover:bg-[color:var(--ai-primary)]/10 hover:text-[color:var(--ai-primary)] rounded-lg p-2 transition-colors">
                  {t('nav.courses')}
                </div>
              </DropdownItem>
              <DropdownItem
                key="about"
                textValue="About"
                className="p-0"
                onClick={() => router.push('/about')}
              >
                <div className="cursor-pointer hover:bg-[color:var(--ai-primary)]/10 hover:text-[color:var(--ai-primary)] rounded-lg p-2 transition-colors">
                  {t('nav.about')}
                </div>
              </DropdownItem>
              <DropdownItem
                key="contact"
                textValue="Contact"
                className="p-0"
                onClick={() => router.push('/contact')}
              >
                <div className="cursor-pointer hover:bg-[color:var(--ai-primary)]/10 hover:text-[color:var(--ai-primary)] rounded-lg p-2 transition-colors">
                  {t('nav.contact')}
                </div>
              </DropdownItem>
            </DropdownSection>
          ) : null}

          {/* Settings Section */}
          <DropdownSection aria-label="Settings" showDivider {...({} as any)}>
            <DropdownItem key="language" textValue="Language" className="p-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('language')}</span>
                <LanguageSwitcher />
              </div>
            </DropdownItem>
            <DropdownItem key="theme" textValue="Theme" className="p-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('theme.toggle')}</span>
                <ThemeToggle />
              </div>
            </DropdownItem>
          </DropdownSection>

          {/* Auth Actions Section */}
          <DropdownSection aria-label="Auth Actions" {...({} as any)}>
            <DropdownItem
              key="login"
              textValue="Login"
              className="p-0"
              onClick={handleOpenLoginModal}
            >
              <div className="cursor-pointer hover:bg-[color:var(--ai-primary)]/10 hover:text-[color:var(--ai-primary)] rounded-lg p-2 transition-colors font-medium">
                {t('buttons.login')}
              </div>
            </DropdownItem>
            <DropdownItem
              key="signup"
              textValue="Sign Up"
              className="p-0"
              onClick={handleOpenLoginModal}
            >
              <div
                className="cursor-pointer rounded-lg p-2 transition-colors font-medium text-white"
                style={{
                  background: 'linear-gradient(to right, var(--ai-primary), var(--ai-secondary))',
                }}
              >
                {t('buttons.signup')}
              </div>
            </DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
