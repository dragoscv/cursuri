'use client'

import React, { useContext, useEffect, useState } from 'react';
import { Avatar, Button, Card, CardBody, Chip, Input, Spinner, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, Tabs, Tab } from '@heroui/react';
import SelectItem from '@/components/ui/SelectItem';
import { AppContext } from '@/components/AppContext';
import { UserProfile } from '@/types';
import { UserRole } from '@/utils/firebase/adminAuth';
import { firebaseApp } from '@/utils/firebase/firebase.config';
import { getFirestore, collection, doc, updateDoc, setDoc, Timestamp, getDocs } from 'firebase/firestore';

// Enhanced user management with a more detailed view and activity logs
const EnhancedUserManagement: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("EnhancedUserManagement must be used within an AppProvider");
  }

  const { users, getAllUsers, courses } = context;
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedUserData, setEditedUserData] = useState<Partial<UserProfile>>({});
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [userNotes, setUserNotes] = useState<string>('');
  const rowsPerPage = 10;

  // Tab state for user details view
  const [selectedTab, setSelectedTab] = useState<string>("profile");

  // Custom filters for user management
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<string>('all');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        if (getAllUsers) {
          await getAllUsers();
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [getAllUsers]);

  // Filtered and sorted users
  const filteredUsers = users ?
    Object.values(users)
      .filter(user => {
        // Text search filter
        const textMatch =
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.displayName?.toLowerCase().includes(searchTerm.toLowerCase());

        // Role filter
        const roleMatch = userRoleFilter === 'all' || user.role === userRoleFilter;

        // Verification filter
        const verificationMatch =
          verificationFilter === 'all' ||
          (verificationFilter === 'verified' && user.emailVerified) ||
          (verificationFilter === 'unverified' && !user.emailVerified);

        // Activity filter (simplified for demo - in real app would check actual activity)
        const activityMatch =
          activityFilter === 'all' ||
          (activityFilter === 'active' && Object.keys(user.enrollments || {}).length > 0) ||
          (activityFilter === 'inactive' && Object.keys(user.enrollments || {}).length === 0);

        return textMatch && roleMatch && verificationMatch && activityMatch;
      })
      .sort((a, b) => {
        // Convert timestamps to dates for comparison
        const getDateValue = (user: UserProfile, field: string) => {
          if (field === 'createdAt') {
            const createdAt = user.createdAt;
            if (typeof createdAt === 'object' && 'seconds' in createdAt) {
              return new Date(createdAt.seconds * 1000);
            }
            return new Date(createdAt || 0);
          }
          return user.displayName || user.email || '';
        };

        const valueA = getDateValue(a, sortBy);
        const valueB = getDateValue(b, sortBy);

        if (sortDirection === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      }) : [];

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  const handleUserDetailsEdit = () => {
    setEditMode(true);
    if (selectedUser) {
      setEditedUserData({
        displayName: selectedUser.displayName,
        role: selectedUser.role,
        bio: selectedUser.bio,
      });
    }
  };

  const handleUserDetailsSave = async () => {
    if (!selectedUser) return;

    try {
      const db = getFirestore(firebaseApp);
      const userRef = doc(db, `users/${selectedUser.id}`);

      await updateDoc(userRef, {
        ...editedUserData,
        updatedAt: Timestamp.now()
      });

      // Update local state
      setSelectedUser({
        ...selectedUser,
        ...editedUserData,
        updatedAt: Timestamp.now()
      });

      setEditMode(false);
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditedUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotesChange = async (notes: string) => {
    if (!selectedUser) return;

    try {
      const db = getFirestore(firebaseApp);
      const notesRef = doc(db, `users/${selectedUser.id}/metadata/notes`);

      await setDoc(notesRef, {
        content: notes,
        updatedAt: Timestamp.now()
      });

      setUserNotes(notes);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };
  const loadUserNotes = async (userId: string) => {
    try {
      const db = getFirestore(firebaseApp);
      const notesDoc = await getDocs(collection(db, `users/${userId}/metadata`));

      notesDoc.forEach(doc => {
        if (doc.id === 'notes') {
          setUserNotes(doc.data().content || '');
        }
      });
    } catch (error) {
      console.error('Error loading notes:', error);
      setUserNotes('');
    }
  };

  const handleRowClick = (user: UserProfile) => {
    setSelectedUser(user);
    setSelectedTab("profile");
    loadUserNotes(user.id);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setEditMode(false);
    setEditedUserData({});
    setUserNotes('');
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
        <h2 className="text-2xl font-bold text-red-500 mb-4">{error}</h2>
        <p className="text-gray-600 dark:text-gray-400">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Enhanced User Management</h1>

        <div className="w-full md:w-80">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            startContent={
              <svg className="text-gray-400 dark:text-gray-600 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Filters card */}
      <Card className="shadow-md">
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Role
              </label>
              <Select
                value={userRoleFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setUserRoleFilter(e.target.value)}
                className="w-full"
              >
                <SelectItem key="all" value="all" textValue="all">All Roles</SelectItem>
                <SelectItem key="user" value="user" textValue="user">Regular Users</SelectItem>
                <SelectItem key="admin" value="admin" textValue="admin">Administrators</SelectItem>
                <SelectItem key="instructor" value="instructor" textValue="instructor">Instructors</SelectItem>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Verification
              </label>              <Select
                value={verificationFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVerificationFilter(e.target.value)}
                className="w-full"
              >
                <SelectItem key="all" value="all" textValue="all">All Users</SelectItem>
                <SelectItem key="verified" value="verified" textValue="verified">Verified</SelectItem>
                <SelectItem key="unverified" value="unverified" textValue="unverified">Unverified</SelectItem>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Activity
              </label>              <Select
                value={activityFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setActivityFilter(e.target.value)}
                className="w-full"
              >
                <SelectItem key="all" value="all" textValue="all">All Users</SelectItem>
                <SelectItem key="active" value="active" textValue="active">Active (Enrolled)</SelectItem>
                <SelectItem key="inactive" value="inactive" textValue="inactive">Inactive (No Enrollments)</SelectItem>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <div className="flex gap-2">                <Select
                value={sortBy}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)}
                className="flex-1"
              >
                <SelectItem key="createdAt" value="createdAt" textValue="createdAt">Registration Date</SelectItem>
                <SelectItem key="displayName" value="displayName" textValue="displayName">Name</SelectItem>
              </Select>
                <Button
                  onPress={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  className="p-2"
                  aria-label="Toggle sort direction"
                >
                  {sortDirection === 'asc' ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                    </svg>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Users table */}
      <Card className="shadow-md">
        <CardBody>
          <Table aria-label="Enhanced users table">
            <TableHeader>
              <TableColumn>USER</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>VERIFICATION</TableColumn>
              <TableColumn>ENROLLMENT</TableColumn>
              <TableColumn>REGISTRATION</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => handleRowClick(user)}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar src={user.photoURL || ""} name={user.displayName || user.email} className="mr-3" />
                        <div>
                          <p className="font-medium">{user.displayName || 'No Name'}</p>
                          <p className="text-xs text-gray-500">ID: {user.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>                      <Chip color={user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN ? 'primary' : 'default'} size="sm">
                      {user.role || UserRole.USER}
                    </Chip>
                    </TableCell>
                    <TableCell>
                      {user.emailVerified ? (
                        <Chip color="success" size="sm">Verified</Chip>
                      ) : (
                        <Chip color="warning" size="sm">Not Verified</Chip>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.enrollments && Object.keys(user.enrollments).length > 0 ? (
                        <Chip color="success" size="sm">{Object.keys(user.enrollments).length} Courses</Chip>
                      ) : (
                        <Chip color="default" size="sm">No Enrollments</Chip>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.createdAt ?
                        (typeof user.createdAt === 'object' && 'seconds' in user.createdAt
                          ? new Date(user.createdAt.seconds * 1000).toLocaleDateString()
                          : new Date(user.createdAt).toLocaleDateString())
                        : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(user);
                        }}
                        className="font-medium text-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10 hover:bg-[color:var(--ai-primary)]/20"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No users found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                total={totalPages}
                initialPage={1}
                page={page}
                onChange={setPage}
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* User Details Modal with Tabs */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={closeModal}
          size="2xl"
          backdrop="blur"
          className="z-50"
          scrollBehavior="inside"
        >          <ModalContent className="overflow-hidden dark:bg-gray-900/95 border border-primary-200/20 dark:border-gray-800 shadow-xl">
            {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
            {(_onClose) => (
              <>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 blur-xl opacity-80 -z-10"></div>
                  <ModalHeader className="border-b border-primary-100 dark:border-gray-800 text-primary-900 dark:text-primary-100">
                    <div className="flex items-center">
                      <Avatar
                        src={selectedUser.photoURL || ""}
                        name={selectedUser.displayName || selectedUser.email}
                        className="mr-3"
                        size="lg"
                      />
                      <div>
                        <h2 className="text-xl font-bold">{selectedUser.displayName || selectedUser.email}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                      </div>
                    </div>
                  </ModalHeader>

                  <div className="border-b border-primary-100 dark:border-gray-800">
                    <Tabs
                      aria-label="User details tabs"
                      selectedKey={selectedTab}
                      onSelectionChange={(key) => setSelectedTab(key as string)}
                      variant="underlined"
                      classNames={{
                        tab: "py-3 px-4 font-medium",
                        tabList: "px-4",
                        cursor: "bg-primary-500",
                      }}
                    >
                      <Tab key="profile" title="Profile" />
                      <Tab key="enrollments" title="Enrollments" />
                      <Tab key="notes" title="Admin Notes" />
                      <Tab key="activity" title="Activity Log" />
                      <Tab key="permissions" title="Permissions" />
                    </Tabs>
                  </div>

                  <ModalBody className="py-6">
                    {/* Profile Tab */}
                    {selectedTab === "profile" && (
                      <div className="space-y-6">
                        {editMode ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Display Name
                              </label>
                              <Input
                                name="displayName"
                                value={editedUserData.displayName || ''}
                                onChange={handleInputChange}
                                placeholder="Display Name"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Bio
                              </label>
                              <textarea
                                name="bio"
                                value={editedUserData.bio || ''}
                                onChange={handleInputChange}
                                placeholder="User bio"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                rows={4}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Role
                              </label>                              <Select
                                value={editedUserData.role || 'user'}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSelectChange('role', e.target.value)}
                                className="w-full"
                              >
                                <SelectItem key="user" value="user" textValue="user">User</SelectItem>
                                <SelectItem key="instructor" value="instructor" textValue="instructor">Instructor</SelectItem>
                                <SelectItem key="admin" value="admin" textValue="admin">Admin</SelectItem>
                              </Select>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                              <Button
                                color="default"
                                variant="flat"
                                onPress={() => setEditMode(false)}
                                className="font-medium"
                              >
                                Cancel
                              </Button>
                              <Button
                                color="primary"
                                onPress={handleUserDetailsSave}
                                className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium"
                              >
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="bg-gray-50/80 dark:bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm space-y-4">
                              <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Display Name</h3>
                                <p className="mt-1 text-lg font-semibold">{selectedUser.displayName || 'Not set'}</p>
                              </div>

                              <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                                <p className="mt-1">{selectedUser.email}</p>
                              </div>

                              <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</h3>                                <p className="mt-1">
                                  <Chip color={selectedUser.role === UserRole.ADMIN || selectedUser.role === UserRole.SUPER_ADMIN ? 'primary' : 'default'}>
                                    {selectedUser.role || UserRole.USER}
                                  </Chip>
                                </p>
                              </div>

                              <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</h3>
                                <p className="mt-1">{selectedUser.bio || 'No bio provided'}</p>
                              </div>
                            </div>

                            <div className="bg-gray-50/80 dark:bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm space-y-4">
                              <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Created</h3>
                                <p className="mt-1">
                                  {selectedUser.createdAt ?
                                    (typeof selectedUser.createdAt === 'object' && 'seconds' in selectedUser.createdAt
                                      ? new Date(selectedUser.createdAt.seconds * 1000).toLocaleString()
                                      : new Date(selectedUser.createdAt).toLocaleString())
                                    : 'Unknown'}
                                </p>
                              </div>

                              <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</h3>
                                <p className="mt-1">
                                  {selectedUser.updatedAt ?
                                    (typeof selectedUser.updatedAt === 'object' && 'seconds' in selectedUser.updatedAt
                                      ? new Date(selectedUser.updatedAt.seconds * 1000).toLocaleString()
                                      : new Date(selectedUser.updatedAt).toLocaleString())
                                    : 'Never'}
                                </p>
                              </div>

                              <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Verification</h3>
                                <p className="mt-1">
                                  {selectedUser.emailVerified ? (
                                    <Chip color="success">Verified</Chip>
                                  ) : (
                                    <Chip color="warning">Not Verified</Chip>
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex justify-end">
                              <Button
                                color="primary"
                                variant="flat"
                                onPress={handleUserDetailsEdit}
                                className="font-medium text-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10 hover:bg-[color:var(--ai-primary)]/20"
                              >
                                Edit Profile
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Enrollments Tab */}
                    {selectedTab === "enrollments" && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">Enrolled Courses</h3>
                          <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            className="font-medium text-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10 hover:bg-[color:var(--ai-primary)]/20"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Assign Course
                          </Button>
                        </div>

                        {selectedUser.enrollments && Object.keys(selectedUser.enrollments).length > 0 ? (
                          <div className="space-y-2">
                            {Object.entries(selectedUser.enrollments).map(([courseId, enrollment]) => {
                              const course = courses[courseId];
                              return (
                                <div key={courseId} className="flex justify-between items-center p-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl border border-primary-100 dark:border-gray-800 backdrop-blur-sm">
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{course?.name || 'Unknown Course'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Enrolled: {enrollment.enrolledAt ?
                                        (typeof enrollment.enrolledAt === 'object' && 'seconds' in enrollment.enrolledAt
                                          ? new Date(enrollment.enrolledAt.seconds * 1000).toLocaleDateString()
                                          : new Date(enrollment.enrolledAt).toLocaleDateString())
                                        : 'Unknown date'}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Chip color={enrollment.source === 'admin' ? 'primary' : 'success'} size="sm">
                                      {enrollment.source === 'admin' ? 'Assigned' : 'Purchased'}
                                    </Chip>
                                    <Chip color={enrollment.status === 'completed' ? 'success' : 'warning'} size="sm">
                                      {enrollment.status}
                                    </Chip>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl border border-dashed border-primary-200 dark:border-gray-700 backdrop-blur-sm">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">No enrolled courses</p>
                            <Button
                              color="primary"
                              variant="flat"
                              size="sm"
                              className="mt-4 font-medium text-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10 hover:bg-[color:var(--ai-primary)]/20"
                            >
                              Assign First Course
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin Notes Tab */}
                    {selectedTab === "notes" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Admin Notes</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          These notes are only visible to administrators and are not shown to the user.
                        </p>

                        <textarea
                          value={userNotes}
                          onChange={(e) => handleNotesChange(e.target.value)}
                          placeholder="Add notes about this user..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          rows={8}
                        />
                      </div>
                    )}

                    {/* Activity Log Tab */}
                    {selectedTab === "activity" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">User Activity</h3>

                        <div className="relative border-l-2 border-gray-200 dark:border-gray-700 pl-4 ml-2 space-y-6">
                          {/* Example activities - in a real app, you'd fetch these from the database */}
                          <div className="relative">
                            <div className="absolute -left-6 mt-1 h-4 w-4 rounded-full bg-primary-500"></div>
                            <div className="flex flex-col">
                              <p className="font-medium">Account created</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedUser.createdAt ?
                                  (typeof selectedUser.createdAt === 'object' && 'seconds' in selectedUser.createdAt
                                    ? new Date(selectedUser.createdAt.seconds * 1000).toLocaleString()
                                    : new Date(selectedUser.createdAt).toLocaleString())
                                  : 'Unknown'}
                              </p>
                            </div>
                          </div>

                          {selectedUser.emailVerified && (
                            <div className="relative">
                              <div className="absolute -left-6 mt-1 h-4 w-4 rounded-full bg-green-500"></div>
                              <div className="flex flex-col">
                                <p className="font-medium">Email verified</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Date unavailable</p>
                              </div>
                            </div>
                          )}

                          {selectedUser.enrollments && Object.entries(selectedUser.enrollments).map(([courseId, enrollment]) => (
                            <div key={courseId} className="relative">
                              <div className="absolute -left-6 mt-1 h-4 w-4 rounded-full bg-blue-500"></div>
                              <div className="flex flex-col">
                                <p className="font-medium">Enrolled in {courses[courseId]?.name || 'a course'}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {enrollment.enrolledAt ?
                                    (typeof enrollment.enrolledAt === 'object' && 'seconds' in enrollment.enrolledAt
                                      ? new Date(enrollment.enrolledAt.seconds * 1000).toLocaleString()
                                      : new Date(enrollment.enrolledAt).toLocaleString())
                                    : 'Unknown date'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Via: {enrollment.source === 'admin' ? 'Admin assignment' : 'Self purchase'}
                                </p>
                              </div>
                            </div>
                          ))}

                          {/* Example placeholder activities */}
                          <div className="relative opacity-50">
                            <div className="absolute -left-6 mt-1 h-4 w-4 rounded-full bg-gray-400"></div>
                            <div className="flex flex-col">
                              <p className="font-medium">Last login</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Data not available</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Permissions Tab */}
                    {selectedTab === "permissions" && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Role Permissions</h3>

                          <div className="bg-gray-50/80 dark:bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-4">                              <div>
                              <h4 className="font-medium">Current Role</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedUser.role === UserRole.SUPER_ADMIN ? 'Super Administrator' :
                                  selectedUser.role === UserRole.ADMIN ? 'Administrator' : 'Regular User'}
                              </p>
                            </div>
                              <Chip color={selectedUser.role === UserRole.ADMIN || selectedUser.role === UserRole.SUPER_ADMIN ? 'primary' : 'default'}>
                                {selectedUser.role || UserRole.USER}
                              </Chip>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-sm">Access admin dashboard</span>
                                <Chip size="sm" color={selectedUser.role === 'admin' ? 'success' : 'danger'}>
                                  {selectedUser.role === 'admin' ? 'Yes' : 'No'}
                                </Chip>
                              </div>                              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-sm">Manage courses</span>
                                <Chip size="sm" color={selectedUser.role === UserRole.ADMIN || selectedUser.role === UserRole.SUPER_ADMIN ? 'success' : 'danger'}>
                                  {selectedUser.role === UserRole.ADMIN || selectedUser.role === UserRole.SUPER_ADMIN ? 'Yes' : 'No'}
                                </Chip>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-sm">Manage users</span>
                                <Chip size="sm" color={selectedUser.role === UserRole.ADMIN || selectedUser.role === UserRole.SUPER_ADMIN ? 'success' : 'danger'}>
                                  {selectedUser.role === UserRole.ADMIN || selectedUser.role === UserRole.SUPER_ADMIN ? 'Yes' : 'No'}
                                </Chip>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-sm">Access analytics</span>
                                <Chip size="sm" color={selectedUser.role === 'admin' ? 'success' : 'danger'}>
                                  {selectedUser.role === 'admin' ? 'Yes' : 'No'}
                                </Chip>
                              </div>                              <div className="flex items-center justify-between py-2">
                                <span className="text-sm">Create content</span>
                                <Chip size="sm" color={selectedUser.role === UserRole.ADMIN || selectedUser.role === UserRole.SUPER_ADMIN ? 'success' : 'danger'}>
                                  {selectedUser.role === UserRole.ADMIN || selectedUser.role === UserRole.SUPER_ADMIN ? 'Yes' : 'No'}
                                </Chip>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-4">Account Status</h3>

                          <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                              color="warning"
                              variant="flat"
                              className="font-medium flex-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              size="lg"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                              </svg>
                              Suspend Account
                            </Button>

                            <Button
                              color="danger"
                              variant="flat"
                              className="font-medium flex-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              size="lg"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Delete Account
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </ModalBody>

                  <ModalFooter className="border-t border-primary-100 dark:border-gray-800">
                    <Button
                      color="default"
                      variant="light"
                      onPress={closeModal}
                      className="font-medium text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-card-border)]/20"
                    >
                      Close
                    </Button>
                  </ModalFooter>
                </div>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};

export default EnhancedUserManagement;
