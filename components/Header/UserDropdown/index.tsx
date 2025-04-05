'use client'

import React, { useContext } from 'react';
import {
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownSection,
    DropdownItem
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { AppContext } from "@/components/AppContext";
import { UserIcon, LogOutIcon, ShieldIcon, PlusIcon, MessageSquareIcon } from "@/components/icons/FeatherIcons";
import { firebaseApp, firebaseAuth } from "firewand";
import { signOut } from "firebase/auth";
import Login from "@/components/Login";
import AddCourse from "@/components/Course/AddCourse";
import SocialIcons from "@/components/Header/SocialIcons";

/**
 * UserDropdown component that handles the user menu functionality
 */
export default function UserDropdown() {
    const router = useRouter();
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("Missing context value");
    }

    const { user, openModal, closeModal, isAdmin } = context;

    const handleSignOut = async () => {
        await signOut(firebaseAuth);
    }

    return (
        <Dropdown
            placement="bottom-end"
            backdrop="blur"
            classNames={{
                base: "py-1 px-1 rounded-lg bg-gradient-to-br from-white to-default-200 dark:from-gray-800/90 dark:to-gray-900/70 z-[100]",
                arrow: "bg-default-200",
                backdrop: "fixed pointer-events-none backdrop-blur-md backdrop-saturate-150 bg-white/70 dark:bg-black/60 w-screen h-screen inset-0",
                content: "z-[100] flex flex-col justify-start items-end shadow-xl",
            }}
            className="z-[100]"
            offset={12}
        >
            <DropdownTrigger>
                <Button
                    isIconOnly
                    variant="flat"
                    className="rounded-full"
                >
                    <img
                        src={user?.photoURL || "https://i.pravatar.cc/150?u=a042581f4e29026704d"}
                        alt="User avatar"
                        className="w-8 h-8 rounded-full object-cover border-2 border-indigo-600/40"
                    />
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="User Actions"
                variant="faded"
                itemClasses={{
                    base: [
                        "rounded-md",
                        "text-sm",
                        "transition-opacity",
                        "data-[hover=true]:text-foreground",
                        "data-[hover=true]:bg-default-100",
                        "dark:data-[hover=true]:bg-default-50",
                        "data-[selectable=true]:focus:bg-default-50",
                        "data-[pressed=true]:opacity-70",
                        "data-[focus-visible=true]:ring-default-500",
                        "text-black dark:text-white",
                        "border-0",
                        "outline-none"
                    ],
                    wrapper: "border-0",
                }}
                className="z-50"
            >
                {/* User Profile Section */}
                <DropdownSection
                    aria-label="Profile & Actions"
                    showDivider
                    className={`${user ? '' : 'hidden'}`}
                >
                    <DropdownItem
                        key="profile-info"
                        className="h-14 gap-2 border-0 text-black/80"
                        textValue="Profile Details"
                    >
                        <div
                            className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg p-2 border-0 transition-colors"
                            onClick={() => router.push('/profile')}
                        >
                            <p className="font-semibold">Signed in as</p>
                            <p className="font-semibold">{user?.displayName ? user?.displayName : user?.email ? user?.email : user?.phoneNumber ? user?.phoneNumber : user?.uid}</p>
                        </div>
                    </DropdownItem>
                </DropdownSection>

                <DropdownSection aria-label="Actions" showDivider>
                    {/* Profile Dashboard */}
                    {user && (
                        <DropdownItem
                            key="profile"
                            textValue="Profile Dashboard"
                            className="p-0"
                        >
                            <div
                                className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg p-2 transition-colors flex items-center gap-2"
                                onClick={() => router.push('/profile')}
                            >
                                <UserIcon className="text-indigo-500" size={18} />
                                Profile Dashboard
                            </div>
                        </DropdownItem>
                    )}

                    {/* Admin Actions */}
                    {isAdmin && (
                        <>
                            <DropdownItem
                                key="adminDashboard"
                                textValue="Admin Dashboard"
                                className="p-0"
                            >
                                <div
                                    className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg p-2 transition-colors flex items-center gap-2"
                                    onClick={() => router.push('/admin')}
                                >
                                    <ShieldIcon className="text-indigo-500" size={18} />
                                    Admin Dashboard
                                </div>
                            </DropdownItem>
                            <DropdownItem
                                key="addCourse"
                                textValue="Add Course"
                                className="p-0"
                                onClick={() => openModal({
                                    id: 'add-course',
                                    isOpen: true,
                                    hideCloseButton: false,
                                    backdrop: 'blur',
                                    size: 'full',
                                    scrollBehavior: 'inside',
                                    isDismissable: true,
                                    modalHeader: 'Add Course',
                                    modalBody: <AddCourse onClose={() => closeModal('add-course')} />,
                                    headerDisabled: true,
                                    footerDisabled: true,
                                    noReplaceURL: true,
                                    onClose: () => closeModal('add-course'),
                                })}
                            >
                                <div
                                    className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg p-2 transition-colors flex items-center gap-2"
                                >
                                    <PlusIcon className="text-indigo-500" size={18} />
                                    Add Course
                                </div>
                            </DropdownItem>
                        </>
                    )}

                    {/* Suggestions Item */}
                    <DropdownItem
                        key="suggestions"
                        textValue="Suggestions"
                        className="p-0"
                    >
                        <div className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg p-2 transition-colors flex items-center gap-2">
                            <MessageSquareIcon className="text-indigo-500" size={18} />
                            Suggestions
                        </div>
                    </DropdownItem>

                    {/* Auth Actions */}
                    <DropdownItem
                        key="account"
                        textValue="Account"
                        className="p-0"
                    >
                        {user ? (
                            <div
                                className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg p-2 transition-colors flex items-center gap-2"
                                onClick={handleSignOut}
                            >
                                <LogOutIcon className="text-red-500" size={18} />
                                Logout
                            </div>
                        ) : (
                            <div
                                className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 rounded-lg p-2 transition-colors flex items-center gap-2"
                                onClick={() => openModal({
                                    id: 'login',
                                    isOpen: true,
                                    hideCloseButton: false,
                                    backdrop: 'blur',
                                    size: 'full',
                                    scrollBehavior: 'inside',
                                    isDismissable: true,
                                    modalHeader: 'Autentificare',
                                    modalBody: <Login onClose={() => closeModal('login')} />,
                                    headerDisabled: true,
                                    footerDisabled: true,
                                    noReplaceURL: true,
                                    onClose: () => closeModal('login'),
                                })}
                            >
                                <UserIcon className="text-green-500" size={18} />
                                Login
                            </div>
                        )}
                    </DropdownItem>
                </DropdownSection>

                {/* Social Icons Section */}
                <DropdownSection aria-label="Social Links">
                    <DropdownItem
                        key="social"
                        textValue="Social"
                        className="p-0"
                    >
                        <SocialIcons />
                    </DropdownItem>
                </DropdownSection>
            </DropdownMenu>
        </Dropdown>
    );
}