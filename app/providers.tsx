'use client'
import { AppContextProvider } from "@/components/AppContext";
import { HeroUIProvider } from "@heroui/react";
import { useContext, useEffect } from "react";
import { AppContext } from "@/components/AppContext";
import { ToastProvider } from "@/components/Toast/ToastContext";

// Theme provider wrapper to handle theme class application
function ThemeHandler({ children }: { children: React.ReactNode }) {
    const context = useContext(AppContext);

    useEffect(() => {
        if (!context) return;

        // Apply dark/light mode class to html element
        const htmlElement = document.documentElement;
        if (context.isDark) {
            htmlElement.classList.add('dark');
            htmlElement.classList.remove('light');
        } else {
            htmlElement.classList.add('light');
            htmlElement.classList.remove('dark');
        }        // Apply color scheme theme class
        if (context.colorScheme) {
            // Remove all theme classes first
            const themeClasses = [
                'theme-modern-purple',
                'theme-black-white',
                'theme-green-neon',
                'theme-blue-ocean',
                'theme-brown-sunset',
                'theme-yellow-morning',
                'theme-red-blood',
                'theme-pink-candy'
            ];
            themeClasses.forEach(cls => htmlElement.classList.remove(cls));

            // Add current theme class
            htmlElement.classList.add(`theme-${context.colorScheme}`);
        }
    }, [context?.isDark, context?.colorScheme]);

    return <>{children}</>;
}

export default function Providers({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <AppContextProvider>
                <HeroUIProvider>
                    <ToastProvider>
                        <ThemeHandler>
                            {children}
                        </ThemeHandler>
                    </ToastProvider>
                </HeroUIProvider>
            </AppContextProvider>
        </>
    )
}