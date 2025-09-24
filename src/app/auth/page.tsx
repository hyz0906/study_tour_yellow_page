'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthForm } from '@/components/auth/AuthForm'
import { useAuth } from '@/hooks/useAuth'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <AuthForm mode={mode} onModeChange={setMode} />
    </div>
  )
}