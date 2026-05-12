'use client';

/**
 * AuthActions v2 — single ghost "Sign in" button. The login modal handles
 * both signin and signup, so the duplicate gradient signup CTA is dead UX
 * weight in the header.
 */

import React, { useContext } from 'react';
import { useTranslations } from 'next-intl';

import { AppContext } from '@/components/AppContext';
import Login from '@/components/Login';

export default function AuthActions() {
  const t = useTranslations('common.buttons');
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
      modalHeader: t('login'),
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
    <button
      type="button"
      onClick={handleOpenLoginModal}
      className="ml-1 inline-flex items-center h-8 px-3.5 text-[13px] font-semibold tracking-[-0.005em] rounded-md bg-[color:var(--ai-foreground)] text-[color:var(--ai-background)] hover:opacity-90 transition-opacity duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ai-primary)]"
    >
      {t('login')}
    </button>
  );
}
