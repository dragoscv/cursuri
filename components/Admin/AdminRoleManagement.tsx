'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
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
            <Table aria-label="Admin users table">
              <TableHeader>
                <TableColumn>USER</TableColumn>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody isLoading={loading} loadingContent="Loading admin users...">
                {' '}
                {adminUsers.map((adminUser) => (
                  <TableRow key={adminUser.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{adminUser.displayName || 'No name'}</p>
                        <p className="text-sm text-[color:var(--ai-muted-foreground)]">
                          Created:{' '}
                          {adminUser.createdAt instanceof Date
                            ? adminUser.createdAt.toLocaleDateString()
                            : new Date(adminUser.createdAt.seconds * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{adminUser.email}</TableCell>
                    <TableCell>
                      <Chip color={getRoleColor(adminUser.role)} variant="flat">
                        {getRoleText(adminUser.role)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip color={adminUser.isActive ? 'success' : 'danger'} variant="flat">
                        {adminUser.isActive ? 'Active' : 'Inactive'}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="flat"
                          color="warning"
                          onPress={() => openRoleChangeModal(adminUser)}
                          isDisabled={adminUser.id === user?.uid} // Can't change own role
                        >
                          Change Role
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {adminUsers.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-[color:var(--ai-muted-foreground)]">No admin users found.</p>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Role Change Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Change User Role</ModalHeader>
          <ModalBody>
            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <p>
                    <strong>User:</strong> {selectedUser.displayName || 'No name'}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedUser.email}
                  </p>
                  <p>
                    <strong>Current Role:</strong> {getRoleText(selectedUser.role)}
                  </p>
                </div>
                <Select
                  label="New Role"
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

                <div className="bg-warning-50 p-3 rounded-lg">
                  <p className="text-sm text-warning-700">
                    <strong>Warning:</strong> Changing user roles will affect their permissions
                    immediately. Make sure you understand the implications of this change.
                  </p>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleRoleChange}
              isDisabled={!newRole || newRole === selectedUser?.role}
            >
              Update Role
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
