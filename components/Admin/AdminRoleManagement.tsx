'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  useDisclosure,
  Select,
  SelectItem,
} from '@heroui/react';
import { AppContext } from '../AppContext';
import {
  UserRole,
  updateUserRole,
  getAdminUsers,
  hasPermission,
} from '../../utils/firebase/adminAuth';
import { UserProfile } from '../../types/index.d';
import { motion } from 'framer-motion';
import { AppModal, DataTable, type DataTableColumn } from '@/components/shared/ui';

interface AdminRoleManagementProps {
  className?: string;
}

export default function AdminRoleManagement({ className }: AdminRoleManagementProps) {
  const t = useTranslations('admin');
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('AdminRoleManagement must be used within AppContextProvider');
  }

  const { userProfile, user } = context;
  const [adminUsers, setAdminUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<UserRole>(UserRole.USER);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Check if current user can manage roles
  const canManageRoles = hasPermission(userProfile, 'canManageUsers');

  useEffect(() => {
    loadAdminUsers();
  }, []);

  const loadAdminUsers = async () => {
    try {
      setLoading(true);
      const users = await getAdminUsers();
      setAdminUsers(users);
    } catch (error) {
      console.error('Error loading admin users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !userProfile) return;

    try {
      await updateUserRole(selectedUser.id, newRole, userProfile);
      await loadAdminUsers(); // Refresh the list
      onClose();
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      // Could add toast notification here
    }
  };

  const openRoleChangeModal = (user: UserProfile) => {
    setSelectedUser(user);
    setNewRole(user.role);
    onOpen();
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'danger';
      case UserRole.ADMIN:
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRoleText = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return t('roleManagement.roles.superAdmin');
      case UserRole.ADMIN:
        return t('roleManagement.roles.admin');
      default:
        return t('roleManagement.roles.user');
    }
  };

  if (!canManageRoles) {
    return (
      <Card className={className}>
        <CardBody>
          <p className="text-center text-[color:var(--ai-muted-foreground)]">
            {t('roleManagement.permissions.noPermission')}
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={className}
      >
        <Card>
          <CardHeader className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Admin Role Management</h3>
              <p className="text-sm text-[color:var(--ai-muted-foreground)]">
                Manage administrative roles and permissions
              </p>
            </div>
            <Button color="primary" variant="flat" onPress={loadAdminUsers} isLoading={loading}>
              Refresh
            </Button>
          </CardHeader>
          <CardBody>
            <DataTable<UserProfile>
              data={adminUsers}
              rowKey={(u) => u.id}
              isLoading={loading}
              loadingRows={4}
              columns={[
                {
                  key: 'user',
                  header: 'User',
                  cell: (u) => (
                    <div>
                      <p className="font-semibold text-[color:var(--ai-foreground)]">
                        {u.displayName || 'No name'}
                      </p>
                      <p className="text-xs text-[color:var(--ai-muted)]">
                        Created:{' '}
                        {u.createdAt instanceof Date
                          ? u.createdAt.toLocaleDateString()
                          : new Date((u.createdAt as any).seconds * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  ),
                  sortAccessor: (u) => u.displayName || '',
                },
                {
                  key: 'email',
                  header: 'Email',
                  responsiveFrom: 'md',
                  cell: (u) => <span className="text-sm">{u.email}</span>,
                  sortAccessor: (u) => u.email || '',
                },
                {
                  key: 'role',
                  header: 'Role',
                  cell: (u) => (
                    <Chip color={getRoleColor(u.role)} variant="flat" size="sm">
                      {getRoleText(u.role)}
                    </Chip>
                  ),
                  sortAccessor: (u) => u.role,
                },
                {
                  key: 'status',
                  header: 'Status',
                  cell: (u) => (
                    <Chip color={u.isActive ? 'success' : 'danger'} variant="flat" size="sm">
                      {u.isActive ? 'Active' : 'Inactive'}
                    </Chip>
                  ),
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  align: 'right',
                  cell: (u) => (
                    <Button
                      size="sm"
                      variant="flat"
                      color="warning"
                      onPress={() => openRoleChangeModal(u)}
                      isDisabled={u.id === user?.uid}
                    >
                      Change role
                    </Button>
                  ),
                },
              ] as DataTableColumn<UserProfile>[]}
              emptyState={
                <p className="text-[color:var(--ai-muted)]">No admin users found.</p>
              }
            />
          </CardBody>
        </Card>
      </motion.div>

      {/* Role Change Modal */}
      <AppModal
        isOpen={isOpen}
        onClose={onClose}
        size="md"
        tone="warning"
        icon={<span className="text-xl">🛡️</span>}
        title="Change user role"
        subtitle={selectedUser?.email}
        footer={
          <>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleRoleChange}
              isDisabled={!newRole || newRole === selectedUser?.role}
            >
              Update role
            </Button>
          </>
        }
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-background)]/50 p-3 text-sm space-y-1">
              <p>
                <span className="text-[color:var(--ai-muted)]">User:</span>{' '}
                <strong>{selectedUser.displayName || 'No name'}</strong>
              </p>
              <p>
                <span className="text-[color:var(--ai-muted)]">Email:</span>{' '}
                {selectedUser.email}
              </p>
              <p>
                <span className="text-[color:var(--ai-muted)]">Current role:</span>{' '}
                <Chip color={getRoleColor(selectedUser.role)} size="sm" variant="flat">
                  {getRoleText(selectedUser.role)}
                </Chip>
              </p>
            </div>
            <Select
              label="New role"
              placeholder="Select a role"
              selectedKeys={[newRole]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as UserRole;
                setNewRole(selected);
              }}
            >
              <SelectItem key={UserRole.USER}>User</SelectItem>
              <SelectItem key={UserRole.ADMIN}>Admin</SelectItem>
              <SelectItem key={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
            </Select>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-300">
              ⚠ Changing user roles will affect their permissions immediately. Make sure you understand the implications.
            </div>
          </div>
        )}
      </AppModal>
    </>
  );
}
