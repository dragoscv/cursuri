'use client';

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Avatar,
  Button,
  Chip,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Tooltip,
} from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';

import { AppContext } from '@/components/AppContext';
import { Course, UserProfile } from '@/types';
import { useToast } from '@/components/Toast/ToastContext';
import { DataToolbar, EmptyState } from '@/components/Admin/shell';
import {
  FiUsers,
  FiCheckCircle,
  FiX,
  FiBookOpen,
} from '@/components/icons/FeatherIcons';
import { IconBolt } from '@/components/Admin/shell/icons';

const ROWS_PER_PAGE = 12;

type RoleFilter = 'all' | 'admin' | 'instructor' | 'user';
type VerifiedFilter = 'all' | 'verified' | 'unverified';
type SortKey = 'newest' | 'oldest' | 'name' | 'email' | 'enrollments';

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
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<VerifiedFilter>('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  const allUsers = useMemo<UserProfile[]>(
    () => (users ? Object.values(users) : []),
    [users]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allUsers
      .filter((u) => {
        if (q && !(u.email?.toLowerCase().includes(q) || u.displayName?.toLowerCase().includes(q) || u.id.toLowerCase().includes(q))) {
          return false;
        }
        if (roleFilter !== 'all') {
          const role = (u.role || 'user') as string;
          if (role !== roleFilter) return false;
        }
        if (verifiedFilter === 'verified' && !u.emailVerified) return false;
        if (verifiedFilter === 'unverified' && u.emailVerified) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sort) {
          case 'name':
            return (a.displayName || a.email || '').localeCompare(b.displayName || b.email || '');
          case 'email':
            return (a.email || '').localeCompare(b.email || '');
          case 'enrollments':
            return enrollmentCount(b) - enrollmentCount(a);
          case 'oldest':
          case 'newest': {
            const da = a.createdAt
              ? typeof a.createdAt === 'object' && 'seconds' in a.createdAt
                ? a.createdAt.seconds
                : new Date(a.createdAt as any).getTime() / 1000
              : 0;
            const db = b.createdAt
              ? typeof b.createdAt === 'object' && 'seconds' in b.createdAt
                ? b.createdAt.seconds
                : new Date(b.createdAt as any).getTime() / 1000
              : 0;
            return sort === 'newest' ? db - da : da - db;
          }
          default:
            return 0;
        }
      });
  }, [allUsers, search, roleFilter, verifiedFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  // reset paging on filter change
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, verifiedFilter, sort]);

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
            <Select
              aria-label="Filter by role"
              size="sm"
              variant="flat"
              className="min-w-[140px]"
              selectedKeys={[roleFilter]}
              onSelectionChange={(keys) =>
                setRoleFilter(Array.from(keys)[0] as RoleFilter)
              }
            >
              <SelectItem key="all">All roles</SelectItem>
              <SelectItem key="admin">Admin</SelectItem>
              <SelectItem key="instructor">Instructor</SelectItem>
              <SelectItem key="user">User</SelectItem>
            </Select>
            <Select
              aria-label="Filter by verification"
              size="sm"
              variant="flat"
              className="min-w-[160px]"
              selectedKeys={[verifiedFilter]}
              onSelectionChange={(keys) =>
                setVerifiedFilter(Array.from(keys)[0] as VerifiedFilter)
              }
            >
              <SelectItem key="all">All statuses</SelectItem>
              <SelectItem key="verified">{t('verified')}</SelectItem>
              <SelectItem key="unverified">{t('notVerified')}</SelectItem>
            </Select>
            <Select
              aria-label="Sort by"
              size="sm"
              variant="flat"
              className="min-w-[150px]"
              selectedKeys={[sort]}
              onSelectionChange={(keys) =>
                setSort(Array.from(keys)[0] as SortKey)
              }
            >
              <SelectItem key="newest">Newest first</SelectItem>
              <SelectItem key="oldest">Oldest first</SelectItem>
              <SelectItem key="name">Name (A→Z)</SelectItem>
              <SelectItem key="email">Email (A→Z)</SelectItem>
              <SelectItem key="enrollments">Most enrollments</SelectItem>
            </Select>
          </>
        }
      />

      {/* Table */}
      <div className="rounded-2xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/70 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-[color:var(--ai-muted)] bg-[color:var(--ai-background)]/40">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all on page"
                    checked={allOnPageSelected}
                    onChange={toggleSelectAllOnPage}
                    className="accent-[color:var(--ai-primary)] cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 font-semibold">{t('tableUser')}</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">{t('tableEmail')}</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">{t('tableVerified')}</th>
                <th className="px-4 py-3 font-semibold">{t('tableRole')}</th>
                <th className="px-4 py-3 font-semibold hidden lg:table-cell">Enrolled</th>
                <th className="px-4 py-3 font-semibold hidden xl:table-cell">Member since</th>
                <th className="px-4 py-3 font-semibold text-right">{t('tableActions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10">
                    <EmptyState
                      icon={<FiUsers size={22} />}
                      title={t('noUsersFound')}
                      description={
                        search || roleFilter !== 'all' || verifiedFilter !== 'all'
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
                    <motion.tr
                      key={user.id}
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
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          aria-label={`Select ${user.email}`}
                          checked={isSel}
                          onChange={() => toggleSelect(user.id)}
                          className="accent-[color:var(--ai-primary)] cursor-pointer"
                        />
                      </td>
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
                      <td className="px-4 py-3 hidden md:table-cell text-[color:var(--ai-foreground)]/85">
                        {user.email}
                      </td>
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
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="inline-flex items-center gap-1 text-[color:var(--ai-foreground)]/80">
                          <FiBookOpen size={12} className="opacity-60" />
                          {enroll}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell text-[color:var(--ai-muted)] text-xs">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
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
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[color:var(--ai-card-border)] text-xs text-[color:var(--ai-muted)]">
            <span>
              Showing <span className="text-[color:var(--ai-foreground)] font-medium">{(page - 1) * ROWS_PER_PAGE + 1}</span>–
              <span className="text-[color:var(--ai-foreground)] font-medium">{Math.min(page * ROWS_PER_PAGE, filtered.length)}</span>{' '}
              of <span className="text-[color:var(--ai-foreground)] font-medium">{filtered.length}</span>
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
      <Modal
        isOpen={assignFor !== null || assignBulk}
        onClose={closeAssign}
        size="md"
        backdrop="blur"
        placement="center"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex items-center gap-3">
                <div className="h-10 w-10 grid place-items-center rounded-xl bg-gradient-to-br from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white shadow-md">
                  <FiBookOpen size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-base font-semibold">{t('assignCourse')}</div>
                  <div className="text-xs text-[color:var(--ai-muted)] truncate">
                    {assignBulk
                      ? `${selected.size} user${selected.size === 1 ? '' : 's'} selected`
                      : assignFor?.email}
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                <p className="text-sm text-[color:var(--ai-muted)] mb-3">{t('grantCourseAccess')}</p>
                <Select
                  label={t('selectCourse')}
                  placeholder={t('chooseACourse')}
                  selectedKeys={assignCourseId ? [assignCourseId] : []}
                  onSelectionChange={(keys) =>
                    setAssignCourseId(Array.from(keys)[0] as string)
                  }
                >
                  {Object.values(courses ?? {}).map((c: Course) => (
                    <SelectItem key={c.id}>{c.name}</SelectItem>
                  ))}
                </Select>
                <p className="mt-2 text-xs text-[color:var(--ai-muted)]">
                  {t('courseImmediatelyAvailable')}
                </p>
              </ModalBody>
              <ModalFooter>
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
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
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

export default AdminUsers;
