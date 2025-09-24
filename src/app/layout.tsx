import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Navbar } from '@/components/layout/Navbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'StudyTour - Global Study & Summer Camp Directory',
  description: 'Discover amazing study tours, summer camps, and educational programs worldwide. Read reviews, compare options, and find your perfect adventure.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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