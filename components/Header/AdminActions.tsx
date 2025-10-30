'use client';

import React, { useContext } from 'react';
import { AppContext } from '@/components/AppContext';
import Button from '@/components/ui/Button';
import { PlusIcon } from '@/components/icons/FeatherIcons';
import AddCourse from '@/components/Course/AddCourse';
import { useRouter } from 'next/navigation';

/**
 * AdminActions component that displays admin-specific buttons and actions
 */
export default function AdminActions() {
  const context = useContext(AppContext);
  const router = useRouter();

  if (!context) {
    throw new Error('Missing context value');
  }

  const { isAdmin, openModal, closeModal } = context;

  // Don't show admin actions if user is not an admin
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {/* <Button
                color="primary"
                startContent={<PlusIcon size={16} />}
                onPress={() => openModal({
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
                className="font-medium"
                size="sm"
            >
                Add Course
            </Button> */}
      <Button
        variant="flat"
        color="primary"
        onPress={() => router.push('/admin')}
        className="font-medium"
        size="sm"
      >
        Admin Panel
      </Button>
    </div>
  );
}
