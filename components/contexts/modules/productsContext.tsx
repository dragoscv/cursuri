'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { firestoreDB } from '../../../utils/firebase/firebase.config';
import { useAuth } from './authContext';
import { useCache } from './cacheContext';
import { UserPaidProduct } from '@/types';
import { getStripePayments, getProducts } from 'firewand';
import { firebaseApp } from '@/utils/firebase/firebase.config';

// Products state interface
interface ProductsState {
    products: any[]; // Use proper Stripe product type when available
    userPaidProducts: UserPaidProduct[];
    productsLoadingState: 'idle' | 'loading' | 'success' | 'error';
    userPaidProductsLoadingState: 'idle' | 'loading' | 'success' | 'error';
}

// Products actions
type ProductsAction =
    | { type: 'SET_PRODUCTS_LOADING' }
    | { type: 'SET_PRODUCTS_SUCCESS'; payload: any[] }
    | { type: 'SET_PRODUCTS_ERROR' }
    | { type: 'SET_USER_PAID_PRODUCTS_LOADING' }
    | { type: 'SET_USER_PAID_PRODUCTS_SUCCESS'; payload: UserPaidProduct[] }
    | { type: 'SET_USER_PAID_PRODUCTS_ERROR' };

// Products reducer
const productsReducer = (state: ProductsState, action: ProductsAction): ProductsState => {
    switch (action.type) {
        case 'SET_PRODUCTS_LOADING':
            return { ...state, productsLoadingState: 'loading' };

        case 'SET_PRODUCTS_SUCCESS':
            return {
                ...state,
                products: action.payload,
                productsLoadingState: 'success'
            };

        case 'SET_PRODUCTS_ERROR':
            return { ...state, productsLoadingState: 'error' };

        case 'SET_USER_PAID_PRODUCTS_LOADING':
            return { ...state, userPaidProductsLoadingState: 'loading' };

        case 'SET_USER_PAID_PRODUCTS_SUCCESS':
            return {
                ...state,
                userPaidProducts: action.payload,
                userPaidProductsLoadingState: 'success'
            };

        case 'SET_USER_PAID_PRODUCTS_ERROR':
            return { ...state, userPaidProductsLoadingState: 'error' };

        default:
            return state;
    }
};

// Initial products state
const initialState: ProductsState = {
    products: [],
    userPaidProducts: [],
    productsLoadingState: 'idle',
    userPaidProductsLoadingState: 'idle'
};

// Products context interface
export interface ProductsContextType extends ProductsState {
    fetchProducts: () => Promise<void>;
    fetchUserPaidProducts: () => Promise<void>;
}

// Create context
const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

// Provider props
interface ProductsProviderProps {
    children: ReactNode;
}

// Provider component
export const ProductsProvider: React.FC<ProductsProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(productsReducer, initialState);
    const { user } = useAuth();
    const { getCachedData, setCachedData } = useCache();

    // Cache keys
    const PRODUCTS_CACHE_KEY = 'stripe_products';
    const USER_PAID_PRODUCTS_CACHE_KEY = `user_paid_products_${user?.uid || 'anonymous'}`;

    // Fetch Stripe products
    const fetchProducts = useCallback(async () => {
        // Check cache first
        const cached = getCachedData<any[]>(PRODUCTS_CACHE_KEY);
        if (cached && cached.length > 0) {
            dispatch({ type: 'SET_PRODUCTS_SUCCESS', payload: cached });
            return;
        }

        dispatch({ type: 'SET_PRODUCTS_LOADING' });

        try {
            // Initialize Stripe payments
            const payments = getStripePayments(firebaseApp, {
                productsCollection: 'products',
                customersCollection: 'customers',
            });

            // Get products from Stripe
            const productsData = await getProducts(payments);
            
            if (productsData) {
                // Cache the result
                setCachedData(PRODUCTS_CACHE_KEY, productsData);
                dispatch({ type: 'SET_PRODUCTS_SUCCESS', payload: productsData });
            } else {
                dispatch({ type: 'SET_PRODUCTS_ERROR' });
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            dispatch({ type: 'SET_PRODUCTS_ERROR' });
        }
    }, [getCachedData, setCachedData]);

    // Fetch user paid products
    const fetchUserPaidProducts = useCallback(async () => {
        if (!user) {
            dispatch({ type: 'SET_USER_PAID_PRODUCTS_SUCCESS', payload: [] });
            return;
        }

        // Check cache first
        const cached = getCachedData<UserPaidProduct[]>(USER_PAID_PRODUCTS_CACHE_KEY);
        if (cached && cached.length > 0) {
            dispatch({ type: 'SET_USER_PAID_PRODUCTS_SUCCESS', payload: cached });
            return;
        }

        dispatch({ type: 'SET_USER_PAID_PRODUCTS_LOADING' });

        try {
            // Query purchases collection for this user
            const userPurchasesQuery = query(
                collection(firestoreDB, `customers/${user.uid}/payments`),
                where('status', '==', 'succeeded')
            );

            const paymentsSnapshot = await getDocs(userPurchasesQuery);
            const paidProducts: UserPaidProduct[] = [];

            paymentsSnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.metadata?.courseId) {
                    paidProducts.push({
                        id: doc.id,
                        productId: data.product || '',
                        metadata: {
                            courseId: data.metadata.courseId,
                            userId: user.uid,
                            ...data.metadata
                        },
                        status: data.status,
                        purchaseDate: data.created ? new Date(data.created * 1000).toISOString() : undefined,
                        created: data.created
                    });
                }
            });

            // Cache the result
            setCachedData(USER_PAID_PRODUCTS_CACHE_KEY, paidProducts);
            dispatch({ type: 'SET_USER_PAID_PRODUCTS_SUCCESS', payload: paidProducts });
        } catch (error) {
            console.error('Error fetching user paid products:', error);
            dispatch({ type: 'SET_USER_PAID_PRODUCTS_ERROR' });
        }
    }, [user, getCachedData, setCachedData]);

    // Fetch products and user paid products when the component mounts
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Fetch user paid products when the user changes
    useEffect(() => {
        if (user) {
            fetchUserPaidProducts();
        } else {
            dispatch({ type: 'SET_USER_PAID_PRODUCTS_SUCCESS', payload: [] });
        }
    }, [user, fetchUserPaidProducts]);

    const contextValue: ProductsContextType = {
        ...state,
        fetchProducts,
        fetchUserPaidProducts
    };

    return (
        <ProductsContext.Provider value={contextValue}>
            {children}
        </ProductsContext.Provider>
    );
};

// Custom hook to use products context
export function useProducts() {
    const context = useContext(ProductsContext);
    if (context === undefined) {
        throw new Error('useProducts must be used within a ProductsProvider');
    }
    return context;
}

export default ProductsContext;
