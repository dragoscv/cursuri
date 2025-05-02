import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieConsent from '@/components/CookieConsent'
import BottomNavigation from '@/components/Header/BottomNavigation'
import { constructMetadata } from '@/utils/metadata'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="has-[section[role='dialog'][data-open='true']]:overflow-hidden transition-all ease-in-out duration-500">
      <head>
        <script src="https://unpkg.com/react-scan/dist/auto.global.js" async />
        {/* rest of your scripts go under */}
      </head>
      <body className={`${inter.className} bg-[rgb(var(--background-start-rgb))]`}>        <Providers>
        {/* Fixed header at the top */}
        <Header />

        {/* Main content area that starts below the header */}
        <div className="pt-8 bg-[rgb(var(--background-start-rgb))] min-h-screen">
          <main className="flex-grow pb-16 md:pb-0">
            {children}
          </main>
          <Footer />
        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation />

        {/* Cookie consent banner */}
        <CookieConsent />
      </Providers>
      </body>
    </html>
  )
}
