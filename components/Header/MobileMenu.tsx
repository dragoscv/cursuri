'use client';

/**
 * MobileMenu v2 — calm editorial sheet for unauthenticated mobile users.
 * Same chrome system as UserDropdown v2: plain panel, single hover state,
 * no gradient signup CTA. Login modal handles signup internally.
 */

import React, { useContext } from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
} from '@heroui/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { AppContext } from '@/components/AppContext';
import Login from '@/components/Login';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/Header/ThemeToggle';
import { DiscordIcon } from '@/components/icons/DiscordIcon';

export default function MobileMenu() {
  const t = useTranslations('common');
  const context = useContext(AppContext);

  if (!context) throw new Error('Missing context value');
  const { user, openModal, closeModal } = context;
  if (user) return null;

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
        base: 'z-50 mx-auto my-auto rounded-2xl shadow-none border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] overflow-hidden h-auto min-h-0',
        wrapper:
          'z-50 w-full flex flex-col justify-center items-center overflow-hidden min-h-[100dvh]',
        content: 'h-auto min-h-0',
      },
    });
  };

  const itemRow =
    'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-[13px] text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-card-bg)]/80 transition-colors';

  return (
    <div className="md:hidden">
      <Dropdown
        placement="bottom-end"
        backdrop="transparent"
        classNames={{
          base: 'p-1.5 rounded-xl bg-[color:var(--ai-background)] border border-[color:var(--ai-card-border)] shadow-none z-[9999] min-w-[260px]',
          content: 'z-[9999] flex flex-col items-end',
        }}
        offset={10}
        portalContainer={typeof document !== 'undefined' ? document.body : undefined}
      >
        <DropdownTrigger>
          <button
            type="button"
            aria-label={t('accessibility.mainNavigation')}
            aria-haspopup="menu"
            className="grid place-items-center w-8 h-8 rounded-md text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-card-bg)]/60 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ai-primary)] cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="Mobile Menu"
          variant="flat"
          itemClasses={{
            base: 'p-0 data-[hover=true]:bg-transparent',
            wrapper: 'border-0',
          }}
        >
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
            <DropdownItem key="book-a-call" textValue="Book a Call" className="p-0">
              <Link href="/book-a-call" className={itemRow}>
                <span>{t('nav.bookACall')}</span>
              </Link>
            </DropdownItem>
            <DropdownItem key="discord" textValue="Discord" className="p-0">
              <Link href="/discord" className={itemRow}>
                <DiscordIcon size={16} />
                <span>{t('nav.joinDiscord')}</span>
              </Link>
            </DropdownItem>
          </DropdownSection>

          <DropdownSection aria-label="Settings" showDivider {...({} as any)}>
            <DropdownItem key="language" textValue="Language" isReadOnly className="p-0">
              <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                <span className="text-[13px] text-[color:var(--ai-muted)]">{t('language')}</span>
                <LanguageSwitcher />
              </div>
            </DropdownItem>
            <DropdownItem key="theme" textValue="Theme" isReadOnly className="p-0">
              <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                <span className="text-[13px] text-[color:var(--ai-muted)]">
                  {t('theme.toggle')}
                </span>
                <ThemeToggle />
              </div>
            </DropdownItem>
          </DropdownSection>

          <DropdownSection aria-label="Auth Actions" {...({} as any)}>
            <DropdownItem
              key="login"
              textValue="Login"
              className="p-0"
              onClick={handleOpenLoginModal}
            >
              <button
                type="button"
                onClick={handleOpenLoginModal}
                className="flex items-center justify-center w-full px-2 py-2 rounded-md text-[13px] font-semibold bg-[color:var(--ai-foreground)] text-[color:var(--ai-background)] hover:opacity-90 transition-opacity"
              >
                {t('buttons.login')}
              </button>
            </DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
