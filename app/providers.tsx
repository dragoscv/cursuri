'use client'
import { AppContextProvider } from "@/components/AppContext";
import { HeroUIProvider } from "@heroui/react";

export default function Providers({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <AppContextProvider>
                <HeroUIProvider>
                    {children}
                </HeroUIProvider>
            </AppContextProvider>
        </>
    )
}