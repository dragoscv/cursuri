'use client'
import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@/components/Toast/ToastContext";
import { SimpleProviders } from "@/components/contexts/SimpleProviders";
import SecurityInitializer from "@/components/SecurityInitializer";

export default function Providers({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SimpleProviders>
            <SecurityInitializer>
                <HeroUIProvider>
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                </HeroUIProvider>
            </SecurityInitializer>
        </SimpleProviders>
    );
}