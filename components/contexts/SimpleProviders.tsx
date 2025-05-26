'use client'

import React, { ReactNode } from 'react';
import { AppContextProvider } from '../AppContext';

interface SimpleProvidersProps {
    children: ReactNode;
}

/**
 * Simple providers setup using the working monolithic AppContext
 * This disables the incomplete modular context system until migration is complete
 */
export const SimpleProviders: React.FC<SimpleProvidersProps> = ({ children }) => {
    return (
        <AppContextProvider>
            {children}
        </AppContextProvider>
    );
};
