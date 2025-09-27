'use client'

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { useModal } from './modalContext';

/**
 * ModalRenderer component that renders all active modals
 * This component should be placed at the root level of your app
 */
export const ModalRenderer: React.FC = () => {
    const { modals, closeModal } = useModal();

    // Helper function to render modal body content
    const renderModalBody = (modalBody: React.ReactNode | string, modalId: string) => {
        if (typeof modalBody === 'string') {
            // If modalBody is a string, try to render the corresponding component
            switch (modalBody) {
                case 'login':
                    // Dynamically import Login component
                    const Login = React.lazy(() => import('@/components/Login'));
                    return (
                        <React.Suspense fallback={<div>Loading...</div>}>
                            <Login onClose={() => closeModal(modalId)} />
                        </React.Suspense>
                    );
                case 'checkout':
                    // Add other modal components as needed
                    return <div>Checkout component placeholder</div>;
                default:
                    return <div>{modalBody}</div>;
            }
        }

        // If modalBody is already a React component
        return modalBody;
    };

    return (
        <>
            {modals.map((modal) => (
                <Modal
                    key={modal.id}
                    isOpen={modal.isOpen}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) {
                            if (modal.onClose) {
                                modal.onClose();
                            } else {
                                closeModal(modal.id);
                            }
                        }
                    }}
                    backdrop={modal.backdrop || 'blur'}
                    size={modal.size || 'md'}
                    scrollBehavior={modal.scrollBehavior || 'inside'}
                    isDismissable={modal.isDismissable !== false}
                    hideCloseButton={modal.hideCloseButton || false}
                    className="modal-container"
                    classNames={modal.classNames}
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                {!modal.headerDisabled && (
                                    <ModalHeader className="flex flex-col gap-1">
                                        {modal.modalHeader || 'Modal'}
                                    </ModalHeader>
                                )}

                                <ModalBody className="modal-body">
                                    {renderModalBody(modal.modalBody, modal.id)}
                                    {modal.modalBottomComponent}
                                </ModalBody>

                                {!modal.footerDisabled && (
                                    <ModalFooter>
                                        {modal.footerButtonText && modal.footerButtonClick && (
                                            <Button
                                                color="primary"
                                                onClick={modal.footerButtonClick}
                                                className="modal-footer-button"
                                            >
                                                {modal.footerButtonText}
                                            </Button>
                                        )}
                                        {!modal.hideCloseButton && (
                                            <Button
                                                color="danger"
                                                variant="light"
                                                onClick={onClose}
                                                className="modal-close-button"
                                            >
                                                Close
                                            </Button>
                                        )}
                                    </ModalFooter>
                                )}
                            </>
                        )}
                    </ModalContent>
                </Modal>
            ))}
        </>
    );
};

export default ModalRenderer;