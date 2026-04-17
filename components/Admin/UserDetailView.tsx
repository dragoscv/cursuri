'use client';

import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Avatar,
    Button,
    Chip,
    Spinner,
    Tabs,
    Tab,
    Input,
} from '@heroui/react';
import SelectItem from '@/components/ui/SelectItem';
import { Select } from '@heroui/react';
import { AppContext } from '@/components/AppContext';
import { AppContextProps, UserProfile } from '@/types';
import { firebaseAuth, firebaseApp } from '@/utils/firebase/firebase.config';
import {
    getFirestore,
    doc,
    updateDoc,
    setDoc,
    Timestamp,
    collection,
    getDocs,
} from 'firebase/firestore';
import GitHubAccountsTab from './GitHubAccountsTab';
import { UserRole } from '@/utils/firebase/adminAuth';

interface AdminUserData {
    id: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
    role: string;
    bio: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    lastSignInTime: string | null;
    disabled: boolean;
    enrollments: Record<string, { enrolledAt?: { seconds: number } | string; source?: string; status?: string }>;
}

interface SubscriptionSummary {
    id: string;
    status: string;
    productName: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    created: string | null;
}

async function apiCall(url: string, method = 'GET', body?: Record<string, unknown>) {
    const token = await firebaseAuth.currentUser?.getIdToken();
    const opts: RequestInit = {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    };
    if (body) opts.body = JSON.stringify(body);
    return fetch(url, opts);
}

function formatDate(value: string | null | undefined): string {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString();
    } catch {
        return '—';
    }
}

function StatCard({
    label,
    value,
    icon,
    gradient,
}: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    gradient: string;
}) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            className={`relative overflow-hidden rounded-2xl p-5 border border-[color:var(--ai-card-border)] bg-gradient-to-br ${gradient}`}
        >
            <div className="absolute -right-4 -top-4 opacity-10 text-7xl">{icon}</div>
            <p className="text-xs font-medium text-[color:var(--ai-muted-foreground)] uppercase tracking-wide">
                {label}
            </p>
            <p className="mt-2 text-2xl font-bold text-[color:var(--ai-foreground)]">{value}</p>
        </motion.div>
    );
}

export default function UserDetailView({ userId }: { userId: string }) {
    const router = useRouter();
    const context = useContext(AppContext) as AppContextProps;
    const { courses } = context;

    const [user, setUser] = useState<AdminUserData | null>(null);
    const [subscriptions, setSubscriptions] = useState<SubscriptionSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState('overview');

    const [editMode, setEditMode] = useState(false);
    const [edited, setEdited] = useState<Partial<AdminUserData>>({});
    const [savingProfile, setSavingProfile] = useState(false);
    const [notes, setNotes] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);

    const fetchUser = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [userRes, subsRes] = await Promise.all([
                apiCall(`/api/admin/users/${userId}`),
                apiCall(`/api/admin/users/${userId}/subscriptions`),
            ]);
            const userData = await userRes.json();
            const subsData = await subsRes.json();

            if (userData.success) {
                setUser(userData.user);
            } else {
                setError(userData.error || 'Failed to load user');
            }
            if (subsData.success) {
                setSubscriptions(subsData.subscriptions);
            }
        } catch (err) {
            console.error(err);
            setError('Network error loading user');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const loadNotes = useCallback(async () => {
        try {
            const db = getFirestore(firebaseApp);
            const snapshot = await getDocs(collection(db, `users/${userId}/metadata`));
            snapshot.forEach((d) => {
                if (d.id === 'notes') setNotes(d.data().content || '');
            });
        } catch (err) {
            console.error('Failed to load notes', err);
        }
    }, [userId]);

    useEffect(() => {
        fetchUser();
        loadNotes();
    }, [fetchUser, loadNotes]);

    const handleSaveProfile = async () => {
        if (!user) return;
        setSavingProfile(true);
        try {
            const db = getFirestore(firebaseApp);
            await updateDoc(doc(db, `users/${user.id}`), {
                ...edited,
                updatedAt: Timestamp.now(),
            });
            setUser({ ...user, ...edited });
            setEditMode(false);
            setEdited({});
        } catch (err) {
            console.error(err);
            setError('Failed to update profile');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleSaveNotes = async (content: string) => {
        setNotes(content);
        setSavingNotes(true);
        try {
            const db = getFirestore(firebaseApp);
            await setDoc(doc(db, `users/${userId}/metadata/notes`), {
                content,
                updatedAt: Timestamp.now(),
            });
        } catch (err) {
            console.error('Failed to save notes', err);
        } finally {
            setSavingNotes(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spinner size="lg" color="primary" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="text-center py-16">
                <div className="inline-block p-4 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                    <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-[color:var(--ai-foreground)] mb-2">{error || 'User not found'}</h2>
                <Button color="primary" variant="flat" onPress={() => router.push('/admin/users')} className="mt-4">
                    Back to Users
                </Button>
            </div>
        );
    }

    const enrollmentCount = Object.keys(user.enrollments || {}).length;
    const activeSubscriptions = subscriptions.filter((s) => ['active', 'trialing'].includes(s.status)).length;
    const isAdminRole = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;

    return (
        <div className="space-y-6">
            {/* Back navigation */}
            <div className="flex items-center gap-2">
                <Button
                    variant="light"
                    size="sm"
                    onPress={() => router.push('/admin/users')}
                    startContent={
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    }
                    className="text-[color:var(--ai-muted-foreground)] hover:text-[color:var(--ai-foreground)]"
                >
                    Back to Users
                </Button>
            </div>

            {/* Hero header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-[color:var(--ai-accent)]/10 border border-[color:var(--ai-card-border)] p-6 md:p-8"
            >
                {/* Decorative blobs */}
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-[color:var(--ai-primary)]/30 to-[color:var(--ai-secondary)]/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-br from-[color:var(--ai-secondary)]/30 to-[color:var(--ai-accent)]/30 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                    <Avatar
                        src={user.photoURL || ''}
                        name={user.displayName || user.email || '?'}
                        className="w-24 h-24 text-2xl ring-4 ring-white/50 dark:ring-white/10"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--ai-foreground)] truncate">
                                {user.displayName || 'Unnamed User'}
                            </h1>
                            <Chip color={isAdminRole ? 'primary' : 'default'} variant="flat" size="sm">
                                {user.role}
                            </Chip>
                            {user.emailVerified ? (
                                <Chip color="success" variant="flat" size="sm" startContent={<span>✓</span>}>
                                    Verified
                                </Chip>
                            ) : (
                                <Chip color="warning" variant="flat" size="sm">
                                    Unverified
                                </Chip>
                            )}
                            {user.disabled && (
                                <Chip color="danger" variant="flat" size="sm">
                                    Disabled
                                </Chip>
                            )}
                        </div>
                        <p className="text-[color:var(--ai-muted-foreground)] truncate">{user.email}</p>
                        <p className="text-xs text-[color:var(--ai-muted-foreground)] mt-1 font-mono">
                            ID: {user.id}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            color="primary"
                            variant="flat"
                            size="sm"
                            onPress={() => {
                                setEditMode(true);
                                setEdited({
                                    displayName: user.displayName,
                                    role: user.role,
                                    bio: user.bio,
                                });
                                setSelectedTab('overview');
                            }}
                            startContent={
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            }
                        >
                            Edit Profile
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Enrollments"
                    value={enrollmentCount}
                    icon="📚"
                    gradient="from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30"
                />
                <StatCard
                    label="Active Subs"
                    value={activeSubscriptions}
                    icon="💎"
                    gradient="from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30"
                />
                <StatCard
                    label="Total Subs"
                    value={subscriptions.length}
                    icon="🧾"
                    gradient="from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30"
                />
                <StatCard
                    label="Member Since"
                    value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    icon="📅"
                    gradient="from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30"
                />
            </div>

            {/* Tabs - flat layout, no surrounding card */}
            <div>
                <div className="sticky top-0 z-10 bg-[color:var(--ai-background)]/80 backdrop-blur-md border-b border-[color:var(--ai-card-border)] -mx-3 sm:-mx-4 px-3 sm:px-4">
                    <Tabs
                        aria-label="User detail tabs"
                        selectedKey={selectedTab}
                        onSelectionChange={(key) => setSelectedTab(String(key))}
                        variant="underlined"
                        classNames={{
                            tabList: 'gap-2 sm:gap-4 overflow-x-auto p-0',
                            tab: 'py-3 px-2 sm:px-3 font-medium whitespace-nowrap h-auto',
                            cursor: 'bg-[color:var(--ai-primary)]',
                        }}
                    >
                        <Tab key="overview" title="🏠 Overview" />
                        <Tab key="enrollments" title={`📚 Enrollments (${enrollmentCount})`} />
                        <Tab key="github" title="🐙 GitHub Accounts" />
                        <Tab key="subscriptions" title={`💎 Subscriptions (${subscriptions.length})`} />
                        <Tab key="notes" title="📝 Admin Notes" />
                        <Tab key="permissions" title="🛡️ Permissions" />
                    </Tabs>
                </div>

                <motion.div
                    key={selectedTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="pt-6"
                >
                    {/* Overview Tab */}
                    {selectedTab === 'overview' && (
                        <div className="space-y-4">
                            {editMode ? (
                                <div className="space-y-4 max-w-2xl">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Display Name</label>
                                        <Input
                                            value={edited.displayName || ''}
                                            onChange={(e) => setEdited({ ...edited, displayName: e.target.value })}
                                            placeholder="Display name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Role</label>
                                        <Select
                                            selectedKeys={edited.role ? [edited.role] : []}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                                setEdited({ ...edited, role: e.target.value })
                                            }
                                        >
                                            <SelectItem key="user" value="user" textValue="user">User</SelectItem>
                                            <SelectItem key="instructor" value="instructor" textValue="instructor">Instructor</SelectItem>
                                            <SelectItem key="admin" value="admin" textValue="admin">Admin</SelectItem>
                                            <SelectItem key="super_admin" value="super_admin" textValue="super_admin">Super Admin</SelectItem>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Bio</label>
                                        <textarea
                                            value={edited.bio || ''}
                                            onChange={(e) => setEdited({ ...edited, bio: e.target.value })}
                                            rows={4}
                                            className="w-full px-3 py-2 rounded-md border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] text-[color:var(--ai-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)]"
                                            placeholder="User bio..."
                                        />
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <Button variant="flat" onPress={() => { setEditMode(false); setEdited({}); }}>
                                            Cancel
                                        </Button>
                                        <Button color="primary" isLoading={savingProfile} onPress={handleSaveProfile}>
                                            Save Changes
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoRow label="Display Name" value={user.displayName || 'Not set'} />
                                    <InfoRow label="Email" value={user.email || '—'} />
                                    <InfoRow label="Role" value={user.role} />
                                    <InfoRow label="Email Verified" value={user.emailVerified ? 'Yes' : 'No'} />
                                    <InfoRow label="Account Created" value={formatDate(user.createdAt)} />
                                    <InfoRow label="Last Sign In" value={formatDate(user.lastSignInTime)} />
                                    <InfoRow label="Last Updated" value={formatDate(user.updatedAt)} />
                                    <InfoRow label="Status" value={user.disabled ? 'Disabled' : 'Active'} />
                                    <div className="md:col-span-2">
                                        <InfoRow label="Bio" value={user.bio || 'No bio provided'} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Enrollments Tab */}
                    {selectedTab === 'enrollments' && (
                        <div className="space-y-3">
                            {enrollmentCount > 0 ? (
                                Object.entries(user.enrollments).map(([courseId, enrollment]) => {
                                    const course = courses?.[courseId];
                                    return (
                                        <div
                                            key={courseId}
                                            className="flex justify-between items-center p-4 bg-[color:var(--ai-card-bg)]/60 rounded-xl border border-[color:var(--ai-card-border)]"
                                        >
                                            <div className="min-w-0">
                                                <p className="font-medium truncate">{course?.name || 'Unknown Course'}</p>
                                                <p className="text-xs text-[color:var(--ai-muted-foreground)] mt-1">
                                                    {enrollment.enrolledAt
                                                        ? typeof enrollment.enrolledAt === 'object' && 'seconds' in enrollment.enrolledAt
                                                            ? `Enrolled: ${new Date(enrollment.enrolledAt.seconds * 1000).toLocaleDateString()}`
                                                            : `Enrolled: ${new Date(enrollment.enrolledAt).toLocaleDateString()}`
                                                        : ''}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Chip size="sm" color={enrollment.source === 'admin' ? 'primary' : 'success'} variant="flat">
                                                    {enrollment.source === 'admin' ? 'Assigned' : 'Purchased'}
                                                </Chip>
                                                {enrollment.status && (
                                                    <Chip size="sm" color="default" variant="flat">
                                                        {enrollment.status}
                                                    </Chip>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <EmptyState icon="📚" message="No course enrollments yet" />
                            )}
                        </div>
                    )}

                    {/* GitHub Accounts Tab */}
                    {selectedTab === 'github' && (
                        <GitHubAccountsTab
                            user={{
                                id: user.id,
                                email: user.email || '',
                                displayName: user.displayName || '',
                            } as UserProfile}
                            subscriptions={subscriptions.map((s) => ({
                                id: s.id,
                                status: s.status,
                                product: { name: s.productName || s.id.slice(-8) },
                            })) as never}
                        />
                    )}

                    {/* Subscriptions Tab */}
                    {selectedTab === 'subscriptions' && (
                        <div className="space-y-3">
                            {subscriptions.length > 0 ? (
                                subscriptions.map((sub) => (
                                    <div
                                        key={sub.id}
                                        className="p-4 bg-[color:var(--ai-card-bg)]/60 rounded-xl border border-[color:var(--ai-card-border)]"
                                    >
                                        <div className="flex justify-between items-start gap-3 flex-wrap">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-semibold truncate">
                                                        {sub.productName || 'Subscription'}
                                                    </p>
                                                    <Chip
                                                        size="sm"
                                                        color={
                                                            sub.status === 'active' || sub.status === 'trialing'
                                                                ? 'success'
                                                                : sub.status === 'canceled'
                                                                    ? 'danger'
                                                                    : 'warning'
                                                        }
                                                        variant="flat"
                                                    >
                                                        {sub.status}
                                                    </Chip>
                                                    {sub.cancelAtPeriodEnd && (
                                                        <Chip size="sm" color="warning" variant="flat">
                                                            Cancels at period end
                                                        </Chip>
                                                    )}
                                                </div>
                                                <p className="text-xs text-[color:var(--ai-muted-foreground)] font-mono truncate">
                                                    {sub.id}
                                                </p>
                                            </div>
                                            <div className="text-right text-xs text-[color:var(--ai-muted-foreground)]">
                                                <p>Created: {formatDate(sub.created)}</p>
                                                {sub.currentPeriodEnd && <p>Renews: {formatDate(sub.currentPeriodEnd)}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState icon="💎" message="No subscriptions yet" />
                            )}
                        </div>
                    )}

                    {/* Notes Tab */}
                    {selectedTab === 'notes' && (
                        <div className="space-y-3">
                            <p className="text-sm text-[color:var(--ai-muted-foreground)]">
                                Internal notes — only visible to admins.
                            </p>
                            <textarea
                                value={notes}
                                onChange={(e) => handleSaveNotes(e.target.value)}
                                rows={10}
                                className="w-full px-3 py-2 rounded-md border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] text-[color:var(--ai-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ai-primary)]"
                                placeholder="Add notes about this user..."
                            />
                            <p className="text-xs text-[color:var(--ai-muted-foreground)]">
                                {savingNotes ? 'Saving...' : 'Auto-saves on change'}
                            </p>
                        </div>
                    )}

                    {/* Permissions Tab */}
                    {selectedTab === 'permissions' && (
                        <div className="space-y-4">
                            <div className="bg-[color:var(--ai-card-bg)]/60 rounded-xl p-4 border border-[color:var(--ai-card-border)]">
                                <h4 className="font-semibold mb-3">Role Capabilities</h4>
                                <div className="space-y-2">
                                    <PermissionRow label="Access admin dashboard" enabled={isAdminRole} />
                                    <PermissionRow label="Manage courses" enabled={isAdminRole} />
                                    <PermissionRow label="Manage users" enabled={isAdminRole} />
                                    <PermissionRow label="Access analytics" enabled={isAdminRole} />
                                    <PermissionRow label="Create content" enabled={isAdminRole || user.role === 'instructor'} />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button color="warning" variant="flat" className="flex-1">
                                    {user.disabled ? 'Re-enable Account' : 'Suspend Account'}
                                </Button>
                                <Button color="danger" variant="flat" className="flex-1">
                                    Delete Account
                                </Button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-[color:var(--ai-card-bg)]/60 rounded-xl p-4 border border-[color:var(--ai-card-border)]">
            <p className="text-xs font-medium text-[color:var(--ai-muted-foreground)] uppercase tracking-wide mb-1">
                {label}
            </p>
            <p className="text-sm font-medium text-[color:var(--ai-foreground)] break-words">{value}</p>
        </div>
    );
}

function PermissionRow({ label, enabled }: { label: string; enabled: boolean }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-[color:var(--ai-card-border)] last:border-0">
            <span className="text-sm">{label}</span>
            <Chip size="sm" color={enabled ? 'success' : 'default'} variant="flat">
                {enabled ? '✓ Allowed' : '✗ Denied'}
            </Chip>
        </div>
    );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
    return (
        <div className="text-center py-12 bg-[color:var(--ai-card-bg)]/40 rounded-xl border border-dashed border-[color:var(--ai-card-border)]">
            <div className="text-5xl mb-3">{icon}</div>
            <p className="text-[color:var(--ai-muted-foreground)]">{message}</p>
        </div>
    );
}
