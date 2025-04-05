'use client'

import { useEffect } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
} from "@heroui/react";  // Updated to use HeroUI instead of NextUI

import { ModalProps } from "@/types";

/**
 * A customizable modal component that can be used to display content and actions to the user.
 * @param isOpen - Whether the modal is currently open or not.
 * @param onClose - Function to be called when the modal is closed.
 * @param hideCloseButton - Whether to hide the close button or not.
 * @param backdrop - Whether to show the backdrop or not.
 * @param size - The size of the modal.
 * @param scrollBehavior - The scroll behavior of the modal.
 * @param isDismissable - Whether the modal can be dismissed or not.
 * @param modalHeader - The header content of the modal.
 * @param modalBody - The body content of the modal.
 * @param footerDisabled - Whether to disable the footer or not.
 * @param footerButtonClick - Function to be called when the footer button is clicked.
 * @param footerButtonText - The text to be displayed on the footer button.
 * @param classNames - Custom class names to be applied to the modal.
 * @returns A modal component.
 */
export default function ModalComponent({ isOpen, onClose, hideCloseIcon, hideCloseButton, backdrop, size, scrollBehavior, isDismissable, modalHeader, modalBody, footerDisabled, footerButtonClick, footerButtonText, modalBottomComponent, classNames = {} }: ModalProps) {

    //prevent back button press and replace with modal close
    useEffect(() => {
        if (isOpen) {
            window.history.pushState(null, '', window.location.href);
            window.onpopstate = () => {
                if (onClose) {
                    onClose()
                }
            }
        }
    }, [isOpen, onClose])

    // Ensure we have a working close handler
    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    // Deep merge function for classNames objects
    const mergeClassNames = (defaultClasses: Record<string, string>, customClasses: Record<string, any> = {}) => {
        const result: Record<string, string> = { ...defaultClasses };

        // For each custom class, override the default
        Object.keys(customClasses).forEach(key => {
            if (result[key]) {
                result[key] = `${result[key]} ${customClasses[key]}`;
            } else {
                result[key] = customClasses[key];
            }
        });

        return result;
    };

    // Default class names
    const defaultClassNames = {
        backdrop: "z-50 backdrop-blur-md backdrop-saturate-150 bg-white/70 dark:bg-[color:var(--ai-background)]/60 w-screen min-h-[100dvh] fixed inset-0",
        wrapper: "z-50 min-h-[100dvh] w-full flex flex-col justify-center items-center overflow-hidden",
        base: "z-50 flex min-h-[100dvh] w-full flex-col justify-start items-end outline-none bg-white dark:bg-[color:var(--ai-card-bg)]",
        body: "z-50 flex flex-col justify-start items-center w-full",
        header: "flex flex-row justify-between items-center w-full p-2 border-b border-[color:var(--ai-card-border)] text-[color:var(--ai-foreground)]",
        closeButton: "z-50 flex flex-row justify-end items-center rounded-full text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-card-border)]/40 dark:hover:bg-[color:var(--ai-card-border)]/20 p-2 pr-4 cursor-pointer scale-150",
    };

    // Merge default and custom classNames
    const mergedClassNames = mergeClassNames(defaultClassNames, classNames);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            hideCloseButton={hideCloseIcon}
            backdrop={backdrop ? backdrop : 'blur'}
            size={size}
            classNames={mergedClassNames}
            scrollBehavior={scrollBehavior ? scrollBehavior : 'inside'}
            isDismissable={isDismissable}
        >
            <ModalContent>
                {(closeModal) => (
                    <>
                        <ModalHeader>
                            {modalHeader}
                            {!hideCloseIcon && (
                                <div
                                    className="cursor-pointer p-2 rounded-full hover:bg-[color:var(--ai-card-border)]/40 dark:hover:bg-[color:var(--ai-card-border)]/20"
                                    onClick={handleClose}
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </div>
                            )}
                        </ModalHeader>
                        <ModalBody
                            className='flex flex-col gap-2 w-full h-full p-0'
                        >
                            {modalBody}
                        </ModalBody>
                        {!footerDisabled &&
                            <ModalFooter className='w-full flex flex-row justify-between gap-2 z-50'>
                                <div>
                                    {modalBottomComponent}
                                </div>
                                {footerButtonText &&
                                    <div className='flex flex-row justify-start gap-2 cursor-pointer'
                                        onClick={footerButtonClick}
                                    >
                                        {footerButtonText}
                                    </div>
                                }
                                {hideCloseButton ? '' :
                                    <Button
                                        color="danger"
                                        variant="light"
                                        className='text-[color:var(--ai-error)] bg-[color:var(--ai-error)]/10 hover:bg-[color:var(--ai-error)]/20'
                                        onClick={handleClose}
                                    >
                                        Close
                                    </Button>
                                }
                            </ModalFooter>
                        }
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}