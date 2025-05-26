'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { ColorScheme } from '@/types';
import { useAuth } from './authContext';

// Theme types
type Theme = 'light' | 'dark' | 'system';

// Available color schemes
export const COLOR_SCHEMES: ColorScheme[] = [
    'modern-purple',
    'black-white',
    'green-neon',
    'blue-ocean',
    'brown-sunset',
    'yellow-morning',
    'red-blood',
    'pink-candy'
];

// Theme state interface
interface ThemeState {
    theme: Theme;
    isDark: boolean;
    colorScheme: ColorScheme;
    systemPrefersDark: boolean;
}

// Theme action types
type ThemeAction =
    | { type: 'SET_THEME'; payload: Theme }
    | { type: 'SET_IS_DARK'; payload: boolean }
    | { type: 'SET_COLOR_SCHEME'; payload: ColorScheme }
    | { type: 'SET_SYSTEM_PREFERS_DARK'; payload: boolean };

// Theme reducer
const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
    switch (action.type) {
        case 'SET_THEME': {
            const newTheme = action.payload;
            let isDark = state.isDark;

            if (newTheme === 'system') {
                isDark = state.systemPrefersDark;
            } else {
                isDark = newTheme === 'dark';
            }

            return { ...state, theme: newTheme, isDark };
        }
        case 'SET_IS_DARK':
            return { ...state, isDark: action.payload };
        case 'SET_COLOR_SCHEME':
            return { ...state, colorScheme: action.payload };
        case 'SET_SYSTEM_PREFERS_DARK': {
            const systemPrefersDark = action.payload;
            let isDark = state.isDark;

            // If using system theme, update isDark based on system preference
            if (state.theme === 'system') {
                isDark = systemPrefersDark;
            }

            return { ...state, systemPrefersDark, isDark };
        }
        default:
            return state;
    }
};

// Initial theme state
const initialThemeState: ThemeState = {
    theme: 'system',
    isDark: false,
    colorScheme: 'modern-purple',
    systemPrefersDark: false
};

// Theme context interface
interface ThemeContextType {
    // State
    theme: Theme;
    isDark: boolean;
    colorScheme: ColorScheme;
    systemPrefersDark: boolean;

    // Theme methods
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    setColorScheme: (scheme: ColorScheme) => void;

    // Utilities
    getEffectiveTheme: () => 'light' | 'dark';
    isSystemTheme: () => boolean;
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Custom hook to use theme context
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Theme provider props
interface ThemeProviderProps {
    children: ReactNode;
}

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(themeReducer, initialThemeState);
    const { saveUserPreferences, userPreferences } = useAuth();    // Check if browser supports system theme detection
    const supportsSystemTheme = useCallback(() => {
        return typeof window !== 'undefined' && window.matchMedia;
    }, []);

    // Get effective theme (resolved to light or dark)
    const getEffectiveTheme = useCallback((): 'light' | 'dark' => {
        return state.isDark ? 'dark' : 'light';
    }, [state.isDark]);

    // Check if using system theme
    const isSystemTheme = useCallback((): boolean => {
        return state.theme === 'system';
    }, [state.theme]);

    // Set theme
    const setTheme = useCallback((theme: Theme) => {
        dispatch({ type: 'SET_THEME', payload: theme });

        // Save to user preferences if authenticated
        if (userPreferences) {
            const isDark = theme === 'system' ? state.systemPrefersDark : theme === 'dark';
            saveUserPreferences({ isDark });
        }

        // Save to localStorage
        localStorage.setItem('theme', theme);
    }, [userPreferences, saveUserPreferences, state.systemPrefersDark]);

    // Toggle theme
    const toggleTheme = useCallback(() => {
        if (state.theme === 'system') {
            // If system theme, toggle to opposite of current effective theme
            setTheme(state.isDark ? 'light' : 'dark');
        } else {
            // If explicit theme, toggle between light and dark
            setTheme(state.theme === 'light' ? 'dark' : 'light');
        }
    }, [state.theme, state.isDark, setTheme]);

    // Set color scheme
    const setColorScheme = useCallback((scheme: ColorScheme) => {
        dispatch({ type: 'SET_COLOR_SCHEME', payload: scheme });

        // Save to user preferences if authenticated
        if (userPreferences) {
            saveUserPreferences({ colorScheme: scheme });
        }

        // Save to localStorage
        localStorage.setItem('colorScheme', scheme);
    }, [userPreferences, saveUserPreferences]);

    // Apply theme to document
    const applyThemeToDocument = useCallback(() => {
        if (typeof document === 'undefined') return;

        const html = document.documentElement;
        const body = document.body;

        // Remove existing theme classes
        html.classList.remove('light', 'dark');
        body.classList.remove(...COLOR_SCHEMES);

        // Add current theme class
        html.classList.add(getEffectiveTheme());

        // Add color scheme class
        body.classList.add(state.colorScheme);

        // Set CSS custom properties for theme
        const root = document.documentElement;
        root.style.setProperty('--theme', getEffectiveTheme());
        root.style.setProperty('--color-scheme', state.colorScheme);
    }, [getEffectiveTheme, state.colorScheme]);

    // Listen to system theme changes
    useEffect(() => {
        if (!supportsSystemTheme()) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        // Set initial system preference
        dispatch({ type: 'SET_SYSTEM_PREFERS_DARK', payload: mediaQuery.matches });

        // Listen for changes
        const handleChange = (e: MediaQueryListEvent) => {
            dispatch({ type: 'SET_SYSTEM_PREFERS_DARK', payload: e.matches });
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [supportsSystemTheme]);

    // Load saved theme preferences
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Load from user preferences if authenticated
        if (userPreferences) {
            dispatch({ type: 'SET_IS_DARK', payload: userPreferences.isDark });
            dispatch({ type: 'SET_COLOR_SCHEME', payload: userPreferences.colorScheme });

            // Determine theme based on user preferences
            const savedTheme = localStorage.getItem('theme') as Theme;
            if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
                dispatch({ type: 'SET_THEME', payload: savedTheme });
            } else {
                // If no saved theme, infer from isDark preference
                dispatch({ type: 'SET_THEME', payload: userPreferences.isDark ? 'dark' : 'light' });
            }
        } else {
            // Load from localStorage if not authenticated
            const savedTheme = localStorage.getItem('theme') as Theme;
            const savedColorScheme = localStorage.getItem('colorScheme') as ColorScheme;

            if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
                dispatch({ type: 'SET_THEME', payload: savedTheme });
            }

            if (savedColorScheme && COLOR_SCHEMES.includes(savedColorScheme)) {
                dispatch({ type: 'SET_COLOR_SCHEME', payload: savedColorScheme });
            }
        }
    }, [userPreferences]);

    // Apply theme to document when theme changes
    useEffect(() => {
        applyThemeToDocument();
    }, [applyThemeToDocument]);

    // Context value
    const value: ThemeContextType = {
        // State
        theme: state.theme,
        isDark: state.isDark,
        colorScheme: state.colorScheme,
        systemPrefersDark: state.systemPrefersDark,

        // Theme methods
        setTheme,
        toggleTheme,
        setColorScheme,

        // Utilities
        getEffectiveTheme,
        isSystemTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
