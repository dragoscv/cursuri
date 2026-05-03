'use client';

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Avatar,
  Button,
  Chip,
  Pagination,
  Tooltip,
} from '@heroui/react';
import { motion } from 'framer-motion';

import { AppContext } from '@/components/AppContext';
import { Course, UserProfile } from '@/types';
import { useToast } from '@/components/Toast/ToastContext';
import {
  ColumnVisibilityMenu,
  DataToolbar,
  EmptyState,
  PageSizeSelect,
  SortableHeader,
  type ColumnDef,
  type SortDirection,
} from '@/components/Admin/shell';
import { AppModal } from '@/components/shared/ui';
import { firebaseAuth } from '@/utils/firebase/firebase.config';
import Select, { SelectItem } from '@/components/ui/Select';
import Autocomplete from '@/components/ui/Autocomplete';
import { ContextMenuTrigger, type ContextMenuItem } from '@/components/ui/ContextMenu';
import {
  FiUsers,
  FiCheckCircle,
  FiX,
  FiBookOpen,
  FiCreditCard,
  FiCheck,
} from '@/components/icons/FeatherIcons';
import { IconBolt } from '@/components/Admin/shell/icons';

const ROWS_PER_PAGE = 12;
const PAGE_SIZE_STORAGE_KEY = 'admin-users-page-size-v1';
const PAGE_SIZE_OPTIONS = [12, 25, 50, 100, 250, 500];
const MAX_PAGE_SIZE = 500;

type RoleFilter = '' | 'admin' | 'instructor' | 'user';
type VerifiedFilter = '' | 'verified' | 'unverified';
type ColumnKey =
  | 'select'
  | 'user'
  | 'email'
  | 'verified'
  | 'role'
  | 'enrolled'
  | 'subscriptions'
  | 'githubAccounts'
  | 'memberSince'
  | 'actions';

const COLUMN_DEFS: ColumnDef<ColumnKey>[] = [
  { key: 'select', label: 'Selection checkbox', locked: true },
  { key: 'user', label: 'User', locked: true, description: 'Avatar, name, ID' },
  { key: 'email', label: 'Email' },
  { key: 'verified', label: 'Verified' },
  { key: 'role', label: 'Role' },
  { key: 'enrolled', label: 'Enrolled', description: 'Number of course enrollments' },
  { key: 'subscriptions', label: 'Subscriptions', description: 'Active / total Stripe subs' },
  {
    key: 'githubAccounts',
    label: 'GitHub accounts',
    description: 'Healthy / total provisioned accounts',
  },
  { key: 'memberSince', label: 'Member since' },
  { key: 'actions', label: 'Actions', locked: true },
];

const DEFAULT_VISIBILITY: Record<ColumnKey, boolean> = {
  select: true,
  user: true,
  email: true,
  verified: true,
  role: true,
  enrolled: true,
  subscriptions: true,
  githubAccounts: true,
  memberSince: true,
  actions: true,
};

const COLUMN_VIS_STORAGE_KEY = 'admin-users-column-visibility-v2';

const formatDate = (raw: any): string => {
  if (!raw) return '—';
  const d =
    typeof raw === 'object' && 'seconds' in raw
      ? new Date(raw.seconds * 1000)
      : new Date(raw);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString();
};

const enrollmentCount = (u: UserProfile): number =>
  u.enrollments ? Object.keys(u.enrollments).length : 0;

const createdAtSeconds = (u: UserProfile): number => {
  const raw = u.createdAt as any;
  if (!raw) return 0;
  if (typeof raw === 'object' && 'seconds' in raw) return raw.seconds as number;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t / 1000;
};

const AdminUsers: React.FC = () => {
  const t = useTranslations('admin.users');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const ctx = useContext(AppContext);
  const { showToast } = useToast();

  if (!ctx) throw new Error('AdminUsers must be used within an AppProvider');
  const { users, getAllUsers, courses, assignCourseToUser } = ctx;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('');
  const [verifiedFilter, setVerifiedFilter] = useState<VerifiedFilter>('');
  const [sortKey, setSortKey] = useState<string | null>('memberSince');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(ROWS_PER_PAGE);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [columnVisibility, setColumnVisibility] = useState<Record<ColumnKey, boolean>>(
    DEFAULT_VISIBILITY
  );

  // Hydrate column visibility from localStorage so admins keep their layout.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(COLUMN_VIS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Record<ColumnKey, boolean>>;
        setColumnVisibility((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      /* ignore */
    }
    // Hydrate page size, clamped to allowed range.
    try {
      const raw = localStorage.getItem(PAGE_SIZE_STORAGE_KEY);
      if (raw) {
        const parsed = parseInt(raw, 10);
        if (Number.isFinite(parsed) && parsed > 0) {
          setPageSize(Math.min(MAX_PAGE_SIZE, Math.max(1, parsed)));
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handlePageSizeChange = (next: number) => {
    const clamped = Math.min(MAX_PAGE_SIZE, Math.max(1, next));
    setPageSize(clamped);
    setPage(1);
    try {
      localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(clamped));
    } catch {
      /* ignore */
    }
  };

  const persistVisibility = (next: Record<ColumnKey, boolean>) => {
    setColumnVisibility(next);
    try {
      localStorage.setItem(COLUMN_VIS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  // Per-user counters loaded from aggregate endpoints.
  const [subSummary, setSubSummary] = useState<Record<string, { total: number; active: number }>>(
    {}
  );
  const [ghSummary, setGhSummary] = useState<Record<string, { total: number; healthy: number }>>(
    {}
  );

  // assign course modal
  const [assignFor, setAssignFor] = useState<UserProfile | null>(null);
  const [assignBulk, setAssignBulk] = useState(false);
  const [assignCourseId, setAssignCourseId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchUsers = async () => {
      setLoading(true);
      try {
        if (getAllUsers) await getAllUsers();
      } catch (e) {
        console.error(e);
        if (mounted) setError(t('failedToLoad'));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchUsers();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch the per-user subscription + GitHub account counters in parallel.
  // Errors are non-fatal — column simply renders "—" for users without data.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await firebaseAuth.currentUser?.getIdToken();
        if (!token) return;
        const [subsRes, ghRes] = await Promise.all([
          fetch('/api/admin/users/subscriptions-summary', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/admin/users/github-accounts-summary', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (subsRes.ok) {
          const data = await subsRes.json();
          if (mounted && data?.summary) setSubSummary(data.summary);
        }
        if (ghRes.ok) {
          const data = await ghRes.json();
          if (mounted && data?.summary) setGhSummary(data.summary);
        }
      } catch (e) {
        console.warn('Failed to fetch admin user summaries:', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const allUsers = useMemo<UserProfile[]>(
    () => (users ? Object.values(users) : []),
    [users]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allUsers
      .filter((u) => {
        if (
          q &&
          !(
            u.email?.toLowerCase().includes(q) ||
            u.displayName?.toLowerCase().includes(q) ||
            u.id.toLowerCase().includes(q)
          )
        ) {
          return false;
        }
        if (roleFilter) {
          const role = (u.role || 'user') as string;
          if (role !== roleFilter) return false;
        }
        if (verifiedFilter === 'verified' && !u.emailVerified) return false;
        if (verifiedFilter === 'unverified' && u.emailVerified) return false;
        return true;
      })
      .sort((a, b) => {
        if (!sortKey || !sortDir) return 0;
        const dir = sortDir === 'asc' ? 1 : -1;
        switch (sortKey) {
          case 'user': {
            return (
              (a.displayName || a.email || '').localeCompare(
                b.displayName || b.email || ''
              ) * dir
            );
          }
          case 'email':
            return (a.email || '').localeCompare(b.email || '') * dir;
          case 'verified':
            return ((a.emailVerified ? 1 : 0) - (b.emailVerified ? 1 : 0)) * dir;
          case 'role':
            return (a.role || 'user').localeCompare(b.role || 'user') * dir;
          case 'enrolled':
            return (enrollmentCount(a) - enrollmentCount(b)) * dir;
          case 'subscriptions': {
            const sa = subSummary[a.id]?.active ?? 0;
            const sb = subSummary[b.id]?.active ?? 0;
            return (sa - sb) * dir;
          }
          case 'githubAccounts': {
            const ga = ghSummary[a.id]?.healthy ?? 0;
            const gb = ghSummary[b.id]?.healthy ?? 0;
            return (ga - gb) * dir;
          }
          case 'memberSince':
            return (createdAtSeconds(a) - createdAtSeconds(b)) * dir;
          default:
            return 0;
        }
      });
  }, [allUsers, search, roleFilter, verifiedFilter, sortKey, sortDir, subSummary, ghSummary]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // reset paging on filter change
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, verifiedFilter, sortKey, sortDir]);

  // selection helpers
  const allOnPageSelected = paginated.length > 0 && paginated.every((u) => selected.has(u.id));
  const toggleSelectAllOnPage = () => {
    const next = new Set(selected);
    if (allOnPageSelected) {
      paginated.forEach((u) => next.delete(u.id));
    } else {
      paginated.forEach((u) => next.add(u.id));
    }
    setSelected(next);
  };
  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };
  const clearSelection = () => setSelected(new Set());

  // assign flow
  const openAssign = (user: UserProfile | null, bulk = false) => {
    setAssignFor(user);
    setAssignBulk(bulk);
    setAssignCourseId('');
  };
  const closeAssign = () => {
    setAssignFor(null);
    setAssignBulk(false);
    setAssignCourseId('');
    setAssignLoading(false);
  };
  const handleAssign = async () => {
    if (!assignCourseId || !assignCourseToUser) return;
    const targets = assignBulk
      ? Array.from(selected)
      : assignFor
        ? [assignFor.id]
        : [];
    if (targets.length === 0) return;
    setAssignLoading(true);
    try {
      const results = await Promise.all(
        targets.map((id) => assignCourseToUser(id, assignCourseId))
      );
      const ok = results.filter(Boolean).length;
      const fail = results.length - ok;
      const courseName = courses[assignCourseId]?.name ?? 'course';
      if (ok > 0) {
        showToast({
          type: 'success',
          message: assignBulk
            ? `Assigned “${courseName}” to ${ok} user${ok === 1 ? '' : 's'}`
            : t('courseAssignedTo', {
              name: assignFor?.displayName || assignFor?.email || 'User',
            }),
          duration: 3500,
        });
      }
      if (fail > 0) {
        showToast({
          type: 'error',
          message: `${fail} assignment${fail === 1 ? '' : 's'} failed`,
          duration: 4000,
        });
      }
      if (assignBulk) clearSelection();
      closeAssign();
    } catch (e) {
      console.error(e);
      showToast({
        type: 'error',
        message: 'Failed to assign course',
        duration: 4000,
      });
      setAssignLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<FiX size={22} />}
        title={error}
        description={tCommon('pleaseTryAgain')}
      />
    );
  }

  const counters = {
    total: allUsers.length,
    verified: allUsers.filter((u) => u.emailVerified).length,
    admins: allUsers.filter((u) => u.role === 'admin').length,
  };

  // Build per-row context menu items.
  const buildRowMenu = (user: UserProfile): ContextMenuItem[] => {
    const sub = subSummary[user.id];
    const gh = ghSummary[user.id];
    const items: ContextMenuItem[] = [
      {
        id: 'view',
        label: 'View user details',
        icon: <FiUsers size={14} />,
        onSelect: () => router.push(`/admin/users/${user.id}`),
      },
      {
        id: 'assign',
        label: 'Assign course',
        icon: <FiBookOpen size={14} />,
        onSelect: () => openAssign(user),
      },
      {
        id: 'subs',
        label: `View subscriptions${sub ? ` (${sub.active}/${sub.total})` : ''}`,
        icon: <FiCreditCard size={14} />,
        onSelect: () => router.push(`/admin/users/${user.id}#subscriptions`),
      },
      {
        id: 'github',
        label: `View GitHub accounts${gh ? ` (${gh.healthy}/${gh.total})` : ''}`,
        icon: <GitHubIcon size={14} />,
        onSelect: () => router.push(`/admin/users/${user.id}#github-accounts`),
      },
      {
        id: 'sep1',
        divider: true,
      },
      {
        id: 'copy-email',
        label: 'Copy email',
        description: user.email,
        icon: <CopyIcon size={14} />,
        disabled: !user.email,
        onSelect: () => {
          if (user.email) {
            navigator.clipboard.writeText(user.email);
            showToast({ type: 'success', message: 'Email copied', duration: 2000 });
          }
        },
      },
      {
        id: 'copy-id',
        label: 'Copy user ID',
        description: user.id,
        icon: <CopyIcon size={14} />,
        onSelect: () => {
          navigator.clipboard.writeText(user.id);
          showToast({ type: 'success', message: 'User ID copied', duration: 2000 });
        },
      },
      {
        id: 'sep2',
        divider: true,
      },
      {
        id: 'select',
        label: selected.has(user.id) ? 'Remove from selection' : 'Add to selection',
        icon: <FiCheck size={14} />,
        onSelect: () => toggleSelect(user.id),
      },
    ];
    return items;
  };

  const handleSort = (key: string, direction: SortDirection) => {
    setSortKey(direction ? key : null);
    setSortDir(direction);
  };

  const colspan =
    Object.values(columnVisibility).filter(Boolean).length;

  return (
    <div className="space-y-5">
      {/* Mini stats strip */}
      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Total" value={counters.total} icon={<FiUsers size={14} />} tone="primary" />
        <MiniStat label="Verified" value={counters.verified} icon={<FiCheckCircle size={14} />} tone="success" />
        <MiniStat label="Admins" value={counters.admins} icon={<IconBolt size={14} />} tone="warning" />
      </div>

      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('searchUsers')}
        selectionCount={selected.size}
        onClearSelection={clearSelection}
        selectionActions={
          <Button
            size="sm"
            color="primary"
            startContent={<FiBookOpen size={14} />}
            onPress={() => openAssign(null, true)}
          >
            Assign course to {selected.size}
          </Button>
        }
        filters={
          <>
            <Autocomplete<RoleFilter>
              ariaLabel="Filter by role"
              placeholder="All roles"
              className="min-w-[160px]"
              value={roleFilter}
              onChange={(v) => setRoleFilter(v as RoleFilter)}
              options={[
                { value: 'admin', label: 'Admin', description: 'Full platform access' },
                { value: 'instructor', label: 'Instructor', description: 'Can manage courses' },
                { value: 'user', label: 'User', description: 'Standard learner' },
              ]}
            />
            <Autocomplete<VerifiedFilter>
              ariaLabel="Filter by verification"
              placeholder="All statuses"
              className="min-w-[170px]"
              value={verifiedFilter}
              onChange={(v) => setVerifiedFilter(v as VerifiedFilter)}
              options={[
                { value: 'verified', label: t('verified') },
                { value: 'unverified', label: t('notVerified') },
              ]}
            />
            <ColumnVisibilityMenu<ColumnKey>
              columns={COLUMN_DEFS}
              visible={columnVisibility}
              onChange={persistVisibility}
              onReset={() => persistVisibility(DEFAULT_VISIBILITY)}
            />
          </>
        }
      />

      {/* Table */}
      <div className="rounded-2xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/70 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider bg-[color:var(--ai-background)]/40">
                {columnVisibility.select && (
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select all on page"
                      checked={allOnPageSelected}
                      onChange={toggleSelectAllOnPage}
                      className="accent-[color:var(--ai-primary)] cursor-pointer"
                    />
                  </th>
                )}
                {columnVisibility.user && (
                  <SortableHeader
                    sortKey="user"
                    activeKey={sortKey}
                    direction={sortDir}
                    onSort={handleSort}
                  >
                    {t('tableUser')}
                  </SortableHeader>
                )}
                {columnVisibility.email && (
                  <SortableHeader
                    sortKey="email"
                    activeKey={sortKey}
                    direction={sortDir}
                    onSort={handleSort}
                    className="hidden md:table-cell"
                  >
                    {t('tableEmail')}
                  </SortableHeader>
                )}
                {columnVisibility.verified && (
                  <SortableHeader
                    sortKey="verified"
                    activeKey={sortKey}
                    direction={sortDir}
                    onSort={handleSort}
                    className="hidden sm:table-cell"
                  >
                    {t('tableVerified')}
                  </SortableHeader>
                )}
                {columnVisibility.role && (
                  <SortableHeader
                    sortKey="role"
                    activeKey={sortKey}
                    direction={sortDir}
                    onSort={handleSort}
                  >
                    {t('tableRole')}
                  </SortableHeader>
                )}
                {columnVisibility.enrolled && (
                  <SortableHeader
                    sortKey="enrolled"
                    activeKey={sortKey}
                    direction={sortDir}
                    onSort={handleSort}
                    className="hidden lg:table-cell"
                  >
                    Enrolled
                  </SortableHeader>
                )}
                {columnVisibility.subscriptions && (
                  <SortableHeader
                    sortKey="subscriptions"
                    activeKey={sortKey}
                    direction={sortDir}
                    onSort={handleSort}
                    className="hidden lg:table-cell"
                  >
                    Subscriptions
                  </SortableHeader>
                )}
                {columnVisibility.githubAccounts && (
                  <SortableHeader
                    sortKey="githubAccounts"
                    activeKey={sortKey}
                    direction={sortDir}
                    onSort={handleSort}
                    className="hidden lg:table-cell"
                  >
                    GitHub
                  </SortableHeader>
                )}
                {columnVisibility.memberSince && (
                  <SortableHeader
                    sortKey="memberSince"
                    activeKey={sortKey}
                    direction={sortDir}
                    onSort={handleSort}
                    className="hidden xl:table-cell"
                  >
                    Member since
                  </SortableHeader>
                )}
                {columnVisibility.actions && (
                  <th className="px-4 py-3 font-semibold text-right text-[color:var(--ai-muted)]">
                    {t('tableActions')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={colspan} className="py-10">
                    <EmptyState
                      icon={<FiUsers size={22} />}
                      title={t('noUsersFound')}
                      description={
                        search || roleFilter || verifiedFilter
                          ? 'Try adjusting your filters'
                          : 'Users will appear here as they register'
                      }
                    />
                  </td>
                </tr>
              ) : (
                paginated.map((user, idx) => {
                  const isSel = selected.has(user.id);
                  const enroll = enrollmentCount(user);
                  return (
                    <ContextMenuTrigger
                      key={user.id}
                      items={() => buildRowMenu(user)}
                      contextLabel={user.displayName || user.email || 'User'}
                    >
                      <motion.tr
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.015 }}
                        className={[
                          'group border-t border-[color:var(--ai-card-border)] transition-colors cursor-pointer',
                          isSel
                            ? 'bg-[color:var(--ai-primary)]/8'
                            : 'hover:bg-[color:var(--ai-primary)]/4',
                        ].join(' ')}
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                      >
                        {columnVisibility.select && (
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              aria-label={`Select ${user.email}`}
                              checked={isSel}
                              onChange={() => toggleSelect(user.id)}
                              className="accent-[color:var(--ai-primary)] cursor-pointer"
                            />
                          </td>
                        )}
                        {columnVisibility.user && (
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar
                                src={user.photoURL || ''}
                                name={user.displayName || user.email}
                                size="sm"
                              />
                              <div className="min-w-0">
                                <div className="font-medium text-[color:var(--ai-foreground)] truncate">
                                  {user.displayName || t('noName')}
                                </div>
                                <div className="md:hidden text-[11px] text-[color:var(--ai-muted)] truncate">
                                  {user.email}
                                </div>
                                <div className="text-[10px] text-[color:var(--ai-muted)] font-mono">
                                  {user.id.substring(0, 10)}…
                                </div>
                              </div>
                            </div>
                          </td>
                        )}
                        {columnVisibility.email && (
                          <td className="px-4 py-3 hidden md:table-cell text-[color:var(--ai-foreground)]/85">
                            {user.email}
                          </td>
                        )}
                        {columnVisibility.verified && (
                          <td className="px-4 py-3 hidden sm:table-cell">
                            {user.emailVerified ? (
                              <Chip color="success" size="sm" variant="flat" className="h-6">
                                {t('verified')}
                              </Chip>
                            ) : (
                              <Chip color="warning" size="sm" variant="flat" className="h-6">
                                {t('notVerified')}
                              </Chip>
                            )}
                          </td>
                        )}
                        {columnVisibility.role && (
                          <td className="px-4 py-3">
                            <Chip
                              color={user.role === 'admin' ? 'primary' : 'default'}
                              variant={user.role === 'admin' ? 'shadow' : 'flat'}
                              size="sm"
                              className="h-6 capitalize"
                            >
                              {user.role || 'user'}
                            </Chip>
                          </td>
                        )}
                        {columnVisibility.enrolled && (
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="inline-flex items-center gap-1 text-[color:var(--ai-foreground)]/80">
                              <FiBookOpen size={12} className="opacity-60" />
                              {enroll}
                            </span>
                          </td>
                        )}
                        {columnVisibility.subscriptions && (
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <CountPill
                              icon={<FiCreditCard size={11} />}
                              healthy={subSummary[user.id]?.active}
                              total={subSummary[user.id]?.total}
                              tooltipUnit="subscription"
                            />
                          </td>
                        )}
                        {columnVisibility.githubAccounts && (
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <CountPill
                              icon={<GitHubIcon size={11} />}
                              healthy={ghSummary[user.id]?.healthy}
                              total={ghSummary[user.id]?.total}
                              tooltipUnit="GitHub account"
                            />
                          </td>
                        )}
                        {columnVisibility.memberSince && (
                          <td className="px-4 py-3 hidden xl:table-cell text-[color:var(--ai-muted)] text-xs">
                            {formatDate(user.createdAt)}
                          </td>
                        )}
                        {columnVisibility.actions && (
                          <td
                            className="px-4 py-3 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center gap-1.5">
                              <Tooltip content={t('assignCourse')} placement="left">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="flat"
                                  color="primary"
                                  aria-label={t('assignCourse')}
                                  onPress={() => openAssign(user)}
                                >
                                  <FiBookOpen size={14} />
                                </Button>
                              </Tooltip>
                              <Button
                                size="sm"
                                variant="light"
                                onPress={() => router.push(`/admin/users/${user.id}`)}
                              >
                                Details
                              </Button>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    </ContextMenuTrigger>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-[color:var(--ai-card-border)] text-xs text-[color:var(--ai-muted)]">
            <span className="flex items-center gap-3 flex-wrap">
              <span>
                Showing <span className="text-[color:var(--ai-foreground)] font-medium">{(page - 1) * pageSize + 1}</span>–
                <span className="text-[color:var(--ai-foreground)] font-medium">{Math.min(page * pageSize, filtered.length)}</span>{' '}
                of <span className="text-[color:var(--ai-foreground)] font-medium">{filtered.length}</span>
              </span>
              <PageSizeSelect
                value={pageSize}
                onChange={handlePageSizeChange}
                options={PAGE_SIZE_OPTIONS}
              />
              <span className="hidden lg:inline opacity-70">
                Tip: right-click a row (or long-press on touch) for quick actions.
              </span>
            </span>
            {totalPages > 1 && (
              <Pagination
                size="sm"
                total={totalPages}
                page={page}
                onChange={setPage}
                showControls
              />
            )}
          </div>
        )}
      </div>

      {/* Assign course modal */}
      <AppModal
        isOpen={assignFor !== null || assignBulk}
        onClose={closeAssign}
        size="md"
        tone="primary"
        icon={<FiBookOpen size={18} />}
        title={t('assignCourse')}
        subtitle={
          assignBulk
            ? `${selected.size} user${selected.size === 1 ? '' : 's'} selected`
            : assignFor?.email
        }
        footer={
          <>
            <Button variant="flat" onPress={closeAssign} isDisabled={assignLoading}>
              {tCommon('buttons.cancel')}
            </Button>
            <Button
              color="primary"
              onPress={handleAssign}
              isLoading={assignLoading}
              isDisabled={!assignCourseId}
              className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white"
            >
              {t('assignCourse')}
            </Button>
          </>
        }
      >
        <p className="text-sm text-[color:var(--ai-muted)] mb-3">{t('grantCourseAccess')}</p>
        <Select
          label={t('selectCourse')}
          placeholder={t('chooseACourse')}
          value={assignCourseId}
          onChange={(e) => setAssignCourseId(e.target.value)}
        >
          {Object.values(courses ?? {}).map((c: Course) => (
            <SelectItem itemKey={c.id} value={c.id} key={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </Select>
        <p className="mt-2 text-xs text-[color:var(--ai-muted)]">
          {t('courseImmediatelyAvailable')}
        </p>
      </AppModal>
    </div>
  );
};

interface MiniStatProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  tone: 'primary' | 'success' | 'warning';
}

const toneClasses: Record<MiniStatProps['tone'], string> = {
  primary: 'text-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10',
  success: 'text-emerald-500 bg-emerald-500/10',
  warning: 'text-amber-500 bg-amber-500/10',
};

const MiniStat: React.FC<MiniStatProps> = ({ label, value, icon, tone }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/70 backdrop-blur-sm px-4 py-3 flex items-center gap-3"
  >
    {icon && (
      <div className={['h-8 w-8 grid place-items-center rounded-lg', toneClasses[tone]].join(' ')}>
        {icon}
      </div>
    )}
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-[color:var(--ai-muted)] font-semibold">{label}</div>
      <div className="text-lg font-bold text-[color:var(--ai-foreground)] leading-tight">{value}</div>
    </div>
  </motion.div>
);

interface CountPillProps {
  icon: React.ReactNode;
  healthy?: number;
  total?: number;
  tooltipUnit: string;
}

const CountPill: React.FC<CountPillProps> = ({ icon, healthy, total, tooltipUnit }) => {
  if (total == null) {
    return <span className="text-[color:var(--ai-muted)]/60 text-xs">—</span>;
  }
  const isHealthy = (healthy ?? 0) > 0;
  const partial = total > 0 && (healthy ?? 0) === 0;
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium tabular-nums',
        isHealthy
          ? 'bg-emerald-500/10 text-emerald-500'
          : partial
            ? 'bg-amber-500/10 text-amber-500'
            : 'bg-[color:var(--ai-card-bg)]/60 text-[color:var(--ai-muted)]',
      ].join(' ')}
      title={`${healthy ?? 0} healthy of ${total} total ${tooltipUnit}${total === 1 ? '' : 's'}`}
    >
      <span className="opacity-70">{icon}</span>
      {healthy ?? 0}/{total}
    </span>
  );
};

interface IconProps { size?: number; className?: string }

const GitHubIcon: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const CopyIcon: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export default AdminUsers;

