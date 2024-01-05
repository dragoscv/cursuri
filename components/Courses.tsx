'use client'
import { useContext, useEffect, useCallback, useState } from "react"
import { AppContext } from "@/components/AppContext"
import Course from "@/components/Course/Course"
import { createCheckoutSession } from "@invertase/firestore-stripe-payments";
import { stripePayments } from "@/utils/firebase/stripe";
import { firebaseApp } from "@/utils/firebase/firebase.config";
import LoadingButton from "./Buttons/LoadingButton";
import Login from "./Login";


export default function Courses() {
    const [loadingPayment, setLoadingPayment] = useState(false)

    const context = useContext(AppContext)
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.")
    }
    const { courses, products, openModal, closeModal, userPaidProducts, user } = context

    const buyCourse = useCallback(async (priceId: string, courseId: string) => {
        if (!user) {
            openModal({
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
            })
            return
        }
        setLoadingPayment(true)
        console.log(priceId);

        const payments = stripePayments(firebaseApp);
        const session = await createCheckoutSession(payments, {
            price: priceId,
            allow_promotion_codes: true,
            mode: 'payment',
            metadata: {
                courseId: courseId
            }
        })
        setLoadingPayment(false)
        console.log(session);
        window.location.assign(session.url);

    }, [closeModal, openModal, user]);

    useEffect(() => {
        if (!courses.length) return
        console.log(courses);
    }, [courses]);

    return (
        <>
            <main className="flex flex-col h-full items-center justify-center p-24">
                {Object.keys(courses).map((key: any) => courses[key]).map((course: any) => (

                    <div key={course.id} id={course.id}
                        className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 cursor-pointer"

                    >

                        <img className="p-8 rounded-t-lg"
                            src={
                                products?.find((product: any) => product.id === course.priceProduct.id)?.images[0]
                            }
                            alt="product image"
                            onClick={() => openModal({
                                id: course.id,
                                isOpen: true,
                                hideCloseButton: false,
                                backdrop: 'blur',
                                size: 'full',
                                scrollBehavior: 'inside',
                                isDismissable: true,
                                modalHeader: `Course: ${course.name}`,
                                modalBody: <Course courseId={course.id} onClose={() => closeModal(course.id)} />,
                                headerDisabled: true,
                                footerDisabled: true,
                                noReplaceURL: true,
                                onClose: () => closeModal(course.id),
                            })}

                        />

                        <div className="px-5 pb-5">
                            <h5 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white"
                                onClick={() => openModal({
                                    id: course.id,
                                    isOpen: true,
                                    hideCloseButton: false,
                                    backdrop: 'blur',
                                    size: 'full',
                                    scrollBehavior: 'inside',
                                    isDismissable: true,
                                    modalHeader: `Course: ${course.name}`,
                                    modalBody: <Course courseId={course.id} onClose={() => closeModal(course.id)} />,
                                    headerDisabled: true,
                                    footerDisabled: true,
                                    noReplaceURL: true,
                                    onClose: () => closeModal(course.id),
                                })}
                            >
                                {course.name}
                            </h5>
                            <div className="flex items-center mt-2.5 mb-5"
                                onClick={() => openModal({
                                    id: course.id,
                                    isOpen: true,
                                    hideCloseButton: false,
                                    backdrop: 'blur',
                                    size: 'full',
                                    scrollBehavior: 'inside',
                                    isDismissable: true,
                                    modalHeader: `Course: ${course.name}`,
                                    modalBody: <Course courseId={course.id} onClose={() => closeModal(course.id)} />,
                                    headerDisabled: true,
                                    footerDisabled: true,
                                    noReplaceURL: true,
                                    onClose: () => closeModal(course.id),
                                })}
                            >
                                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                                    <svg className="w-4 h-4 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                                    </svg>
                                    <svg className="w-4 h-4 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                                    </svg>
                                    <svg className="w-4 h-4 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                                    </svg>
                                    <svg className="w-4 h-4 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                                    </svg>
                                    <svg className="w-4 h-4 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                                    </svg>
                                </div>
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ms-3">5.0</span>
                            </div>
                            <div className="flex items-center justify-between ">
                                <span className="text-3xl font-bold text-gray-900 dark:text-white"
                                    onClick={() => openModal({
                                        id: course.id,
                                        isOpen: true,
                                        hideCloseButton: false,
                                        backdrop: 'blur',
                                        size: 'full',
                                        scrollBehavior: 'inside',
                                        isDismissable: true,
                                        modalHeader: `Course: ${course.name}`,
                                        modalBody: <Course courseId={course.id} onClose={() => closeModal(course.id)} />,
                                        headerDisabled: true,
                                        footerDisabled: true,
                                        noReplaceURL: true,
                                        onClose: () => closeModal(course.id),
                                    })}
                                >
                                    {products?.find((product: any) => product.id === course.priceProduct.id)?.prices.find((price: any) => price.id === course.price)?.unit_amount / 100} {products?.find((product: any) => product.id === course.priceProduct.id)?.prices.find((price: any) => price.id === course.price)?.currency.toUpperCase()}
                                </span>
                                {userPaidProducts?.find((userPaidProduct: any) => userPaidProduct.metadata.courseId === course.id) ?
                                    <span className="text-green-500 text-sm font-semibold">Purchased</span>
                                    :
                                    <div className="">
                                        {loadingPayment ? <LoadingButton /> :
                                            <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                                onClick={() => buyCourse(products?.find((product: any) => product.id === course.priceProduct.id)?.prices.find((price: any) => price.id === course.price)?.id, course.id)}
                                            >Buy now</button>
                                        }
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                ))}
            </main>
        </>
    )
}