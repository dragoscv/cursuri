import { useEffect } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
} from "@nextui-org/react";

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
export default function ModalComponent({ isOpen, onClose, hideCloseIcon, hideCloseButton, backdrop, size, scrollBehavior, isDismissable, modalHeader, modalBody, footerDisabled, footerButtonClick, footerButtonText, modalBottomComponent, classNames }: ModalProps) {


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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            hideCloseButton={hideCloseIcon}
            backdrop={backdrop ? backdrop : 'blur'}
            size={size}
            classNames={{
                backdrop: "z-50 backdrop-blur-md backdrop-saturate-150 bg-white/70 dark:bg-black/60 w-screen min-h-[100dvh] fixed inset-0",
                wrapper: "z-50 min-h-[100dvh] w-full flex flex-col justify-center items-center overflow-hidden",
                base: "z-50 flex min-h-[100dvh] w-full flex-col justify-start items-end outline-none",
                body: "z-50 flex flex-col justify-start items-center w-full",
                header: "flex flex-row justify-between items-center w-full p-2 border-b border-b-gray-200 dark:border-b-gray-200/20 text-gray-900 dark:text-gray-100",
                closeButton: "z-50 flex flex-row justify-end items-center rounded-full text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-800/20 p-2 pr-4 cursor-pointer scale-150",
            }}
            scrollBehavior={scrollBehavior ? scrollBehavior : 'inside'}
            isDismissable={isDismissable}
        >
            <ModalContent
            // className='max-h-[100dvh] overflow-hidden'
            >
                {(onClose) => (
                    <>
                        <ModalHeader>
                            {modalHeader}
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
                                        className='text-gray-900 dark:text-gray-100'
                                        onPress={onClose}
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