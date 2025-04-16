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
                                    ease: "easeOut"
                                }
                            },
                            exit: {
                                y: -20,
                                opacity: 0,
                                transition: {
                                    duration: 0.2,
                                    ease: "easeIn"
                                }
                            }
                        }
                    }}
                >
                    <ModalContent className="overflow-hidden dark:bg-gray-900/95 border border-primary-200/20 dark:border-gray-800 shadow-xl">
                        {(onClose) => (
                            <>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 blur-xl opacity-80 -z-10"></div>
                                    <ModalHeader className="border-b border-primary-100 dark:border-gray-800 text-primary-900 dark:text-primary-100">User Details</ModalHeader>
                                    <ModalBody className="py-6">
                                        <div className="flex items-center mb-6">
                                            <Avatar
                                                src={selectedUser.photoURL || ""}
                                                name={selectedUser.displayName || selectedUser.email}
                                                className="mr-4"
                                                size="lg"
                                            />
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser.displayName || 'No Name'}</h2>
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
                                            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Account Details</h3>
                                            <div className="grid grid-cols-2 gap-4 bg-gray-50/80 dark:bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm">
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">{selectedUser.id}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Created On</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">{selectedUser.createdAt ?
                                                        (typeof selectedUser.createdAt === 'object' && 'seconds' in selectedUser.createdAt
                                                            ? new Date(selectedUser.createdAt.seconds * 1000).toLocaleDateString()
                                                            : new Date(selectedUser.createdAt).toLocaleDateString())
                                                        : 'Unknown'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Enrolled Courses</h3>                                                <Button
                                                    size="sm"
                                                    color="primary"
                                                    variant="flat"
                                                    onPress={openAssignCourseModal}
                                                    className="text-sm font-medium text-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10 hover:bg-[color:var(--ai-primary)]/20"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                                    </svg>
                                                    Add Course
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
                                                                <div>
                                                                    <Chip color={enrollment.source === 'admin' ? 'primary' : 'success'} size="sm" className="animate-fadeIn">
                                                                        {enrollment.source === 'admin' ? 'Assigned' : 'Purchased'}
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
                                                    <p className="mt-2 text-gray-500 dark:text-gray-400">No enrolled courses</p>                                                    <Button
                                                        color="primary"
                                                        variant="flat"
                                                        size="sm"
                                                        className="mt-4 font-medium text-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10 hover:bg-[color:var(--ai-primary)]/20"
                                                        onPress={openAssignCourseModal}
                                                    >
                                                        Assign First Course
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </ModalBody>
                                    <ModalFooter className="border-t border-primary-100 dark:border-gray-800">                                        <Button
                                        color="default"
                                        onPress={closeModal}
                                        className="font-medium text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-card-border)]/20"
                                    >
                                        Close
                                    </Button>
                                        <Button
                                            color="primary"
                                            variant="flat"
                                            onPress={openAssignCourseModal}
                                            className="font-medium text-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10 hover:bg-[color:var(--ai-primary)]/20"
                                        >
                                            Assign Course
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
                                ease: "easeOut"
                            }
                        },
                        exit: {
                            y: -20,
                            opacity: 0,
                            transition: {
                                duration: 0.2,
                                ease: "easeIn"
                            }
                        }
                    }
                }}
            >
                <ModalContent className="overflow-hidden dark:bg-gray-900/95 border border-primary-200/20 dark:border-gray-800 shadow-xl">
                    {(onClose) => (
                        <>
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 blur-xl opacity-80 -z-10"></div>
                                <ModalHeader className="flex flex-col gap-1 border-b border-primary-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-gradient-to-br from-primary-500 to-secondary-500 p-2 rounded-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                            </svg>
                                        </div>
                                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
                                            Assign Course
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Grant course access to this user
                                    </p>
                                </ModalHeader>
                                <ModalBody className="py-6">
                                    {assignSuccess ? (
                                        <div className="text-center py-6 px-4">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-5">
                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Course Assigned Successfully</h3>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                The course has been assigned to {selectedUser?.displayName || selectedUser?.email}
                                            </p>
                                            <div className="mt-6">                                                <Button
                                                color="primary"
                                                className="w-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium shadow-sm hover:shadow-md hover:shadow-[color:var(--ai-primary)]/20 transition-all"
                                                onPress={closeAssignCourseModal}
                                            >
                                                Close
                                            </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {selectedUser && (
                                                <div className="mb-6 bg-gray-50/80 dark:bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm">
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assigning course to:</p>
                                                    <div className="flex items-center">
                                                        <Avatar src={selectedUser.photoURL || ""} name={selectedUser.displayName || selectedUser.email} className="mr-3" size="md" />
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">{selectedUser.displayName || 'No Name'}</p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mb-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Select Course
                                                </label>
                                                <div className="relative">
                                                    <Select
                                                        placeholder="Choose a course"
                                                        value={selectedCourseId}
                                                        onChange={(e) => setSelectedCourseId(e.target.value)}
                                                        className="w-full"
                                                        variant="bordered"
                                                        size="lg"
                                                        labelPlacement="outside"
                                                        classNames={{
                                                            trigger: "h-12 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm border-primary-200 dark:border-gray-700",
                                                            value: "text-gray-900 dark:text-white",
                                                        }}
                                                    >
                                                        {Object.values(courses).map((course: Course) => (
                                                            <SelectItem key={course.id} textValue={course.name} className="text-gray-900 dark:text-white">
                                                                {course.name}
                                                            </SelectItem>
                                                        ))}
                                                    </Select>
                                                    <div className="absolute right-3 top-3 pointer-events-none text-gray-500">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                    The selected course will be immediately available to this user.
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </ModalBody>
                                {!assignSuccess && (
                                    <ModalFooter className="border-t border-primary-100 dark:border-gray-800">                                        <Button
                                        color="default"
                                        variant="light"
                                        onPress={closeAssignCourseModal}
                                        className="font-medium text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-card-border)]/20"
                                    >
                                        Cancel
                                    </Button>
                                        <Button
                                            color="primary"
                                            isDisabled={!selectedCourseId || assignLoading}
                                            isLoading={assignLoading}
                                            onPress={handleAssignCourse}
                                            className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium shadow-sm hover:shadow-md hover:shadow-[color:var(--ai-primary)]/20 transition-all"
                                        >
                                            Assign Course
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