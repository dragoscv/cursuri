'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

import { AdminShellProvider, useAdminShell } from './useAdminShell';
import AdminSidebarNew from './AdminSidebarNew';
import AdminTopbar from './AdminTopbar';
import AdminCommandPalette from './AdminCommandPalette';

const ShellInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mobileOpen, setMobileOpen } = useAdminShell();
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-[color:var(--ai-background)]">
      {/* Decorative background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-60"
        style={{
          background:
            'radial-gradient(60% 40% at 0% 0%, rgba(99,102,241,0.07), transparent), radial-gradient(50% 35% at 100% 0%, rgba(56,189,248,0.06), transparent)',
        }}
      />

      {/* Desktop sidebar */}
      <div className="hidden lg:flex sticky top-0 h-screen z-20">
        <AdminSidebarNew variant="desktop" />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <AdminSidebarNew variant="mobile" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0">
        <AdminTopbar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="mx-auto w-full max-w-[1400px]"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AdminCommandPalette />
    </div>
  );
};

export const AdminShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AdminShellProvider>
    <ShellInner>{children}</ShellInner>
  </AdminShellProvider>
);

export default AdminShell;
