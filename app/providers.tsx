'use client'
import { AppContextProvider } from "@/components/AppContext";
import { NextUIProvider } from "@nextui-org/react";

export default function Providers({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <AppContextProvider>
                <NextUIProvider>
                    {children}
                </NextUIProvider>
            </AppContextProvider>
        </>
    )
}