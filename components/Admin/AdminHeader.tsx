'use client'

import React, { useContext } from 'react';
import { Avatar, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/components/AppContext';

interface AdminHeaderProps {
    onTabChange?: (tab: string) => void;
    activeTab?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onTabChange, activeTab = 'dashboard' }) => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("AdminHeader must be used within an AppProvider");
    }

    const { user, isAdmin } = context;
    const router = useRouter();

    // Handle navigation to different admin sections
    const handleNavigation = (tab: string) => {
        if (onTabChange) {
            onTabChange(tab);
        }
    };

    // Navigate back to the main site
    const navigateToSite = () => {
        router.push('/');
    };

    return (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link href="/admin" className="flex items-center">
                            <div className="flex flex-shrink-0 items-center">
                                <svg className="h-8 w-8 text-primary-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 4L3 8L12 12L21 8L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3 16L12 20L21 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3 12L12 16L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Admin</span>
                            </div>
                        </Link>

                        <nav className="ml-8 hidden md:flex space-x-4">
                            <NavLink
                                label="Dashboard"
                                isActive={activeTab === 'dashboard'}
                                onClick={() => handleNavigation('dashboard')}
                            />
                            <NavLink
                                label="Courses"
                                isActive={activeTab === 'courses'}
                                onClick={() => handleNavigation('courses')}
                            />
                            <NavLink
                                label="Users"
                                isActive={activeTab === 'users'}
                                onClick={() => handleNavigation('users')}
                            />
                            <NavLink
                                label="Analytics"
                                isActive={activeTab === 'analytics'}
                                onClick={() => handleNavigation('analytics')}
                            />
                            <NavLink
                                label="Settings"
                                isActive={activeTab === 'settings'}
                                onClick={() => handleNavigation('settings')}
                            />
                        </nav>
                    </div>

                    <div className="flex items-center">
                        <Button
                            size="sm"
                            variant="light"
                            className="mr-4"
                            onClick={navigateToSite}
                        >
                            Back to Site
                        </Button>

                        <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                                <div className="flex items-center cursor-pointer">
                                    <Avatar
                                        size="sm"
                                        src={user?.photoURL || undefined}
                                        name={user?.displayName || 'Admin'}
                                        className="mr-2"
                                    />
                                    <span className="hidden sm:block font-medium text-gray-700 dark:text-gray-200">
                                        {user?.displayName || user?.email || 'Admin'}
                                    </span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Admin actions">
                                <DropdownItem key="profile" onClick={() => router.push('/profile')}>
                                    My Profile
                                </DropdownItem>
                                <DropdownItem key="settings" onClick={() => handleNavigation('settings')}>
                                    Admin Settings
                                </DropdownItem>
                                <DropdownItem key="help">
                                    Help & Documentation
                                </DropdownItem>
                                <DropdownItem key="logout" className="text-danger" color="danger">
                                    Logout
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </header>
    );
};

interface NavLinkProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
        >
            {label}
        </button>
    );
};

export default AdminHeader;