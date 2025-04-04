import React from 'react';
import { DropdownItem } from "@heroui/react";  // Updated to use HeroUI
import AddCourse from "@/components/Course/AddCourse";
import { ModalProps } from '@/types';

interface AdminActionsProps {
    isAdmin: boolean;
    openModal: (modalProps: ModalProps) => void;
    closeModal: (id: string) => void;
}

const AdminActions: React.FC<AdminActionsProps> = ({ isAdmin, openModal, closeModal }) => {
    if (!isAdmin) {
        return <DropdownItem key="hidden" className="hidden">H</DropdownItem>;
    }

    return (
        <>
            <DropdownItem
                key="adminDashboard"
                textValue='Admin Dashboard'
                className='p-0'
            >
                <div
                    className='cursor-pointer hover:bg-slate-800/40 rounded-lg p-2'
                    onClick={() => window.location.href = "/admin"}
                >
                    Admin Dashboard
                </div>
            </DropdownItem>
            <DropdownItem
                key="addCourse"
                textValue='Add Course'
                className='p-0'
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
                    className='cursor-pointer hover:bg-slate-800/40 rounded-lg p-2'
                >
                    Add Course
                </div>
            </DropdownItem>
        </>
    );
};

export default AdminActions;