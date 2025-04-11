'use client';

import {
    ToastProvider as ToastProviderComponent,
    useToast as useToastHook
} from './ToastContext';

export const ToastProvider = ToastProviderComponent;
export const useToast = useToastHook;
