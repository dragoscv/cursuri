

import React, { createContext, useState, useEffect, useReducer, useCallback } from 'react';
import { firebaseAuth, firebaseApp, firestoreDB } from '@/utils/firebase/firebase.config';
import { stripePayments } from '@/utils/firebase/stripe';
import { getProducts } from '@invertase/firestore-stripe-payments';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import ModalComponent from '@/components/Modal';

import { AppContextProps } from '@/types';

export const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDark, setIsDark] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    const initialState = {
        modals: [],
        products: [],
        isAdmin: false,
        courses: {},
        lessons: {},
        userPaidProducts: [],
        reviews: {}
    };

    const reducer = (state: any, action: any) => {
        switch (action.type) {
            case 'ADD_MODAL': {
                const existingModalIndex = state.modals.findIndex((modal: any) => modal.id === action.payload.id);
                if (existingModalIndex !== -1) {
                    // Modal with the specified id already exists. Update its properties.
                    return {
                        ...state,
                        modals: state.modals.map((modal: any, index: any) =>
                            index === existingModalIndex
                                ? {
                                    ...modal,
                                    isOpen: true,
                                    size: action.payload.size,
                                    scrollBehavior: action.payload.scrollBehavior,
                                    isDismissable: action.payload.isDismissable,
                                    backdrop: action.payload.backdrop,
                                    hideCloseButton: action.payload.hideCloseButton,
                                    hideCloseIcon: action.payload.hideCloseIcon,
                                    modalBody: action.payload.modalBody,
                                    headerDisabled: action.payload.headerDisabled,
                                    modalHeader: action.payload.modalHeader,
                                    footerDisabled: action.payload.footerDisabled,
                                    footerButtonText: action.payload.footerButtonText,
                                    footerButtonClick: action.payload.footerButtonClick,
                                    noReplaceURL: action.payload.noReplaceURL,
                                    modalBottomComponent: action.payload.modalBottomComponent,
                                }
                                : modal
                        ),
                    };
                } else {
                    // Modal with the specified id does not exist. Add the new modal to the modalProps array.
                    return { ...state, modals: [...state.modals, action.payload] };
                }
            }
            case 'CLOSE_MODAL':
                return {
                    ...state,
                    modals: state.modals.map((modal: any) =>
                        modal.id === action.payload
                            ? { ...modal, isOpen: false }
                            : modal
                    )
                };
            case 'UPDATE_MODAL':
                return {
                    ...state,
                    modals: state.modals.map((modal: any) =>
                        modal.id === action.payload.id
                            ? { ...modal, ...action.payload }
                            : modal
                    )
                };
            case 'SET_PRODUCTS':
                return {
                    ...state,
                    products: action.payload
                };
            case 'SET_IS_ADMIN':
                return {
                    ...state,
                    isAdmin: action.payload
                };
            case 'SET_COURSES':
                // console.log(action.payload);
                return {
                    ...state,
                    courses: {
                        ...state.courses,
                        [action.payload.courseId]: action.payload.course
                    }
                };
            case 'SET_LESSONS':
                return {
                    ...state,
                    lessons: {
                        ...state.lessons,
                        [action.payload.courseId]: {
                            ...state.lessons[action.payload.courseId],
                            [action.payload.lessonId]: action.payload.lesson
                        }
                    }
                };
            case 'SET_REVIEWS':
                return {
                    ...state,
                    reviews: {
                        ...state.reviews,
                        [action.payload.courseId]: {
                            ...state.reviews[action.payload.courseId],
                            [action.payload.reviewId]: action.payload.review
                        }
                    }
                };
            case 'SET_USER_PAID_PRODUCTS':
                return {
                    ...state,
                    userPaidProducts: action.payload
                };
            default:
                return state;
        }
    };

    const [state, dispatch] = useReducer(reducer, initialState);

    const toggleTheme = () => {
        setIsDark(!isDark);
    };

    // This code sets the modal props for the modal component.
    const openModal = useCallback((props: any) => {
        dispatch({ type: 'ADD_MODAL', payload: props });
    }, [dispatch]);

    const closeModal = useCallback((id: string) => {
        dispatch({ type: 'CLOSE_MODAL', payload: id });
    }, [dispatch]);

    const updateModal = useCallback((props: any) => {
        dispatch({ type: 'UPDATE_MODAL', payload: props });
    }, [dispatch]);

    const getCourseLessons = useCallback(async (courseId: string) => {

        const lessons = state.lessons;
        if (Object.keys(lessons).includes(courseId)) {
            return;
        }

        const docRef = collection(firestoreDB, `courses/${courseId}/lessons`);
        const q = query(docRef, where("status", "==", "active"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                data.id = doc.id;
                dispatch({ type: 'SET_LESSONS', payload: { courseId: courseId, lessonId: doc.id, lesson: data } });
            });
        });
    }, [state.lessons]);

    const getCourseReviews = useCallback(async (courseId: string) => {
        const reviews = state.reviews;
        if (Object.keys(reviews).includes(courseId)) {
            return;
        }

        const docRef = collection(firestoreDB, `courses/${courseId}/reviews`);
        const q = query(docRef);
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                data.id = doc.id;
                dispatch({ type: 'SET_REVIEWS', payload: { courseId: courseId, reviewId: doc.id, review: data } });
            });
        });
    }, [state.reviews]);

    useEffect(() => {
        onAuthStateChanged(firebaseAuth, (user) => {
            if (user) {
                // console.log('user', user);
                setUser(user);
                if (user.email === 'vladulescu.catalin@gmail.com') {
                    dispatch({ type: 'SET_IS_ADMIN', payload: true });
                } else {
                    dispatch({ type: 'SET_IS_ADMIN', payload: false });
                }
            } else {
                setUser(null);
            }
        });
    }, []);


    //This code fetches the products from Stripe.
    useEffect(() => {
        const payments = stripePayments(firebaseApp);
        getProducts(payments, {
            includePrices: true,
            activeOnly: true,
        }).then((products) => {
            console.log(products);
            dispatch({ type: 'SET_PRODUCTS', payload: products });
        });
    }, []);

    //This code fetches the courses from Firestore.
    useEffect(() => {
        const fetchCourses = async () => {
            const q = query(collection(firestoreDB, "courses"), where("status", "==", "active"));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                data.id = doc.id;
                dispatch({ type: 'SET_COURSES', payload: { courseId: doc.id, course: data } });

            });
        }
        fetchCourses();
    }, []);

    //This code fetches the user paid products from Firestore.
    useEffect(() => {
        if (user) {
            const collectionRef = collection(firestoreDB, `customers/${user.uid}/payments`);
            const q = query(collectionRef);
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const userPaidProducts: any = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    data.id = doc.id;
                    if (data.status === 'succeeded') userPaidProducts.push(data);
                });
                console.log(userPaidProducts);
                dispatch({ type: 'SET_USER_PAID_PRODUCTS', payload: userPaidProducts });
            });
            return unsubscribe;
        } else {
            dispatch({ type: 'SET_USER_PAID_PRODUCTS', payload: [] });
        }
    }, [user]);




    return (
        <AppContext.Provider value={{
            isDark, toggleTheme,
            user,
            isAdmin: state.isAdmin,
            openModal, closeModal, updateModal,
            products: state.products,
            courses: state.courses,
            lessons: state.lessons,
            getCourseLessons,
            userPaidProducts: state.userPaidProducts,
            reviews: state.reviews,
            getCourseReviews
        }}>
            {children}
            {state.modals.map((modal: any) => (
                <ModalComponent key={modal.id} {...modal} />
            ))}
        </AppContext.Provider>
    );
};