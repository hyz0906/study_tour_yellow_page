'use client'

import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Navbar } from '@/components/layout/Navbar'

const inter = Inter({ subsets: ['latin'] })

type Props = {
  children: React.ReactNode
  params: { locale: string }
}

export default function LocaleLayout({
  children,
  params: { locale }
}: Props) {
  return (
    <html lang={locale}>
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}