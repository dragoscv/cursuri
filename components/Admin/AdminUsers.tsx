'use client'

import React, { useContext, useEffect, useState } from 'react';
import { Avatar, Button, Card, CardBody, Chip, Divider, Input, Spinner, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, SelectItem } from '@heroui/react';
import { AppContext } from '@/components/AppContext';
import { Course, UserProfile } from '@/types';

const AdminUsers: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("AdminUsers must be used within an AppProvider");
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
                setError('Failed to load user data');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [getAllUsers]);

    const filteredUsers = users ?
        Object.values(users).filter(user =>
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
        ) : [];

    const paginatedUsers = filteredUsers.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

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
                <h2 className="text-2xl font-bold text-red-500 mb-4">{error}</h2>
                <p className="text-gray-600 dark:text-gray-400">Please try again later</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold">Users Management</h1>

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

            <Card className="shadow-md">
                <CardBody>
                    <Table aria-label="Users table">
                        <TableHeader>
                            <TableColumn>USER</TableColumn>
                            <TableColumn>EMAIL</TableColumn>
                            <TableColumn>VERIFIED</TableColumn>
                            <TableColumn>ROLE</TableColumn>
                            <TableColumn>ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {paginatedUsers.length > 0 ? (
                                paginatedUsers.map((user) => (
                                    <TableRow key={user.id} className="cursor-pointer" onClick={() => handleRowClick(user)}>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Avatar src={user.photoURL || ""} name={user.displayName || user.email} className="mr-3" />
                                                <div>
                                                    <p className="font-medium">{user.displayName || 'No Name'}</p>
                                                    <p className="text-xs text-gray-500">ID: {user.id.substring(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            {user.emailVerified ? (
                                                <Chip color="success" size="sm">Verified</Chip>
                                            ) : (
                                                <Chip color="warning" size="sm">Not Verified</Chip>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip color={user.role === 'admin' ? 'primary' : 'default'} size="sm">
                                                {user.role || 'user'}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <Button size="sm" color="primary" variant="flat" onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedUser(user);
                                                openAssignCourseModal();
                                            }}>
                                                Assign Course
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
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

            {/* User Details Modal */}
            {selectedUser && (
                <Modal isOpen={!!selectedUser && !assignModalOpen} onClose={closeModal} size="lg">
                    <ModalContent>
                        <ModalHeader>User Details</ModalHeader>
                        <ModalBody>
                            <div className="flex items-center mb-6">
                                <Avatar
                                    src={selectedUser.photoURL || ""}
                                    name={selectedUser.displayName || selectedUser.email}
                                    className="mr-4"
                                    size="lg"
                                />
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedUser.displayName || 'No Name'}</h2>
                                    <p className="text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                                    <div className="flex mt-2">
                                        <Chip color={selectedUser.role === 'admin' ? 'primary' : 'default'} size="sm" className="mr-2">
                                            {selectedUser.role || 'user'}
                                        </Chip>
                                        {selectedUser.emailVerified ? (
                                            <Chip color="success" size="sm">Verified</Chip>
                                        ) : (
                                            <Chip color="warning" size="sm">Not Verified</Chip>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Divider className="my-4" />

                            <div className="mb-4">
                                <h3 className="text-lg font-semibold mb-2">Account Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">User ID</p>
                                        <p>{selectedUser.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Created On</p>
                                        <p>{selectedUser.createdAt ? new Date(selectedUser.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-lg font-semibold mb-2">Enrolled Courses</h3>
                                {selectedUser.enrollments && Object.keys(selectedUser.enrollments).length > 0 ? (
                                    <div className="space-y-2">
                                        {Object.entries(selectedUser.enrollments).map(([courseId, enrollment]) => {
                                            const course = courses[courseId];
                                            return (
                                                <div key={courseId} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{course?.name || 'Unknown Course'}</p>
                                                        <p className="text-xs text-gray-500">
                                                            Enrolled: {enrollment.enrolledAt ?
                                                                new Date(enrollment.enrolledAt.seconds * 1000).toLocaleDateString() :
                                                                'Unknown date'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <Chip color={enrollment.source === 'admin' ? 'primary' : 'success'} size="sm">
                                                            {enrollment.source === 'admin' ? 'Assigned' : 'Purchased'}
                                                        </Chip>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">No enrolled courses</p>
                                )}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" variant="flat" onPress={openAssignCourseModal}>
                                Assign Course
                            </Button>
                            <Button color="default" onPress={closeModal}>
                                Close
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}

            {/* Assign Course Modal */}
            <Modal isOpen={assignModalOpen} onClose={closeAssignCourseModal} size="md">
                <ModalContent>
                    <ModalHeader>Assign Course to User</ModalHeader>
                    <ModalBody>
                        {assignSuccess ? (
                            <div className="text-center py-4">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Course Assigned Successfully</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    The course has been assigned to {selectedUser?.displayName || selectedUser?.email}
                                </p>
                            </div>
                        ) : (
                            <>
                                {selectedUser && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500 mb-1">Assigning course to:</p>
                                        <div className="flex items-center">
                                            <Avatar src={selectedUser.photoURL || ""} name={selectedUser.displayName || selectedUser.email} className="mr-2" size="sm" />
                                            <span className="font-medium">{selectedUser.displayName || selectedUser.email}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Select Course
                                    </label>
                                    <Select
                                        placeholder="Choose a course"
                                        value={selectedCourseId}
                                        onChange={(e) => setSelectedCourseId(e.target.value)}
                                    >
                                        {Object.values(courses).map((course: Course) => (
                                            <SelectItem key={course.id} value={course.id}>
                                                {course.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            </>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        {!assignSuccess && (
                            <Button
                                color="primary"
                                isDisabled={!selectedCourseId || assignLoading}
                                isLoading={assignLoading}
                                onPress={handleAssignCourse}
                            >
                                Assign Course
                            </Button>
                        )}
                        <Button color="default" onPress={closeAssignCourseModal}>
                            {assignSuccess ? 'Close' : 'Cancel'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default AdminUsers;