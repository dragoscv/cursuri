'use client';

import React, { useContext, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Input,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/react';
import { AppContext } from '@/components/AppContext';
import { Course, UserProfile } from '@/types';

const AdminUsers: React.FC = () => {
  const t = useTranslations('admin.users');
  const tCommon = useTranslations('common');
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('AdminUsers must be used within an AppProvider');
  }

  const { users, getAllUsers, courses, assignCourseToUser } = context;
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState<boolean>(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [assignLoading, setAssignLoading] = useState<boolean>(false);
  const [assignSuccess, setAssignSuccess] = useState<boolean>(false);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        if (getAllUsers) {
          await getAllUsers();
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(t('failedToLoad'));
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [getAllUsers]);

  const filteredUsers = users
    ? Object.values(users).filter(
      (user) =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  const paginatedUsers = filteredUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  const handleAssignCourse = async () => {
    if (!selectedUser || !selectedCourseId || !assignCourseToUser) return;

    setAssignLoading(true);
    try {
      const result = await assignCourseToUser(selectedUser.id, selectedCourseId);
      if (result) {
        setAssignSuccess(true);
        // Reset success message after 3 seconds
        setTimeout(() => {
          setAssignSuccess(false);
        }, 3000);
      } else {
        setError('Failed to assign course');
      }
    } catch (error) {
      console.error('Error assigning course:', error);
      setError('An error occurred while assigning the course');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRowClick = (user: UserProfile) => {
    setSelectedUser(user);
  };

  const closeModal = () => {
    setSelectedUser(null);
  };

  const openAssignCourseModal = () => {
    setAssignModalOpen(true);
  };

  const closeAssignCourseModal = () => {
    setAssignModalOpen(false);
    setSelectedCourseId('');
    setAssignSuccess(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-[color:var(--ai-danger)] mb-4">{error}</h2>
        <p className="text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
          {tCommon('notifications.error.genericError')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">{t('title')}</h1>

        <div className="w-full md:w-80">
          <Input
            placeholder={t('searchUsers')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            startContent={
              <svg
                className="text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted)] h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          />
        </div>
      </div>

      <Card className="shadow-md">
        <CardBody>
          <Table aria-label="Users table">
            <TableHeader>
              <TableColumn>{t('tableUser')}</TableColumn>
              <TableColumn>{t('tableEmail')}</TableColumn>
              <TableColumn>{t('tableVerified')}</TableColumn>
              <TableColumn>{t('tableRole')}</TableColumn>
              <TableColumn>{t('tableActions')}</TableColumn>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer"
                    onClick={() => handleRowClick(user)}
                  >
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar
                          src={user.photoURL || ''}
                          name={user.displayName || user.email}
                          className="mr-3"
                        />
                        <div>
                          <p className="font-medium">{user.displayName || t('noName')}</p>
                          <p className="text-xs text-[color:var(--ai-muted-foreground)]">
                            ID: {user.id.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.emailVerified ? (
                        <Chip color="success" size="sm">
                          {t('verified')}
                        </Chip>
                      ) : (
                        <Chip color="warning" size="sm">
                          {t('notVerified')}
                        </Chip>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip color={user.role === 'admin' ? 'primary' : 'default'} size="sm">
                        {user.role || 'user'}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(user);
                          openAssignCourseModal();
                        }}
                      >
                        {t('assignCourse')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                      {t('noUsersFound')}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination total={totalPages} initialPage={1} page={page} onChange={setPage} />
            </div>
          )}
        </CardBody>
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser && !assignModalOpen}
          onClose={closeModal}
          size="lg"
          backdrop="blur"
          className="z-50"
          motionProps={{
            variants: {
              enter: {
                y: 0,
                opacity: 1,
                transition: {
                  duration: 0.3,
                  ease: 'easeOut',
                },
              },
              exit: {
                y: -20,
                opacity: 0,
                transition: {
                  duration: 0.2,
                  ease: 'easeIn',
                },
              },
            },
          }}
        >
          {' '}
          <ModalContent className="overflow-hidden dark:bg-[color:var(--ai-card-bg)]/95 border border-primary-200/20 dark:border-[color:var(--ai-card-border)] shadow-xl">
            {() => (
              <>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 blur-xl opacity-80 -z-10"></div>
                  <ModalHeader className="border-b border-primary-100 dark:border-[color:var(--ai-card-border)] text-primary-900 dark:text-primary-100">
                    {t('userDetails')}
                  </ModalHeader>
                  <ModalBody className="py-6">
                    <div className="flex items-center mb-6">
                      <Avatar
                        src={selectedUser.photoURL || ''}
                        name={selectedUser.displayName || selectedUser.email}
                        className="mr-4"
                        size="lg"
                      />
                      <div>
                        <h2 className="text-2xl font-bold text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)]">
                          {selectedUser.displayName || t('noName')}
                        </h2>
                        <p className="text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                          {selectedUser.email}
                        </p>
                        <div className="flex mt-2">
                          <Chip
                            color={selectedUser.role === 'admin' ? 'primary' : 'default'}
                            size="sm"
                            className="mr-2"
                          >
                            {selectedUser.role || 'user'}
                          </Chip>
                          {selectedUser.emailVerified ? (
                            <Chip color="success" size="sm">
                              {t('verified')}
                            </Chip>
                          ) : (
                            <Chip color="warning" size="sm">
                              {t('notVerified')}
                            </Chip>
                          )}
                        </div>
                      </div>
                    </div>

                    <Divider className="my-4" />

                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2 text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)]">
                        {t('accountDetails')}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 bg-[color:var(--ai-card-bg)]/80 dark:bg-[color:var(--ai-card-border)]/50 p-4 rounded-xl backdrop-blur-sm">
                        <div>
                          <p className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                            {t('userId')}
                          </p>
                          <p className="font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)]">
                            {selectedUser.id}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                            {t('createdOn')}
                          </p>
                          <p className="font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)]">
                            {selectedUser.createdAt
                              ? typeof selectedUser.createdAt === 'object' &&
                                'seconds' in selectedUser.createdAt
                                ? new Date(
                                  selectedUser.createdAt.seconds * 1000
                                ).toLocaleDateString()
                                : new Date(selectedUser.createdAt).toLocaleDateString()
                              : 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)]">
                          {t('enrolledCourses')}
                        </h3>{' '}
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={openAssignCourseModal}
                          className="text-sm font-medium text-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10 hover:bg-[color:var(--ai-primary)]/20"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {t('addCourse')}
                        </Button>
                      </div>
                      {selectedUser.enrollments &&
                        Object.keys(selectedUser.enrollments).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(selectedUser.enrollments).map(
                            ([courseId, enrollment]) => {
                              const course = courses[courseId];
                              return (
                                <div
                                  key={courseId}
                                  className="flex justify-between items-center p-4 bg-[color:var(--ai-card-bg)]/80 dark:bg-[color:var(--ai-card-border)]/50 rounded-xl border border-primary-100 dark:border-[color:var(--ai-card-border)] backdrop-blur-sm"
                                >
                                  <div>
                                    <p className="font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)]">
                                      {course?.name || 'Unknown Course'}
                                    </p>
                                    <p className="text-xs text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                                      Enrolled:{' '}
                                      {enrollment.enrolledAt
                                        ? typeof enrollment.enrolledAt === 'object' &&
                                          'seconds' in enrollment.enrolledAt
                                          ? new Date(
                                            enrollment.enrolledAt.seconds * 1000
                                          ).toLocaleDateString()
                                          : new Date(enrollment.enrolledAt).toLocaleDateString()
                                        : 'Unknown date'}
                                    </p>
                                  </div>
                                  <div>
                                    <Chip
                                      color={enrollment.source === 'admin' ? 'primary' : 'success'}
                                      size="sm"
                                      className="animate-fadeIn"
                                    >
                                      {enrollment.source === 'admin'
                                        ? t('assigned')
                                        : t('purchased')}
                                    </Chip>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-[color:var(--ai-card-bg)]/80 dark:bg-[color:var(--ai-card-border)]/50 rounded-xl border border-dashed border-primary-200 dark:border-[color:var(--ai-card-border)] backdrop-blur-sm">
                          <svg
                            className="mx-auto h-12 w-12 text-[color:var(--ai-muted-foreground)]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                          <p className="mt-2 text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                            {t('noEnrolledCourses')}
                          </p>{' '}
                          <Button
                            color="primary"
                            variant="flat"
                            size="sm"
                            className="mt-4 font-medium text-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10 hover:bg-[color:var(--ai-primary)]/20"
                            onPress={openAssignCourseModal}
                          >
                            {t('assignFirstCourse')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </ModalBody>
                  <ModalFooter className="border-t border-primary-100 dark:border-[color:var(--ai-card-border)]">
                    {' '}
                    <Button
                      color="default"
                      onPress={closeModal}
                      className="font-medium text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-card-border)]/20"
                    >
                      {tCommon('buttons.close')}
                    </Button>
                    <Button
                      color="primary"
                      variant="flat"
                      onPress={openAssignCourseModal}
                      className="font-medium text-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10 hover:bg-[color:var(--ai-primary)]/20"
                    >
                      {t('assignCourse')}
                    </Button>
                  </ModalFooter>
                </div>
              </>
            )}
          </ModalContent>
        </Modal>
      )}

      {/* Assign Course Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={closeAssignCourseModal}
        size="md"
        backdrop="blur"
        className="z-50"
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: 'easeOut',
              },
            },
            exit: {
              y: -20,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: 'easeIn',
              },
            },
          },
        }}
      >
        {' '}
        <ModalContent className="overflow-hidden dark:bg-[color:var(--ai-card-bg)]/95 border border-primary-200/20 dark:border-[color:var(--ai-card-border)] shadow-xl">
          {() => (
            <>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 blur-xl opacity-80 -z-10"></div>
                <ModalHeader className="flex flex-col gap-1 border-b border-primary-100 dark:border-[color:var(--ai-card-border)]">
                  <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-primary-500 to-secondary-500 p-2 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
                      {t('assignCourse')}
                    </span>
                  </div>
                  <p className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                    {t('grantCourseAccess')}
                  </p>
                </ModalHeader>
                <ModalBody className="py-6">
                  {assignSuccess ? (
                    <div className="text-center py-6 px-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-5">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)] mb-2">
                        {t('courseAssignedSuccess')}
                      </h3>
                      <p className="text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                        {t('courseAssignedTo', {
                          name: selectedUser?.displayName || selectedUser?.email || 'User',
                        })}
                      </p>
                      <div className="mt-6">
                        {' '}
                        <Button
                          color="primary"
                          className="w-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium shadow-sm hover:shadow-md hover:shadow-[color:var(--ai-primary)]/20 transition-all"
                          onPress={closeAssignCourseModal}
                        >
                          {tCommon('buttons.close')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {selectedUser && (
                        <div className="mb-6 bg-[color:var(--ai-card-bg)]/80 dark:bg-[color:var(--ai-card-border)]/50 p-4 rounded-xl backdrop-blur-sm">
                          <p className="text-sm font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)] mb-2">
                            {t('assigningCourseTo')}
                          </p>
                          <div className="flex items-center">
                            <Avatar
                              src={selectedUser.photoURL || ''}
                              name={selectedUser.displayName || selectedUser.email}
                              className="mr-3"
                              size="md"
                            />
                            <div>
                              <p className="font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)]">
                                {selectedUser.displayName || t('noName')}
                              </p>
                              <p className="text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                                {selectedUser.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mb-2">
                        <label className="block text-sm font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)] mb-2">
                          {t('selectCourse')}
                        </label>
                        <select
                          value={selectedCourseId}
                          onChange={(e) => setSelectedCourseId(e.target.value)}
                          className="w-full h-12 px-4 rounded-lg bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-border)] border border-primary-200 dark:border-[color:var(--ai-card-border)] text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)] focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer"
                        >
                          <option value="">{t('chooseACourse')}</option>
                          {Object.values(courses).map((course: Course) => (
                            <option key={course.id} value={course.id}>
                              {course.name}
                            </option>
                          ))}
                        </select>
                        <p className="mt-2 text-xs text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                          {t('courseImmediatelyAvailable')}
                        </p>
                      </div>
                    </>
                  )}
                </ModalBody>
                {!assignSuccess && (
                  <ModalFooter className="border-t border-primary-100 dark:border-[color:var(--ai-card-border)]">
                    {' '}
                    <Button
                      color="default"
                      variant="light"
                      onPress={closeAssignCourseModal}
                      className="font-medium text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-card-border)]/20"
                    >
                      {tCommon('buttons.cancel')}
                    </Button>
                    <Button
                      color="primary"
                      isDisabled={!selectedCourseId || assignLoading}
                      isLoading={assignLoading}
                      onPress={handleAssignCourse}
                      className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium shadow-sm hover:shadow-md hover:shadow-[color:var(--ai-primary)]/20 transition-all"
                    >
                      {t('assignCourse')}
                    </Button>
                  </ModalFooter>
                )}
              </div>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AdminUsers;
