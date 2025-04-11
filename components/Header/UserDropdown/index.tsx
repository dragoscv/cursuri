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
import { firebaseApp, firebaseAuth } from "@/utils/firebase/firebase.config";
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

    // Define sections separately to handle conditional rendering properly
    const renderProfileSection = () => {
        if (!user) return null;

        return (
            <DropdownSection
                aria-label="Profile & Actions"
                showDivider
            >
                <DropdownItem
                    key="profile-info"
                    className="h-14 gap-2 border-0 text-[color:var(--ai-foreground)]/80"
                    textValue="Profile Details"
                >
                    <div
                        className="cursor-pointer hover:bg-[color:var(--ai-primary)]/10 rounded-lg p-2 border-0 transition-colors"
                        onClick={() => router.push('/profile')}
                    >
                        <p className="font-semibold text-[color:var(--ai-foreground)]">Signed in as</p>
                        <p className="font-semibold text-[color:var(--ai-foreground)]">{user?.displayName ? user?.displayName : user?.email ? user?.email : user?.phoneNumber ? user?.phoneNumber : user?.uid}</p>
                    </div>
                </DropdownItem>
            </DropdownSection>
        );
    };

    // Actions section (Profile Dashboard)
    const renderActionsSection = () => {
        return (
            <DropdownSection aria-label="Actions" showDivider>
                {user && (
                    <DropdownItem
                        key="profile"
                        textValue="Profile Dashboard"
                        className="p-0"
                    >
                        <div
                            className="cursor-pointer hover:bg-[color:var(--ai-primary)]/10 hover:text-[color:var(--ai-primary)] rounded-lg p-2 transition-colors flex items-center gap-2"
                            onClick={() => router.push('/profile')}
                        >
                            <UserIcon className="text-[color:var(--ai-primary)]" size={18} />
                            Profile Dashboard
                        </div>
                    </DropdownItem>
                )}
            </DropdownSection>
        );
    };

    // Admin section
    const renderAdminSection = () => {
        if (!isAdmin) return null;

        return (
            <DropdownSection aria-label="Admin Actions" showDivider>
                <DropdownItem
                    key="adminDashboard"
                    textValue="Admin Dashboard"
                    className="p-0"
                >
                    <div
                        className="cursor-pointer hover:bg-[color:var(--ai-primary)]/10 hover:text-[color:var(--ai-primary)] rounded-lg p-2 transition-colors flex items-center gap-2"
                        onClick={() => router.push('/admin')}
                    >
                        <ShieldIcon className="text-[color:var(--ai-primary)]" size={18} />
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
                        className="cursor-pointer hover:bg-[color:var(--ai-primary)]/10 hover:text-[color:var(--ai-primary)] rounded-lg p-2 transition-colors flex items-center gap-2"
                    >
                        <PlusIcon className="text-[color:var(--ai-primary)]" size={18} />
                        Add Course
                    </div>
                </DropdownItem>
            </DropdownSection>
        );
    };

    // Core actions section (Suggestions, Login/Logout)
    const renderCoreActionsSection = () => {
        return (
            <DropdownSection aria-label="Actions" showDivider>
                {/* Suggestions Item */}
                <DropdownItem
                    key="suggestions"
                    textValue="Suggestions"
                    className="p-0"
                >
                    <div className="cursor-pointer hover:bg-[color:var(--ai-primary)]/10 hover:text-[color:var(--ai-primary)] rounded-lg p-2 transition-colors flex items-center gap-2">
                        <MessageSquareIcon className="text-[color:var(--ai-primary)]" size={18} />
                        Suggestions
                    </div>
                </DropdownItem>

                {/* Auth Actions */}
                {user ? (
                    <DropdownItem
                        key="logout"
                        textValue="Logout"
                        className="p-0"
                    >
                        <div
                            className="cursor-pointer hover:bg-[color:var(--ai-danger)]/10 hover:text-[color:var(--ai-danger)] rounded-lg p-2 transition-colors flex items-center gap-2"
                            onClick={handleSignOut}
                        >
                            <LogOutIcon className="text-[color:var(--ai-danger)]" size={18} />
                            Logout
                        </div>
                    </DropdownItem>
                ) : (
                    <DropdownItem
                        key="login"
                        textValue="Login"
                        className="p-0"
                    >
                        <div
                            className="cursor-pointer hover:bg-[color:var(--ai-success)]/10 hover:text-[color:var(--ai-success)] rounded-lg p-2 transition-colors flex items-center gap-2"
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
                            <UserIcon className="text-[color:var(--ai-success)]" size={18} />
                            Login
                        </div>
                    </DropdownItem>
                )}
            </DropdownSection>
        );
    };

    // Social Icons Section
    const renderSocialSection = () => {
        return (
            <DropdownSection aria-label="Social Links">
                <DropdownItem
                    key="social"
                    textValue="Social"
                    className="p-0"
                >
                    <div className="w-full">
                        <SocialIcons />
                    </div>
                </DropdownItem>
            </DropdownSection>
        );
    };

    return (
        <Dropdown
            placement="bottom-end"
            backdrop="blur"
            classNames={{
                base: "py-1 px-1 rounded-lg bg-gradient-to-br from-white to-default-200 dark:from-[color:var(--ai-card-bg)]/90 dark:to-[color:var(--ai-background)]/70 z-[9999]",
                arrow: "bg-default-200",
                backdrop: "fixed pointer-events-none backdrop-blur-md backdrop-saturate-150 bg-white/70 dark:bg-[color:var(--ai-background)]/60 w-screen h-screen inset-0",
                content: "z-[9999] flex flex-col justify-start items-end shadow-xl",
            }}
            className="z-[9999] relative"
            offset={12}
            portalContainer={typeof document !== 'undefined' ? document.body : undefined}
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
                        className="w-8 h-8 rounded-full object-cover border-2 border-[color:var(--ai-primary)]/40"
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
                        "text-[color:var(--ai-foreground)]",
                        "border-0",
                        "outline-none"
                    ],
                    wrapper: "border-0",
                }}
                className="z-[9999]"
            >
                {renderProfileSection()}
                {renderActionsSection()}
                {renderAdminSection()}
                {renderCoreActionsSection()}
                {renderSocialSection()}
            </DropdownMenu>
        </Dropdown>
    );
}