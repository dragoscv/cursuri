'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Tooltip } from '@heroui/react';
import { motion } from 'framer-motion';

import { AppContext } from '@/components/AppContext';
import DefaultAvatar from '@/components/shared/DefaultAvatar';
import { FiUser, FiSettings, FiLogOut, FiBell } from '@/components/icons/FeatherIcons';
import { signOut } from 'firebase/auth';
import { firebaseAuth } from '@/utils/firebase/firebase.config';
import { useRouter } from 'next/navigation';

import AdminBreadcrumbs from './AdminBreadcrumbs';
import { useAdminShell } from './useAdminShell';
import { IconMenu, IconCommand, IconExternal } from './icons';

const AdminTopbar: React.FC = () => {
    const { setMobileOpen, setPaletteOpen } = useAdminShell();
    const ctx = useContext(AppContext);
    const router = useRouter();
    const user = ctx?.user;

    const handleSignOut = async () => {
        await signOut(firebaseAuth);
        router.push('/');
    };

    return (
        <header
            className={[
                'sticky top-0 z-30 h-16',
                'bg-[color:var(--ai-background)]/80 backdrop-blur-xl',
                'border-b border-[color:var(--ai-card-border)]',
            ].join(' ')}
        >
            <div className="h-full flex items-center gap-3 px-4 sm:px-6">
                {/* Mobile menu toggle */}
                <button
                    type="button"
                    className="lg:hidden h-9 w-9 grid place-items-center rounded-lg text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-primary)]/10 transition"
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open menu"
                >
                    <IconMenu />
                </button>

                {/* Breadcrumbs */}
                <div className="min-w-0 flex-1">
                    <AdminBreadcrumbs />
                </div>

                {/* Search trigger (desktop) */}
                <button
                    type="button"
                    onClick={() => setPaletteOpen(true)}
                    className="hidden md:inline-flex items-center gap-2 h-9 pl-3 pr-2 rounded-lg bg-[color:var(--ai-card-bg)]/70 border border-[color:var(--ai-card-border)] text-xs text-[color:var(--ai-muted)] hover:border-[color:var(--ai-primary)]/40 hover:text-[color:var(--ai-foreground)] transition min-w-[220px]"
                >
                    <span className="opacity-70">Search admin…</span>
                    <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-[color:var(--ai-card-border)] text-[10px] font-medium">
                        <IconCommand size={11} /> K
                    </span>
                </button>

                {/* View site */}
                <Tooltip content="View site" placement="bottom">
                    <Link
                        href="/"
                        target="_blank"
                        className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-lg text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-primary)]/10 transition"
                        aria-label="Open site in new tab"
                    >
                        <IconExternal />
                    </Link>
                </Tooltip>

                {/* Notifications (placeholder) */}
                <Tooltip content="Notifications" placement="bottom">
                    <button
                        type="button"
                        className="relative h-9 w-9 grid place-items-center rounded-lg text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-primary)]/10 transition"
                        aria-label="Notifications"
                    >
                        <FiBell size={18} />
                        <motion.span
                            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[color:var(--ai-primary)]"
                        />
                    </button>
                </Tooltip>

                {/* User dropdown */}
                <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                        <button type="button" className="rounded-full focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)]/40">
                            {user?.photoURL ? (
                                <Avatar src={user.photoURL} className="w-9 h-9 cursor-pointer" />
                            ) : (
                                <div className="cursor-pointer">
                                    <DefaultAvatar name={user?.displayName || user?.email || 'A'} size={36} />
                                </div>
                            )}
                        </button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Admin menu">
                        <DropdownItem key="profile-info" isReadOnly className="opacity-100">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{user?.displayName || 'Admin'}</span>
                                <span className="text-xs text-[color:var(--ai-muted)]">{user?.email}</span>
                            </div>
                        </DropdownItem>
                        <DropdownItem key="my-profile" startContent={<FiUser size={14} />} href="/profile">
                            My Profile
                        </DropdownItem>
                        <DropdownItem key="settings" startContent={<FiSettings size={14} />} href="/admin/settings">
                            Admin Settings
                        </DropdownItem>
                        <DropdownItem
                            key="signout"
                            color="danger"
                            startContent={<FiLogOut size={14} />}
                            onPress={handleSignOut}
                        >
                            Sign out
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
        </header>
    );
};

export default AdminTopbar;
