import React from 'react';
import { DropdownItem, DropdownSection } from "@heroui/react";  // Updated to use HeroUI
import Profile from "@/components/Profile";
import { ModalProps } from '@/types';

interface UserProfileSectionProps {
    user: any;
    openModal: (modalProps: ModalProps) => void;
    closeModal: (id: string) => void;
}

const UserProfileSection: React.FC<UserProfileSectionProps> = ({ user, openModal, closeModal }) => {
    if (!user) {
        return null;
    }

    return (
        <DropdownSection
            aria-label="Profile & Actions"
            showDivider
            {...({} as any)}
        >
            <DropdownItem
                key="profile"
                className="h-14 gap-2 border-0 text-black/80"
                textValue="Profile Details"
            >
                <div
                    className='cursor-pointer hover:bg-[color:var(--ai-card-bg)]/40 dark:hover:bg-[color:var(--ai-card-border)]/40 rounded-lg p-2 border-0'
                    onClick={() => openModal({
                        id: 'profile',
                        isOpen: true,
                        hideCloseButton: false,
                        backdrop: 'blur',
                        size: 'full',
                        scrollBehavior: 'inside',
                        isDismissable: true,
                        modalHeader: 'Profile',
                        modalBody: <Profile onClose={() => closeModal('profile')} />,
                        headerDisabled: true,
                        footerDisabled: true,
                        noReplaceURL: true,
                        onClose: () => closeModal('profile'),
                    })}
                >
                    <p className="font-semibold">Signed in as</p>
                    <p className="font-semibold">{user?.displayName ? user?.displayName : user?.email ? user?.email : user?.phoneNumber ? user?.phoneNumber : user?.uid}</p>
                </div>
            </DropdownItem>
        </DropdownSection>
    );
};

export default UserProfileSection;